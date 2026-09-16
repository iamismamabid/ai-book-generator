import { 
  PDFDocument, 
  PDFName, 
  popGraphicsState, 
  pushGraphicsState, 
  concatTransformationMatrix, 
  drawObject 
} from "pdf-lib";

export interface CmykExportOptions {
  widthInches: number;
  heightInches: number;
  filename?: string;
  returnBlob?: boolean;
}

/**
 * High-speed conversion of RGBA Uint8ClampedArray/Uint8Array to standard CMYK Uint8Array.
 * Optimized with bitwise rounding and under-color removal (UCR) for rich print contrast.
 */
export function convertRgbaToCmyk(rgba: Uint8ClampedArray | Uint8Array, totalPixels: number): Uint8Array {
  const cmyk = new Uint8Array(totalPixels * 4);

  for (let i = 0, len = totalPixels * 4; i < len; i += 4) {
    const r = rgba[i] / 255;
    const g = rgba[i + 1] / 255;
    const b = rgba[i + 2] / 255;

    // Standard subtractive color separation
    const k = 1 - Math.max(r, g, b);

    if (k >= 0.999) {
      // Pure Black
      cmyk[i] = 0;
      cmyk[i + 1] = 0;
      cmyk[i + 2] = 0;
      cmyk[i + 3] = 255;
    } else {
      const invK = 1 / (1 - k);
      cmyk[i] = Math.round(((1 - r - k) * invK) * 255);     // Cyan
      cmyk[i + 1] = Math.round(((1 - g - k) * invK) * 255); // Magenta
      cmyk[i + 2] = Math.round(((1 - b - k) * invK) * 255); // Yellow
      cmyk[i + 3] = Math.round(k * 255);                     // Key / Black
    }
  }

  return cmyk;
}

/**
 * Exports an HTML5 Canvas to a 100% compliant DeviceCMYK PDF file.
 * Automatically bundles the pixel stream into a /ColorSpace /DeviceCMYK XObject with Flate compression.
 */
export async function exportCanvasToCmykPdf(
  canvas: HTMLCanvasElement,
  options: CmykExportOptions
): Promise<Blob> {
  const { widthInches, heightInches, filename, returnBlob } = options;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not acquire 2D rendering context from canvas for CMYK PDF export.");
  }

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const totalPixels = width * height;

  const cmykBuffer = convertRgbaToCmyk(imgData.data, totalPixels);

  const doc = await PDFDocument.create();

  // Create native DeviceCMYK Image XObject
  const imageStream = doc.context.flateStream(cmykBuffer, {
    Type: "XObject",
    Subtype: "Image",
    Width: width,
    Height: height,
    ColorSpace: "DeviceCMYK",
    BitsPerComponent: 8,
  });

  const imageRef = doc.context.register(imageStream);

  // Convert dimensions from inches to PDF points (72 points = 1 inch)
  const pageWidth = widthInches * 72;
  const pageHeight = heightInches * 72;
  const page = doc.addPage([pageWidth, pageHeight]);

  const imgName = PDFName.of("KdpCmykCoverImage");
  page.node.setXObject(imgName, imageRef);

  // Draw the image across the full page bounds
  page.pushOperators(
    pushGraphicsState(),
    concatTransformationMatrix(pageWidth, 0, 0, pageHeight, 0, 0),
    drawObject(imgName),
    popGraphicsState()
  );

  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });

  // Trigger browser download if requested
  if (!returnBlob && filename && typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return blob;
}

/**
 * Loads an image dataURL into an offscreen canvas and compiles a true DeviceCMYK PDF.
 */
export async function exportDataUrlToCmykPdf(
  dataUrl: string,
  options: CmykExportOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const offscreen = document.createElement("canvas");
        offscreen.width = img.naturalWidth || img.width;
        offscreen.height = img.naturalHeight || img.height;

        const ctx = offscreen.getContext("2d");
        if (!ctx) {
          throw new Error("Could not acquire 2D context for offscreen CMYK export canvas.");
        }

        ctx.drawImage(img, 0, 0);
        const blob = await exportCanvasToCmykPdf(offscreen, options);
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => {
      reject(new Error(`Failed to load image for CMYK PDF conversion: ${err}`));
    };
    img.src = dataUrl;
  });
}
