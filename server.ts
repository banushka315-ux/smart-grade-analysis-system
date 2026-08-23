import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfParseModule from "pdf-parse";
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { createServer as createViteServer } from "vite";
import { parseResultText } from "./src/lib/pdfParser.js";
import { runTesseractOCR } from "./src/lib/ocrService.js";

const app = express();
const PORT = 3000;

// Increase payload limit for PDF uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * POST /api/parse-pdf
 * Expects { base64Data: string, fileName?: string, mimeType?: string }
 * Seamlessly handles native text PDFs, scanned image PDFs, and direct result images via OCR.
 */
app.post("/api/parse-pdf", async (req, res) => {
  try {
    const { base64Data, fileName, mimeType: incomingMime } = req.body;

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

      // If PDF text is empty or under 80 chars, mark as scanned image-based PDF
      if (extractedText.trim().length < 80) {
        isScanned = true;
      }
    } else {
      // Directly uploaded image file (PNG, JPG, WEBP scan)
      isScanned = true;
    }

    let parsedStudents: any[] = [];
    let methodUsed = "regex";
    let ocrAttempted = false;
    let ocrConfidence = 0;

    // 1. Try Gemini Multimodal OCR / Document AI Engine
    if (process.env.GEMINI_API_KEY) {
      try {
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
          return res.json({
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
    } else if (isScanned && extractedText.trim().length > 0) {
      parsedStudents = parseResultText(extractedText);
    } else if (!isScanned) {
      parsedStudents = parseResultText(extractedText);
    }

    if (parsedStudents.length === 0) {
      // Clear error handling for OCR / extraction failures
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

    return res.json({
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
    console.error("PDF/OCR Processing Error:", error);
    res.status(500).json({ error: error.message || "Failed to process document via OCR pipeline." });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
