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

        const ocrPrompt = `You are an expert Optical Character Recognition (OCR) engine and University Result Gazette / Marksheet Parser.
Your job is to extract the EXACT student result records printed in the document with 100% precision and zero omission.

CRITICAL EXTRACTION RULES:
1. Extract EVERY SINGLE student record listed in the document without omitting any student.
2. "enrollment": Extract the exact Roll Number / Enrollment Number / Reg No / ID / Seat No printed as a string.
3. "name": Extract the exact Full Name of the student as printed on the document. Do NOT invent generic placeholders like "Student 1" unless no name is printed.
4. "cgpa": Extract the exact CGPA, SGPA, GPA, SPI/CPI, or overall percentage number (e.g. 8.41 or 84.5). If missing, calculate from grade points (O/A+=10, A=9, B+=8, B=7, C+=6, C=5, D=4, P=4, F/ABS=0).
5. "sgpa": Extract the exact SGPA number. If missing, set equal to CGPA.
6. "result": Extract "PASS" or "FAIL" based on status. If student has 'F' or 'ABS' or 'FAIL', mark as "FAIL".
7. "subjects": Extract all subject grades awarded to the student:
   - "code": Subject code (e.g. "CS301", "KCS601", "MATH101").
   - "name": Full subject title if printed. If subject title is omitted in table, use the subject code as the subject name.
   - "grade": Grade awarded ("O", "A+", "A", "B+", "B", "C+", "C", "D", "P", "F", "ABS").

Extract overall document metadata:
- "universityName": Printed University, Board, Institute, or College Name.
- "department": Branch or Department Name (e.g., Computer Science Engineering).
- "batch": Academic Batch (e.g., 2022-2026).
- "semester": Semester (e.g., Semester VI).
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

        let aiResponse: any = null;
        try {
          aiResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
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
                        sgpa: { type: Type.NUMBER },
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
        } catch (primaryErr) {
          console.warn("gemini-2.0-flash attempt notice, trying gemini-1.5-flash fallback:", primaryErr);
          aiResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: contents,
            config: {
              responseMimeType: "application/json",
            },
          });
        }

        const jsonText = aiResponse?.text?.trim() || "{}";
        const resultData = JSON.parse(jsonText);

        if (resultData.students && Array.isArray(resultData.students) && resultData.students.length > 0) {
          const sanitizedStudents = resultData.students.map((st: any, idx: number) => {
            const enrollmentStr = String(st.enrollment || `REG${1000 + idx}`).trim().toUpperCase();
            const nameStr = st.name && !st.name.startsWith('Student ')
              ? st.name.trim()
              : `Student (${enrollmentStr})`;
            const calcCgpa = typeof st.cgpa === 'number' && !isNaN(st.cgpa)
              ? Number(st.cgpa.toFixed(2))
              : typeof st.sgpa === 'number' && !isNaN(st.sgpa)
              ? Number(st.sgpa.toFixed(2))
              : 7.0;

            const subs = (st.subjects || []).map((s: any, sIdx: number) => ({
              code: String(s.code || `SUB${sIdx + 1}`).toUpperCase(),
              name: String(s.name || s.code || `Subject ${sIdx + 1}`).trim(),
              grade: String(s.grade || 'A').toUpperCase()
            }));

            const hasFailGrade = subs.some((s: any) => ['F', 'ABS', 'FAIL', 'AB'].includes(s.grade));
            const resStatus = st.result
              ? (String(st.result).toUpperCase().includes('FAIL') ? 'FAIL' : 'PASS')
              : (hasFailGrade ? 'FAIL' : 'PASS');

            return {
              enrollment: enrollmentStr,
              name: nameStr,
              cgpa: calcCgpa,
              sgpa: typeof st.sgpa === 'number' && !isNaN(st.sgpa) ? Number(st.sgpa.toFixed(2)) : calcCgpa,
              result: resStatus,
              subjects: subs
            };
          });

          return res.status(200).json({
            success: true,
            method: methodUsed,
            isScanned,
            ocrAttempted,
            universityName: resultData.universityName || "University Examination Board",
            department: resultData.department || "Academic Results",
            batch: resultData.batch || "2022 - 2026",
            semester: resultData.semester || "Semester VI",
            students: sanitizedStudents,
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
