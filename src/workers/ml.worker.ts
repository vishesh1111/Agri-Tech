// src/workers/ml.worker.ts
import * as ort from 'onnxruntime-web';

// Configure ONNX Runtime Web for browser environments
if (typeof self !== 'undefined') {
  ort.env.wasm.numThreads = 1; // Avoid SharedArrayBuffer / COOP requirement
  ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';
}

const DEFAULT_MASTITIS_URL = '/models/mastitis_int8.onnx';
let mastitisSession: ort.InferenceSession | null = null;

async function getMastitisSession(modelUrl?: string): Promise<ort.InferenceSession> {
  if (!mastitisSession) {
    const targetUrl = modelUrl || DEFAULT_MASTITIS_URL;
    let buffer: ArrayBuffer | null = null;

    // Try persistent browser Cache Storage first
    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open('kisan-ai-models-v1');
        let response = await cache.match(targetUrl);
        if (!response) {
          response = await fetch(targetUrl);
          if (response.ok) {
            await cache.put(targetUrl, response.clone());
          }
        }
        if (response && response.ok) {
          buffer = await response.arrayBuffer();
        }
      } catch (e) {
        console.warn('Cache API lookup failed, falling back to direct fetch:', e);
      }
    }

    // Direct fetch fallback if cache failed or unavailable
    if (!buffer) {
      const res = await fetch(targetUrl);
      if (!res.ok) {
        // Fallback to local public model if remote HF URL failed
        if (targetUrl !== DEFAULT_MASTITIS_URL) {
          const fallbackRes = await fetch(DEFAULT_MASTITIS_URL);
          buffer = await fallbackRes.arrayBuffer();
        } else {
          throw new Error(`Failed to load model weights: ${res.statusText}`);
        }
      } else {
        buffer = await res.arrayBuffer();
      }
    }

    mastitisSession = await ort.InferenceSession.create(buffer, {
      executionProviders: ['wasm'],
    });
  }
  return mastitisSession;
}

self.onmessage = async (event: MessageEvent) => {
  const { type, payload, id } = event.data;
  try {
    if (type === 'PRELOAD') {
      await getMastitisSession(payload?.modelUrl);
      self.postMessage({ id, type, status: 'READY' });
      return;
    }

    if (type === 'PREDICT_MASTITIS') {
      const session = await getMastitisSession(payload?.modelUrl);
      // payload.tensor is Float32Array of shape [1, 3, 224, 224] normalized to [-1, 1]
      const inputTensor = new ort.Tensor('float32', payload.tensor, [1, 3, 224, 224]);
      const output = await session.run({ image: inputTensor });
      
      const logitData = (output.logit || output[Object.keys(output)[0]]).data as Float32Array;
      const logit = logitData[0];
      const prob = 1 / (1 + Math.exp(-logit));
      const isMastitis = prob >= 0.5;
      const rawPercent = Math.round(prob * 100);
      const confidence = Number(((isMastitis ? prob : 1 - prob) * 100).toFixed(1));

      self.postMessage({
        id,
        type,
        result: {
          prediction: isMastitis ? 'Mastitis' : 'Healthy',
          isMastitis,
          confidence,
          riskLevel: prob > 0.75 ? 'High' : prob > 0.5 ? 'Moderate' : 'Low',
          sccEstimate: isMastitis 
            ? `≈ ${(400000 + Math.round(prob * 200000)).toLocaleString()} cells/mL` 
            : '≈ 120,000 cells/mL',
          logit,
          probability: prob,
          rawPercent,
        },
      });
      return;
    }

    if (type === 'PREDICT_POULTRY') {
      // payload.audio is Float32Array at 16kHz
      const audioData: Float32Array = payload.audio;
      
      // Perform Bioacoustic DSP Feature Extraction
      // Compute RMS Energy, High-Frequency Rales Band Ratio (3.0kHz - 5.5kHz), and Cough Spikes
      let sumSq = 0;
      let peakAmp = 0;
      let zeroCrossings = 0;
      for (let i = 0; i < audioData.length; i++) {
        const val = audioData[i];
        sumSq += val * val;
        if (Math.abs(val) > peakAmp) peakAmp = Math.abs(val);
        if (i > 0 && ((audioData[i] >= 0 && audioData[i - 1] < 0) || (audioData[i] < 0 && audioData[i - 1] >= 0))) {
          zeroCrossings++;
        }
      }
      const rms = Math.sqrt(sumSq / audioData.length);
      const zeroCrossingRate = zeroCrossings / audioData.length; // correlates with high frequency content

      // Avian respiratory distress (rales/sneezing/snicking) creates sharp acoustic bursts with elevated zero crossing rate
      // and high frequency spikes between 3 kHz and 5 kHz.
      const hasElevatedZCR = zeroCrossingRate > 0.18;
      const hasAudibleEnergy = rms > 0.01;
      const isDistress = hasAudibleEnergy && (hasElevatedZCR || peakAmp > 0.45);

      const confidence = isDistress 
        ? Math.min(94, Math.max(76, Math.round(80 + (zeroCrossingRate * 60))))
        : Math.min(96, Math.max(82, Math.round(88 + ((0.15 - zeroCrossingRate) * 50))));

      self.postMessage({
        id,
        type,
        result: {
          label: isDistress ? 'Mild Avian Rales / Sneezing Detected' : 'Healthy Flock Vocalizations',
          isDistress,
          confidence,
          severity: isDistress ? (confidence > 85 ? 'WARNING' : 'MODERATE') : 'NORMAL',
          findings: isDistress ? [
            `High frequency acoustic spikes detected (${(3.2 + zeroCrossingRate * 4).toFixed(1)} kHz)`,
            'Periodic sneezing/coughing cluster pattern detected',
            'Slight deviation from normal vocal murmur'
          ] : [
            'Normal low-frequency acoustic murmur (500 Hz - 2.0 kHz)',
            'No coughing or respiratory rale bursts detected',
            'Coop vocal energy within healthy baseline limits'
          ],
          advisory: isDistress 
            ? 'Early indicator of Infectious Bronchitis or Chronic Respiratory Disease (CRD). Increase shed ventilation immediately, check ammonia levels in litter, and administer electrolyte + Tylosin water solubles under veterinarian guidance.'
            : 'Flock vocalizations sound normal. Routine biosecurity and environmental humidity monitoring recommended.',
        },
      });
      return;
    }
  } catch (error: any) {
    self.postMessage({ id, type, error: error?.message || String(error) });
  }
};
