import { PDFDocument } from 'pdf-lib';

/**
 * Takes the original PDF bytes and an array of annotated canvas data URLs
 * (one per page), draws each annotation layer onto the corresponding PDF page,
 * and returns the final merged PDF bytes.
 */
export async function exportAnnotatedPDF(
  originalFile: File,
  annotationDataURLs: (string | null)[]
): Promise<Uint8Array> {
  const originalBytes = await originalFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const annotationDataURL = annotationDataURLs[i];
    if (!annotationDataURL) continue;

    const page = pages[i];
    const { width, height } = page.getSize();

    // Convert data URL to bytes
    const base64 = annotationDataURL.split(",")[1];
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) {
      bytes[j] = binaryStr.charCodeAt(j);
    }

    // Embed the annotation layer as a PNG image
    const annotImg = await pdfDoc.embedPng(bytes.buffer as ArrayBuffer);

    // Draw it over the full page (annotations sit on top of content)
    page.drawImage(annotImg, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 1,
    });
  }

  return pdfDoc.save();
}
