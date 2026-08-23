import { createWorker } from 'tesseract.js';

export interface OCRResult {
  success: boolean;
  text: string;
  confidence?: number;
  error?: string;
}

/**
 * Runs local Tesseract.js OCR on an image buffer (PNG, JPEG, WEBP, BMP).
 * Converts scanned visual text into machine-readable text.
 */
export async function runTesseractOCR(imageBuffer: Buffer): Promise<OCRResult> {
  let worker: any = null;
  try {
    worker = await createWorker('eng');
    const result = await worker.recognize(imageBuffer);
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
