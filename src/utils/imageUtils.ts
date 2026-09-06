/**
 * Utility functions for image processing, formatting, and downloads.
 */

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getImageDimensions(source: string | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof source === 'string' ? source : URL.createObjectURL(source);

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      if (typeof source !== 'string') {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = (err) => {
      if (typeof source !== 'string') {
        URL.revokeObjectURL(url);
      }
      reject(err);
    };

    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Composites the transparent cutout on top of a custom background color or canvas.
 */
export async function compositeImageWithBackground(
  cutoutBlob: Blob,
  backgroundColor: string,
  width?: number,
  height?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(cutoutBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = width || img.naturalWidth || 800;
      const h = height || img.naturalHeight || 600;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw background
      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw cutout
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      const mimeType = backgroundColor === 'transparent' ? 'image/png' : 'image/png';
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas conversion failed'));
        }
      }, mimeType, 0.95);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }
    // Ensure blob is image/png
    let pngBlob = blob;
    if (blob.type !== 'image/png') {
      pngBlob = await compositeImageWithBackground(blob, 'transparent');
    }
    const item = new ClipboardItem({ 'image/png': pngBlob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Failed to copy to clipboard:', err);
    return false;
  }
}
