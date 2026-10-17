// src/lib/utils/imageCompressor.ts

/**
 * Compresses any image (File, Blob, or Data URL) to max 800x800 JPEG with 0.7 quality (~50-80 KB).
 * This guarantees requests never exceed Vercel Functions' 4.5 MB body ceiling.
 */
export async function compressImageForGemini(
  input: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<{ base64: string; dataUrl: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    let src = '';
    let objectUrlToRevoke: string | null = null;

    if (typeof input === 'string') {
      src = input;
    } else {
      src = URL.createObjectURL(input);
      objectUrlToRevoke = src;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Unable to create 2D canvas context for compression');
        }

        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1] || '';
        const sizeBytes = Math.round((base64.length * 3) / 4);

        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }

        resolve({ base64, dataUrl, sizeBytes });
      } catch (err) {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(new Error('Failed to load image for client-side compression: ' + err));
    };

    img.src = src;
  });
}

/**
 * Preprocesses an image to 224x224 Float32Array normalized with mean 0.5, std 0.5 (scaled to [-1, 1])
 * in NCHW format [1, 3, 224, 224] for ONNX Runtime Web.
 */
export async function preprocessImageForMastitis(
  input: File | Blob | string
): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    let src = '';
    let objectUrlToRevoke: string | null = null;

    if (typeof input === 'string') {
      src = input;
    } else {
      src = URL.createObjectURL(input);
      objectUrlToRevoke = src;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const targetSize = 224;
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
        const { data } = imgData; // RGBA uint8 array of length 224 * 224 * 4

        // NCHW format: [1, 3, 224, 224]
        // Mean = [0.5, 0.5, 0.5], Std = [0.5, 0.5, 0.5]
        // Formula: ((val / 255.0) - 0.5) / 0.5 = (val / 127.5) - 1.0
        const totalPixels = targetSize * targetSize;
        const float32Array = new Float32Array(3 * totalPixels);

        const rOffset = 0;
        const gOffset = totalPixels;
        const bOffset = totalPixels * 2;

        for (let i = 0; i < totalPixels; i++) {
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];

          float32Array[rOffset + i] = (r / 255.0 - 0.5) / 0.5;
          float32Array[gOffset + i] = (g / 255.0 - 0.5) / 0.5;
          float32Array[bOffset + i] = (b / 255.0 - 0.5) / 0.5;
        }

        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }

        resolve(float32Array);
      } catch (err) {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(new Error('Failed to load image for mastitis preprocessing: ' + err));
    };

    img.src = src;
  });
}
