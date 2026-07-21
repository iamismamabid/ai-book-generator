import JSZip from "jszip";

export interface EpubChapter {
  title: string;
  content: string; // plain text, paragraphs separated by newlines
}

export interface EpubOptions {
  title: string;
  author: string;
  chapters: EpubChapter[];
  language?: string;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paragraphsToXhtml(content: string): string {
  return content
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${escapeXml(p).replace(/\r?\n/g, "<br/>")}</p>`)
    .join("\n");
}

// Splits a raw manuscript (from .txt or a mammoth-extracted .docx) into chapters.
// Looks for lines like "Chapter 1", "CHAPTER ONE", or markdown "# Heading" as
// chapter breaks; falls back to treating the whole document as one chapter.
export function splitManuscriptIntoChapters(rawText: string): EpubChapter[] {
  const text = rawText.replace(/\r\n/g, "\n").trim();
  const lines = text.split("\n");

  const chapterHeadingPattern = /^(chapter\s+\w+\b.*|#{1,2}\s+.+)$/i;
  const breakpoints: { index: number; title: string }[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length <= 80 && chapterHeadingPattern.test(trimmed)) {
      breakpoints.push({ index: idx, title: trimmed.replace(/^#{1,2}\s+/, "") });
    }
  });

  if (breakpoints.length === 0) {
    return [{ title: "Chapter 1", content: text }];
  }

  const chapters: EpubChapter[] = [];
  breakpoints.forEach((bp, i) => {
    const start = bp.index + 1;
    const end = i + 1 < breakpoints.length ? breakpoints[i + 1].index : lines.length;
    const content = lines.slice(start, end).join("\n").trim();
    if (content.length > 0) {
      chapters.push({ title: bp.title, content });
    }
  });

  return chapters.length > 0 ? chapters : [{ title: "Chapter 1", content: text }];
}

// Builds a real, spec-valid EPUB3 file (with an EPUB2 NCX for older-reader
// compatibility) entirely client-side and returns it as a downloadable Blob.
export async function generateEpub({ title, author, chapters, language = "en" }: EpubOptions): Promise<Blob> {
  const zip = new JSZip();
  const uid = `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;

  // The mimetype file must be the first entry and stored uncompressed.
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const css = `body { font-family: Georgia, serif; line-height: 1.5; margin: 1em; }
h1 { text-align: center; font-size: 1.5em; margin-top: 2em; }
p { margin: 0 0 1em 0; text-indent: 1.2em; }
p:first-of-type { text-indent: 0; }
.title-page { text-align: center; margin-top: 30%; }
.title-page h1 { font-size: 2em; }
.title-page p { text-indent: 0; }`;
  zip.file("OEBPS/css/style.css", css);

  zip.file(
    "OEBPS/text/titlepage.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(title)}</title><link rel="stylesheet" type="text/css" href="../css/style.css"/></head>
<body>
  <div class="title-page">
    <h1>${escapeXml(title)}</h1>
    <p>By ${escapeXml(author)}</p>
  </div>
</body>
</html>`
  );

  chapters.forEach((chapter, i) => {
    zip.file(
      `OEBPS/text/chapter${i + 1}.xhtml`,
      `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(chapter.title)}</title><link rel="stylesheet" type="text/css" href="../css/style.css"/></head>
<body>
  <h1>${escapeXml(chapter.title)}</h1>
  ${paragraphsToXhtml(chapter.content)}
</body>
</html>`
    );
  });

  const manifestItems = [
    `<item id="titlepage" href="text/titlepage.xhtml" media-type="application/xhtml+xml"/>`,
    ...chapters.map((_, i) => `<item id="chapter${i + 1}" href="text/chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`),
    `<item id="css" href="css/style.css" media-type="text/css"/>`,
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
  ].join("\n    ");

  const spineItems = [
    `<itemref idref="titlepage"/>`,
    ...chapters.map((_, i) => `<itemref idref="chapter${i + 1}"/>`),
  ].join("\n    ");

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${uid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().split(".")[0]}Z</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`
  );

  const navPoints = [
    `<li><a href="text/titlepage.xhtml">Title Page</a></li>`,
    ...chapters.map((c, i) => `<li><a href="text/chapter${i + 1}.xhtml">${escapeXml(c.title)}</a></li>`),
  ].join("\n      ");

  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Table of Contents</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${navPoints}
    </ol>
  </nav>
</body>
</html>`
  );

  const navMapPoints = [
    { title: "Title Page", src: "text/titlepage.xhtml" },
    ...chapters.map((c, i) => ({ title: c.title, src: `text/chapter${i + 1}.xhtml` })),
  ]
    .map(
      (p, i) => `<navPoint id="navpoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(p.title)}</text></navLabel>
      <content src="${p.src}"/>
    </navPoint>`
    )
    .join("\n    ");

  zip.file(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uid}"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <navMap>
    ${navMapPoints}
  </navMap>
</ncx>`
  );

  return zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
