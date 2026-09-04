import { createWorker } from 'tesseract.js';

export interface OCRResult {
  success: boolean;
  text: string;
  confidence?: number;
  error?: string;
}

/**
 * Runs Tesseract.js OCR on an image (Buffer, File, Blob, or base64 data URL).
 * Converts scanned visual text into machine-readable text.
 */
export async function runTesseractOCR(imageInput: any): Promise<OCRResult> {
  let worker: any = null;
  try {
    worker = await createWorker('eng');
    const result = await worker.recognize(imageInput);
    const extractedText = result?.data?.text || '';
    const confidence = result?.data?.confidence || 0;

    await worker.terminate();

    if (!extractedText.trim()) {
      return {
        success: false,
        text: '',
        confidence: 0,
        error: 'Tesseract OCR produced empty output. The scan may be blurry or unreadable.'
      };
    }

    return {
      success: true,
      text: extractedText,
      confidence
    };
  } catch (err: any) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (_) {
        // ignore cleanup error
      }
    }
    console.error('Tesseract OCR Exception:', err);
    return {
      success: false,
      text: '',
      error: err?.message || 'Tesseract OCR processing failed.'
    };
  }
}
