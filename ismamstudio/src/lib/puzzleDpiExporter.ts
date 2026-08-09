/**
 * 300 DPI Exporter Helper Utility for Puzzle Generators
 * KDP / IngramSpark Print-Ready Standard (300 DPI / Dots Per Inch)
 */

export interface DpiDimensions {
  widthInches: number;
  heightInches: number;
  dpi: number;
  pixelWidth: number;
  pixelHeight: number;
}

export const TRIM_SIZE_INCHES: Record<string, { w: number; h: number }> = {
  "8.5x11": { w: 8.5, h: 11 },
  "6x9": { w: 6, h: 9 },
  "5x8": { w: 5, h: 8 },
};

/**
 * Calculates exact 300 DPI pixel dimensions for physical page trim sizes.
 */
export function get300DpiDimensions(trimSize: "8.5x11" | "6x9" | "5x8" = "8.5x11"): DpiDimensions {
  const inches = TRIM_SIZE_INCHES[trimSize] || TRIM_SIZE_INCHES["8.5x11"];
  const dpi = 300;
  return {
    widthInches: inches.w,
    heightInches: inches.h,
    dpi,
    pixelWidth: Math.round(inches.w * dpi),
    pixelHeight: Math.round(inches.h * dpi),
  };
}

/**
 * Helper to download an offscreen high-res canvas or data URL as a 300 DPI PNG file.
 */
export function download300DpiPng(dataUrl: string, fileName: string) {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName.endsWith(".png") ? fileName : `${fileName}-300dpi.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Renders an existing HTML Canvas or SVG node onto a 300 DPI offscreen Canvas and returns the PNG data URL.
 */
export async function renderElementTo300DpiPng(
  element: HTMLElement | SVGSVGElement | HTMLCanvasElement,
  trimSize: "8.5x11" | "6x9" | "5x8" = "8.5x11"
): Promise<string> {
  const { pixelWidth, pixelHeight } = get300DpiDimensions(trimSize);

  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = pixelWidth;
  offscreenCanvas.height = pixelHeight;
  const ctx = offscreenCanvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get 2D context for 300 DPI canvas");

  // Fill crisp white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, pixelWidth, pixelHeight);

  if (element instanceof HTMLCanvasElement) {
    ctx.drawImage(element, 0, 0, pixelWidth, pixelHeight);
    return offscreenCanvas.toDataURL("image/png");
  }

  // Handle SVG or HTML DOM element rendering to high-res canvas
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(element);

  // Inject width/height attributes if missing
  if (!svgString.includes("xmlns=")) {
    svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight);
      URL.revokeObjectURL(url);
      resolve(offscreenCanvas.toDataURL("image/png"));
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
