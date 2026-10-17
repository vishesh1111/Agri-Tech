// src/lib/utils/audioUtils.ts

/**
 * Decodes any recorded audio Blob (e.g. webm, mp4, wav) directly in the browser
 * to a 16,000 Hz Mono Float32Array PCM suitable for Transformers.js and bioacoustic ML inference.
 * Completely eliminates the need for ffmpeg or remote Python servers.
 */
export async function blobTo16kHzFloat32(audioBlob: Blob): Promise<Float32Array> {
  const arrayBuffer = await audioBlob.arrayBuffer();

  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Resample to 16,000 Hz using OfflineAudioContext if sample rates differ
    if (decodedBuffer.sampleRate === 16000) {
      return decodedBuffer.getChannelData(0);
    }

    const targetSampleRate = 16000;
    const durationSeconds = decodedBuffer.duration;
    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(durationSeconds * targetSampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    return resampledBuffer.getChannelData(0);
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close();
    }
  }
}
