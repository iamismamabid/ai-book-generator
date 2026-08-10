import { PDFDocument } from "pdf-lib";
import { getGutterMargin } from "./gutterMargin";

export interface ImageResolutionCheck {
  label: string;
  effectiveDpi: number;
  isLowRes: boolean;
}

// KDP flags cover images under ~300 DPI as likely to print blurry. Interior
// puzzle grids never need this check -- they're drawn as vector shapes/text,
// so they're resolution-independent by construction. Only the raster cover
// images (frontCoverImage/backCoverImage/fullCoverImage from Cover Studio)
// carry real DPI risk, since they're user-uploaded bitmaps stretched to fill
// a fixed print area.
export async function checkCoverImageResolution(
  coverState: any,
  trimWidthIn: number,
  trimHeightIn: number
): Promise<ImageResolutionCheck[]> {
  if (typeof window === "undefined" || !coverState) return [];
  const bleed = 0.125;

  const targets: { src: string; label: string; wIn: number; hIn: number }[] = [];

  if (coverState.fullCoverImage) {
    const spineWidth = coverState.spineWidth || 0.2;
    targets.push({
      src: coverState.fullCoverImage,
      label: "Full Wraparound Cover Image",
      wIn: trimWidthIn * 2 + spineWidth + bleed * 2,
      hIn: trimHeightIn + bleed * 2,
    });
  } else {
    if (coverState.frontCoverImage) {
      targets.push({
        src: coverState.frontCoverImage,
        label: "Front Cover Image",
        wIn: trimWidthIn + bleed,
        hIn: trimHeightIn + bleed * 2,
      });
    }
    if (coverState.backCoverImage) {
      targets.push({
        src: coverState.backCoverImage,
        label: "Back Cover Image",
        wIn: trimWidthIn + bleed,
        hIn: trimHeightIn + bleed * 2,
      });
    }
  }

  const results = await Promise.all(
    targets.map(
      (t) =>
        new Promise<ImageResolutionCheck | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (!img.naturalWidth || !img.naturalHeight) return resolve(null);
            const dpiX = img.naturalWidth / t.wIn;
            const dpiY = img.naturalHeight / t.hIn;
            const effectiveDpi = Math.round(Math.min(dpiX, dpiY));
            resolve({ label: t.label, effectiveDpi, isLowRes: effectiveDpi < 300 });
          };
          img.onerror = () => resolve(null);
          img.src = t.src;
        })
    )
  );

  return results.filter((r): r is ImageResolutionCheck => r !== null);
}

export interface PdfValidationReport {
  success: boolean;
  pageCount: number;
  widthInches: number;
  heightInches: number;
  detectedTrimSize: string;
  isStandardSize: boolean;
  requiredGutterInches: number;
  warnings: string[];
  errors: string[];
  recommendation: string;
}

const COMMON_TRIM_SIZES = [
  { name: "6x9", width: 6.0, height: 9.0 },
  { name: "8.5x11", width: 8.5, height: 11.0 },
  { name: "5x8", width: 5.0, height: 8.0 },
  { name: "5.5x8.5", width: 5.5, height: 8.5 },
  { name: "8x10", width: 8.0, height: 10.0 },
  { name: "7x10", width: 7.0, height: 10.0 }
];

export async function validatePdfLayout(fileBuffer: ArrayBuffer): Promise<PdfValidationReport> {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, { 
      updateMetadata: false 
    });
    const pageCount = pdfDoc.getPageCount();

    if (pageCount < 24) {
      errors.push(`KDP requires a minimum of 24 pages for a paperback book. Your file has ${pageCount} page(s).`);
    } else if (pageCount > 828) {
      errors.push(`KDP maximum page count is 828 pages for black and white, or less for color. Your file has ${pageCount} pages.`);
    }

    const firstPage = pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize(); // Returns size in points

    // Convert points to inches (1 inch = 72 points)
    const widthInches = Number((width / 72).toFixed(3));
    const heightInches = Number((height / 72).toFixed(3));

    // Find standard size match with tolerance (0.125 inches)
    let detectedTrimSize = "Custom Size";
    let isStandardSize = false;
    
    for (const size of COMMON_TRIM_SIZES) {
      if (Math.abs(widthInches - size.width) <= 0.125 && Math.abs(heightInches - size.height) <= 0.125) {
        detectedTrimSize = `${size.width}" x ${size.height}" (${size.name})`;
        isStandardSize = true;
        break;
      }
    }

    if (!isStandardSize) {
      warnings.push(`The trim size (${widthInches}" x ${heightInches}") does not exactly match standard KDP dimensions. Verify this is intentional.`);
    }

    const requiredGutterInches = getGutterMargin(pageCount);

    let recommendation = "";
    if (errors.length > 0) {
      recommendation = "Please resolve the errors above before publishing on Amazon KDP.";
    } else {
      recommendation = `This file looks ready for KDP. Ensure your design files set inside margins to at least ${requiredGutterInches} inches for the binding gutter.`;
    }

    return {
      success: errors.length === 0,
      pageCount,
      widthInches,
      heightInches,
      detectedTrimSize,
      isStandardSize,
      requiredGutterInches,
      warnings,
      errors,
      recommendation
    };
  } catch (err) {
    console.error("PDF validation failed:", err);
    return {
      success: false,
      pageCount: 0,
      widthInches: 0,
      heightInches: 0,
      detectedTrimSize: "Unknown",
      isStandardSize: false,
      requiredGutterInches: 0.375,
      warnings: [],
      errors: ["Could not parse the PDF file. Please ensure it is a valid, uncorrupted PDF document."],
      recommendation: "Ensure the file uploaded is a valid, readable PDF."
    };
  }
}
