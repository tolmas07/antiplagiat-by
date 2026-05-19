import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

export class TextExtractor {
  static async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Ошибка при извлечении текста из DOCX: ${error}`);
    }
  }

  static async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      throw new Error(`Ошибка при извлечении текста из PDF: ${error}`);
    }
  }

  static async extract(buffer: Buffer, fileType: string): Promise<string> {
    if (fileType === 'docx') {
      return this.extractFromDocx(buffer);
    } else if (fileType === 'pdf') {
      return this.extractFromPdf(buffer);
    } else {
      throw new Error(`Неподдерживаемый тип файла: ${fileType}`);
    }
  }

  static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\wа-яё\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
