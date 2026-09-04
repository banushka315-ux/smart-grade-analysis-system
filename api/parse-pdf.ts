import { GoogleGenAI, Type } from "@google/genai";
import * as pdfParseModule from "pdf-parse";
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { parseResultText } from "../src/lib/pdfParser";
import { runTesseractOCR } from "../src/lib/ocrService";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // use raw body if parse fails
      }
    }

    const { base64Data, fileName, mimeType: incomingMime } = body || {};

    if (!base64Data) {
      return res.status(400).json({ error: "Missing base64Data parameter." });
    }

    // Determine mime type and clean base64 string
    let mimeType = incomingMime || "application/pdf";
    if (base64Data.startsWith("data:")) {
      const match = base64Data.match(/^data:(image\/[a-zA-Z]+|application\/pdf);base64,/);
      if (match) {
        mimeType = match[1];
      }
    }

    const cleanBase64 = base64Data.replace(/^data:(image\/[a-zA-Z]+|application\/pdf);base64,/, "");
    const fileBuffer = Buffer.from(cleanBase64, "base64");

    let extractedText = "";
    let isScanned = false;

    if (mimeType === "application/pdf") {
      try {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text || "";
      } catch (parseErr) {
        console.warn("pdf-parse extraction notice:", parseErr);
      }

      if (extractedText.trim().length < 80) {
        isScanned = true;
      }
    } else {
      isScanned = true;
    }

    let parsedStudents: any[] = [];
    let methodUsed = "regex";
    let ocrAttempted = false;
    let ocrConfidence = 0;

    // 1. Try Gemini Multimodal OCR / Document AI Engine if API key present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        ocrAttempted = isScanned;
        methodUsed = isScanned ? "gemini-ocr-multimodal" : "gemini-ai";

        const ocrPrompt = `You are an expert Optical Character Recognition (OCR) engine and University Result Gazette Parser.
${isScanned ? "CRITICAL INSTRUCTION: This document is a SCANNED or IMAGE-BASED result sheet. Perform full visual OCR recognition to transcribe all text, tables, student details, roll/enrollment numbers, names, subject codes, grades, CGPAs, and pass/fail status." : "Analyze the following university result document data."}

Extract into a structured JSON object:
1. "universityName": Name of the university or institute (e.g. NIT, State University).
2. "department": Department or course (e.g. Computer Science & Engineering).
3. "batch": Batch year (e.g. 2022-2026).
4. "semester": Semester (e.g. Semester VI).
5. "students": An array of student result objects.

For each student extract:
- "enrollment": Enrollment or Roll Number (string)
- "name": Student Full Name (string)
- "cgpa": CGPA as a number (e.g. 8.41)
- "result": "PASS" or "FAIL"
- "subjects": Array of objects containing:
  - "code": Subject code (e.g. "CS301")
  - "name": Subject name (e.g. "Data Structures")
  - "grade": Grade awarded ("A+", "A", "B+", "B", "C+", "C", "D", "F", "ABS")

Extract all student records accurately without inventing fake data.
${!isScanned && extractedText ? `Pre-extracted Text Context:\n${extractedText.slice(0, 15000)}` : ""}
`;

        const contents: any[] = [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: ocrPrompt,
          },
        ];

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                universityName: { type: Type.STRING },
                department: { type: Type.STRING },
                batch: { type: Type.STRING },
                semester: { type: Type.STRING },
                students: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      enrollment: { type: Type.STRING },
                      name: { type: Type.STRING },
                      cgpa: { type: Type.NUMBER },
                      result: { type: Type.STRING },
                      subjects: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            code: { type: Type.STRING },
                            name: { type: Type.STRING },
                            grade: { type: Type.STRING },
                          },
                          required: ["code", "name", "grade"],
                        },
                      },
                    },
                    required: ["enrollment", "name", "cgpa", "result", "subjects"],
                  },
                },
              },
              required: ["students"],
            },
          },
        });

        const jsonText = aiResponse.text?.trim() || "{}";
        const resultData = JSON.parse(jsonText);

        if (resultData.students && Array.isArray(resultData.students) && resultData.students.length > 0) {
          return res.status(200).json({
            success: true,
            method: methodUsed,
            isScanned,
            ocrAttempted,
            universityName: resultData.universityName || "University Result Gazette",
            department: resultData.department || "General Department",
            batch: resultData.batch || "2022 - 2026",
            semester: resultData.semester || "Semester VI",
            students: resultData.students,
            rawTextSnippet: (extractedText || jsonText).slice(0, 500),
          });
        }
      } catch (aiErr) {
        console.error("Gemini OCR/AI parsing fallback triggered:", aiErr);
      }
    }

    // 2. Tesseract.js OCR Engine Fallback for scanned image buffers
    if (mimeType.startsWith("image/")) {
      try {
        ocrAttempted = true;
        const ocrRes = await runTesseractOCR(fileBuffer);
        if (ocrRes.success && ocrRes.text) {
          extractedText = ocrRes.text;
          ocrConfidence = ocrRes.confidence || 0;
          parsedStudents = parseResultText(extractedText);
          methodUsed = "tesseract-ocr";
        }
      } catch (ocrErr) {
        console.error("Tesseract.js OCR error:", ocrErr);
      }
    } else {
      parsedStudents = parseResultText(extractedText);
    }

    if (parsedStudents.length === 0) {
      return res.status(422).json({
        success: false,
        isScanned,
        ocrAttempted,
        error: isScanned
          ? "Optical Character Recognition (OCR) failed to detect legible student records in the scanned document. Please ensure the scan is clear, unblurred, and has adequate contrast."
          : "Could not automatically parse student records from the PDF. Please verify that the PDF contains valid result tables.",
        rawTextSnippet: extractedText.slice(0, 1000),
      });
    }

    return res.status(200).json({
      success: true,
      method: methodUsed,
      isScanned,
      ocrAttempted,
      ocrConfidence,
      universityName: "University Examination Board",
      department: "Academic Results",
      batch: "2022-2026",
      semester: "Semester VI",
      students: parsedStudents,
      rawTextSnippet: extractedText.slice(0, 500),
    });
  } catch (error: any) {
    console.error("PDF/OCR Serverless Processing Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process document via serverless OCR pipeline.",
    });
  }
}
