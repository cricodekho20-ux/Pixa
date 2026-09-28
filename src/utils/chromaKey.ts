export interface ChromaKeyOptions {
  color: string; // hex #rrggbb
  tolerance: number; // 0 to 100
  feather: number; // 0 to 50
  edgeSmoothing: number; // 0 to 20
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export async function processChromaKey(
  imageSrc: string,
  options: ChromaKeyOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const target = hexToRgb(options.color);
      const maxDistance = 441.67; // sqrt(255^2 + 255^2 + 255^2)
      const tolNorm = (options.tolerance / 100) * maxDistance;
      const featherNorm = (options.feather / 100) * maxDistance;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Euclidean distance in RGB color space
        const dr = r - target.r;
        const dg = g - target.g;
        const db = b - target.b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= tolNorm) {
          // Pixel matches chroma key color within tolerance -> full transparent
          data[i + 3] = 0;
        } else if (dist < tolNorm + featherNorm && featherNorm > 0) {
          // Smooth feathered transition
          const factor = (dist - tolNorm) / featherNorm;
          data[i + 3] = Math.round(a * Math.min(1, Math.max(0, factor)));
        }
      }

      // Simple box blur edge smoothing on alpha channel if requested
      if (options.edgeSmoothing > 0) {
        const w = canvas.width;
        const h = canvas.height;
        const radius = Math.min(4, Math.max(1, Math.round(options.edgeSmoothing / 4)));
        const alphaCopy = new Uint8Array(w * h);

        for (let idx = 0; idx < w * h; idx++) {
          alphaCopy[idx] = data[idx * 4 + 3];
        }

        for (let y = radius; y < h - radius; y++) {
          for (let x = radius; x < w - radius; x++) {
            const currentA = alphaCopy[y * w + x];
            // Only smooth transition borders (where alpha is between 0 and 255)
            if (currentA > 0 && currentA < 255) {
              let sum = 0;
              let count = 0;
              for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                  sum += alphaCopy[(y + dy) * w + (x + dx)];
                  count++;
                }
              }
              data[(y * w + x) * 4 + 3] = Math.round(sum / count);
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
}

// AI Smart Background Isolation (automatically detects background color from perimeter and removes it)
export async function smartAutoRemoveBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Context not found'));

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample 4 corners and perimeter to get background color average
      const sampleIndices = [
        0, // top-left
        (w - 1) * 4, // top-right
        ((h - 1) * w) * 4, // bottom-left
        ((h - 1) * w + (w - 1)) * 4, // bottom-right
        Math.floor(w / 2) * 4, // top-mid
        Math.floor((h - 1) * w + w / 2) * 4, // bottom-mid
      ];

      let avgR = 0, avgG = 0, avgB = 0;
      sampleIndices.forEach(idx => {
        avgR += data[idx];
        avgG += data[idx + 1];
        avgB += data[idx + 2];
      });
      avgR = Math.round(avgR / sampleIndices.length);
      avgG = Math.round(avgG / sampleIndices.length);
      avgB = Math.round(avgB / sampleIndices.length);

      const tolerance = 48; // default smart tolerance
      const feather = 20;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - avgR;
        const dg = data[i + 1] - avgG;
        const db = data[i + 2] - avgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= tolerance) {
          data[i + 3] = 0;
        } else if (dist < tolerance + feather) {
          data[i + 3] = Math.round(data[i + 3] * ((dist - tolerance) / feather));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}
