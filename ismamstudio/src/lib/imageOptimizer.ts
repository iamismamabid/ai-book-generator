/**
 * Client-Side Image Optimizer for Canvas Performance & Memory Guard
 *
 * Prevents Out-Of-Memory (OOM) crashes by pre-scaling and compressing high-resolution
 * or phone photos (often 15MB-50MB uncompressed raw bitmaps) before they enter the
 * Fabric.js canvas, undo/redo history stacks, or local storage drafts.
 */

export interface ImageOptimizeOptions {
  maxDimension?: number; // Maximum width or height in pixels (default: 2400)
  quality?: number; // Compression quality for opaque images (default: 0.90)
  maxDataUrlLength?: number; // Size in chars where optimization is triggered (default: 1,500,000 ~ 1.1MB)
}

/**
 * Checks if a Canvas context contains transparent pixels
 */
function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // Sample a sparse grid rather than checking all millions of pixels to keep it fast
    const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 40));
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha < 250) {
          return true;
        }
      }
    }
  } catch {
    // In case of security/CORS restrictions, assume false
  }
  return false;
}

/**
 * Optimizes an image (File, Blob, or Data/HTTP URL) to a safe memory footprint.
 * Returns a clean data URL suitable for Fabric.js canvas and serialization.
 */
export async function optimizeImageForCanvas(
  source: File | Blob | string,
  options: ImageOptimizeOptions = {}
): Promise<string> {
  const maxDim = options.maxDimension ?? 2400;
  const quality = options.quality ?? 0.90;
  const maxDataUrlLen = options.maxDataUrlLength ?? 1_500_000;

  // 1. Resolve source to an image element or string URL
  let initialUrl = "";
  let isBlobUrl = false;

  if (typeof source === "string") {
    initialUrl = source;
  } else if (source instanceof Blob) {
    initialUrl = URL.createObjectURL(source);
    isBlobUrl = true;
  } else {
    return "";
  }

  // If already a compact data URL or small SVG, return directly
  if (typeof source === "string" && source.startsWith("data:image/svg+xml")) {
    return source;
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      if (isBlobUrl && initialUrl) {
        URL.revokeObjectURL(initialUrl);
      }
    };

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // If image is already reasonably small and source is already a short data URL, return it
        if (
          origW <= maxDim &&
          origH <= maxDim &&
          typeof source === "string" &&
          source.startsWith("data:") &&
          source.length < maxDataUrlLen
        ) {
          cleanup();
          resolve(source);
          return;
        }

        // Calculate proportional dimensions fitting inside maxDim x maxDim
        let targetW = origW;
        let targetH = origH;

        if (origW > maxDim || origH > maxDim) {
          const ratio = Math.min(maxDim / origW, maxDim / origH);
          targetW = Math.max(1, Math.round(origW * ratio));
          targetH = Math.max(1, Math.round(origH * ratio));
        }

        // Draw onto an offscreen canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          cleanup();
          resolve(initialUrl);
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Determine format: keep PNG only if alpha transparency exists; otherwise use JPEG for 80%+ memory savings
        const isTransparent = hasTransparency(ctx, targetW, targetH);
        const mimeType = isTransparent ? "image/png" : "image/jpeg";
        const optimizedDataUrl = canvas.toDataURL(mimeType, quality);

        // Immediate memory release: reset canvas dimensions so V8/browser frees the raw bitmap buffer
        canvas.width = 0;
        canvas.height = 0;
        img.src = "";
        cleanup();

        resolve(optimizedDataUrl);
      } catch (err) {
        console.warn("Image optimization fallback:", err);
        cleanup();
        resolve(initialUrl);
      }
    };

    img.onerror = () => {
      console.warn("Failed to load image for optimization, using original");
      cleanup();
      resolve(initialUrl);
    };

    img.src = initialUrl;
  });
}
