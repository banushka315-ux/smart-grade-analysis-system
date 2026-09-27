import { GoogleGenAI, Type } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { parseResultText } from "../src/lib/pdfParser";

const parsePdfBuffer = async (buffer: Buffer) => {
  const parser = new PDFParse({ data: buffer });
  try {
    return await parser.getText();
  } finally {
    await parser.destroy();
  }
};

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
        const pdfData = await parsePdfBuffer(fileBuffer);
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
  3. "name": Extract the exact Full Name printed on the document. Omit records without a printed name; never invent one.
  4. "cgpa": Extract only the exact printed CGPA/GPA value. Do not substitute SGPA or percentage and do not calculate a missing value.
  5. "sgpa": Extract only the exact printed SGPA value. Omit it if absent.
  6. "result": Extract the printed result status. If absent, infer FAIL only when a subject explicitly has F/ABS; otherwise leave it unknown.
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

        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-3.6-flash"];
        let aiResponse: any = null;

        for (const modelName of modelsToTry) {
          try {
            aiResponse = await ai.models.generateContent({
              model: modelName,
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
                                marks: { type: Type.NUMBER },
                              },
                              required: ["code", "name"],
                            },
                          },
                        },
                        required: ["enrollment", "name", "subjects"],
                      },
                    },
                  },
                  required: ["students"],
                },
              },
            });

            if (aiResponse && aiResponse.text) break;
          } catch (mErr) {
            console.warn(`Model ${modelName} attempt notice:`, mErr);
          }
        }

        const jsonText = aiResponse?.text?.trim() || "{}";
        const resultData = JSON.parse(jsonText);

        if (resultData.students && Array.isArray(resultData.students) && resultData.students.length > 0) {
          const sanitizedStudents = resultData.students.flatMap((st: any) => {
            const enrollment = typeof st.enrollment === 'string' ? st.enrollment.trim() : '';
            const name = typeof st.name === 'string' ? st.name.trim() : '';
            const aggregateField = /\b(CGPA|SGPA|GPA|TOTAL|GRAND TOTAL|RESULT|PERCENTAGE|CREDIT)\b/i;
            const subjects = Array.isArray(st.subjects) ? st.subjects.flatMap((subject: any) => {
              const code = typeof subject.code === 'string' ? subject.code.trim().toUpperCase() : '';
              const subjectName = typeof subject.name === 'string' ? subject.name.trim() : '';
              const grade = typeof subject.grade === 'string' ? subject.grade.trim().toUpperCase() : '';
              const marks = Number(subject.marks);
              const hasMarks = subject.marks !== undefined && subject.marks !== null && subject.marks !== '' && Number.isFinite(marks);
              if (!code || !subjectName || (!grade && !hasMarks) || aggregateField.test(code) || aggregateField.test(subjectName)) return [];
              return [{ code, name: subjectName, grade, ...(hasMarks ? { marks } : {}) }];
            }) : [];
            if (!enrollment || !name || !subjects.length) return [];

            const rawResult = typeof st.result === 'string' ? st.result.toUpperCase() : '';
            const result = /^(PASS|PASSED|PROMOTED)$/.test(rawResult)
              ? 'PASS'
              : /^(FAIL|FAILED|DETAINED)$/.test(rawResult)
                ? 'FAIL'
                : subjects.some((subject: any) => ['F', 'ABS', 'AB', 'FAIL'].includes(subject.grade))
                  ? 'FAIL'
                  : subjects.some((subject: any) => ['O', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P'].includes(subject.grade))
                    ? 'PASS'
                    : 'UNKNOWN';
            return [{
              enrollment,
              name,
              result,
              subjects,
              ...(typeof st.cgpa === 'number' && Number.isFinite(st.cgpa) ? { cgpa: st.cgpa } : {}),
              ...(typeof st.sgpa === 'number' && Number.isFinite(st.sgpa) ? { sgpa: st.sgpa } : {}),
            }];
          });

          if (sanitizedStudents.length) return res.status(200).json({
            success: true,
            method: methodUsed,
            isScanned,
            ocrAttempted,
            universityName: resultData.universityName,
            department: resultData.department,
            batch: resultData.batch,
            semester: resultData.semester,
            students: sanitizedStudents,
            rawTextSnippet: (extractedText || jsonText).slice(0, 500),
          });
        }
      } catch (aiErr) {
        console.error("Gemini OCR/AI parsing fallback triggered:", aiErr);
      }
    }

    // 2. Native Text PDF Parse Fallback
    if (extractedText.trim().length > 0) {
      parsedStudents = parseResultText(extractedText);
    }

    if (parsedStudents.length === 0) {
      return res.status(422).json({
        success: false,
        isScanned,
        ocrAttempted,
        error: isScanned
          ? "This document appears to be a scanned image or photo PDF. Please configure GEMINI_API_KEY in your Vercel Environment Variables for AI Multimodal OCR."
          : "Could not automatically extract student records from the PDF. Please ensure the PDF contains valid result tables or try uploading as a CSV/Excel file.",
        rawTextSnippet: extractedText.slice(0, 1000),
      });
    }

    return res.status(200).json({
      success: true,
      method: methodUsed,
      isScanned,
      ocrAttempted,
      students: parsedStudents,
      rawTextSnippet: extractedText.slice(0, 500),
    });
  } catch (error: any) {
    console.error("PDF Parsing Handler Notice:", error);
    return res.status(422).json({
      success: false,
      error: error.message || "Could not process document format. Please check file readability.",
    });
  }
}
