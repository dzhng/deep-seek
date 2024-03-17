import pdfParse from 'pdf-parse';

export type ProcessedPdf = {
  text: string;
};

export async function processPdf(
  url: string,
): Promise<ProcessedPdf | undefined> {
  try {
    console.info(`Processing PDF: ${url}`);
    const response = await fetch(url);
    const pdfContent = await response.arrayBuffer();

    const pdfBuffer = Buffer.from(pdfContent);

    const options = {};
    const pdfData = await pdfParse(pdfBuffer, options);
    const text = pdfData.text.trim();

    return { text };
  } catch (e) {
    console.error('Error procesing PDF', e);
  }
}
