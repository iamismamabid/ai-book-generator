// KDP's required inner-margin gutter, keyed by book page count. Split out of
// pdfFormatter.ts so lightweight consumers (image-resolution validation) can
// use it without statically pulling in jsPDF + JSZip via that module's other
// exports -- those libs should only load when a PDF is actually generated.
export function getGutterMargin(pageCount: number): number {
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.500;
  if (pageCount <= 500) return 0.625;
  if (pageCount <= 700) return 0.750;
  return 0.875;
}
