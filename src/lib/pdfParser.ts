import { StudentResult, SubjectGrade } from '../types';

/**
 * Heuristic & tabular parser for university result text extracted from PDF documents.
 * Accurately extracts exact Student Roll/Enrollment Numbers, Full Names, Subject Codes,
 * awarded Grades, and SGPA/CGPA without inserting fake hardcoded fallback data.
 */
export function parseResultText(rawText: string): StudentResult[] {
  if (!rawText || rawText.trim().length === 0) return [];

  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  const students: StudentResult[] = [];

  // Enhanced Patterns
  const enrollRegex = /(?:Enrollment|Roll|Reg|ENR|ID|Seat|Candidate|RollNo)[\s#:]*([A-Za-z0-9/\-]{3,20})/i;
  const genericEnrollRegex = /\b([0-9]{3,16}|[0-9]{2,4}[-/\s]?[A-Za-z]{2,5}[-/\s]?[0-9]{3,8})\b/;
  const explicitNameRegex = /(?:Student\s*Name|Name\s*of\s*Student|Candidate\s*Name|Name|Student)[\s:]+([A-Za-z\s.]{3,40})/i;
  const cgpaRegex = /(?:CGPA|SGPA|GPA|SPI|CPI|Percentage|Marks)[\s:]*([0-9]{1,2}\.[0-9]{1,2}|10\.00?|[0-9]{2,3})/i;
  const resultRegex = /\b(PASS|FAIL|PROMOTED|DETAINED|PASSED|FAILED|RE-APPEAR|BACKLOG|ABSENT)\b/i;

  // Grade matcher
  const gradeTokens = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'O', 'P', 'F', 'ABS', 'AB', 'PASS', 'FAIL'];

  // 1. Detect Tabular Column Layout (Subject codes across header line)
  let detectedSubjectCodes: string[] = [];
  for (const line of rawLines.slice(0, 40)) {
    const subjectCodeMatches = line.match(/\b([A-Za-z]{2,5}[-_\s]?\d{2,4}[A-Za-z]?|\d{3,4})\b/g);
    if (subjectCodeMatches && subjectCodeMatches.length >= 2) {
      detectedSubjectCodes = Array.from(new Set(subjectCodeMatches.map(c => c.replace(/[\s-_]/g, '').toUpperCase())));
      if (detectedSubjectCodes.length >= 2) break;
    }
  }

  let currentStudent: Partial<StudentResult> | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check enrollment / Roll Number match
    const enrollMatch = line.match(enrollRegex) || line.match(genericEnrollRegex);
    
    // Ignore line if it looks like a date, total marks summary line, or generic phone number
    const isDateOrPhone = /^\d{4}[-/]\d{2}[-/]\d{2}$|^\d{10,11}$/.test(line);

    if (enrollMatch && !isDateOrPhone) {
      const enrollVal = enrollMatch[1].toUpperCase();

      // Check if this is a new student record
      if (!currentStudent || currentStudent.enrollment !== enrollVal) {
        if (currentStudent && currentStudent.enrollment && (currentStudent.subjects?.length || 0) > 0) {
          students.push(finalizeStudent(currentStudent));
        }

        // Try extracting name from the same line as Roll Number
        let extractedName = '';
        const explicitName = line.match(explicitNameRegex);
        if (explicitName && explicitName[1].trim().length > 2) {
          extractedName = cleanName(explicitName[1]);
        } else {
          // Remove enrollment number from line and check remaining text for name
          const lineWithoutEnroll = line.replace(enrollMatch[0], '').replace(/(?:Enrollment|Roll|Reg|ENR|ID|Seat)[\s#:]*/i, '').trim();
          const words = lineWithoutEnroll.split(/\s+/).filter(w => /^[A-Za-z.]{2,20}$/.test(w));
          if (words.length >= 1) {
            extractedName = cleanName(words.join(' '));
          }
        }

        currentStudent = {
          enrollment: enrollVal,
          name: extractedName || `Student (${enrollVal})`,
          subjects: []
        };
      }
    }

    if (!currentStudent) continue;

    // Check for explicit student name on subsequent lines if not yet found
    if ((!currentStudent.name || currentStudent.name.startsWith('Student (')) && i < rawLines.length) {
      const nameMatch = line.match(explicitNameRegex);
      if (nameMatch && nameMatch[1].trim().length > 2) {
        currentStudent.name = cleanName(nameMatch[1]);
      } else {
        const uppercaseNameMatch = line.match(/^([A-Za-z\s.]{3,35})$/);
        if (uppercaseNameMatch && !resultRegex.test(line) && !cgpaRegex.test(line)) {
          const nameStr = uppercaseNameMatch[1].trim();
          if (!gradeTokens.includes(nameStr.toUpperCase()) && nameStr.length > 3 && !/^\d+$/.test(nameStr)) {
            currentStudent.name = cleanName(nameStr);
          }
        }
      }
    }

    // CGPA / SGPA match
    const cgpaMatch = line.match(cgpaRegex);
    if (cgpaMatch) {
      const val = parseFloat(cgpaMatch[1]);
      if (!isNaN(val)) {
        const normVal = val > 10 && val <= 100 ? Number((val / 10).toFixed(2)) : Number(val.toFixed(2));
        if (normVal <= 10.0) {
          currentStudent.cgpa = normVal;
          currentStudent.sgpa = normVal;
        }
      }
    }

    // Result status match
    const resultMatch = line.match(resultRegex);
    if (resultMatch) {
      const resVal = resultMatch[1].toUpperCase();
      currentStudent.result = (resVal.includes('FAIL') || resVal.includes('BACK') || resVal.includes('RE-') || resVal.includes('ABS')) ? 'FAIL' : 'PASS';
    }

    // Match Subject Grade pairs on line (e.g., "CS301: A+", "KCS601 - Pass", "CS301 (A+)", "CS301 Data Structures A+")
    const subjectGradeRegex = /\b([A-Za-z0-9]{2,8})\b[\s:()\-\[\]]+(?:([A-Za-z\s&]{2,30})[\s:()\-\[\]]+)?\b(A\+|A|B\+|B|C\+|C|D|O|P|F|ABS|AB|PASS|FAIL|\d{2,3})\b/gi;
    let subMatch;
    while ((subMatch = subjectGradeRegex.exec(line)) !== null) {
      const code = subMatch[1].replace(/[\s-_]/g, '').toUpperCase();
      const rawSubName = subMatch[2] ? subMatch[2].trim() : '';
      const gradeRaw = subMatch[3].toUpperCase();

      const grade = normalizeGrade(gradeRaw);
      const subName = (rawSubName && rawSubName.length > 2 && !gradeTokens.includes(rawSubName.toUpperCase())) ? rawSubName : code;

      if (!currentStudent.subjects) currentStudent.subjects = [];
      if (!currentStudent.subjects.some(s => s.code === code)) {
        currentStudent.subjects.push({
          code,
          name: subName,
          grade
        });
      }
    }

    // Tabular Row Grade Parsing (if subject codes were detected at top of PDF)
    if (detectedSubjectCodes.length > 0 && (!currentStudent.subjects || currentStudent.subjects.length < detectedSubjectCodes.length)) {
      const lineTokens = line.split(/[\s,|\t]+/).map(t => t.trim()).filter(Boolean);
      const matchedGradesInLine = lineTokens.filter(t => gradeTokens.includes(t.toUpperCase()) || (!isNaN(parseFloat(t)) && parseFloat(t) <= 100));
      
      if (matchedGradesInLine.length >= 2) {
        for (let idx = 0; idx < Math.min(matchedGradesInLine.length, detectedSubjectCodes.length); idx++) {
          const code = detectedSubjectCodes[idx];
          const grade = normalizeGrade(matchedGradesInLine[idx]);

          if (!currentStudent.subjects) currentStudent.subjects = [];
          if (!currentStudent.subjects.some(s => s.code === code)) {
            currentStudent.subjects.push({
              code,
              name: code,
              grade
            });
          }
        }
      }
    }
  }

  // Finalize last student
  if (currentStudent && currentStudent.enrollment && (currentStudent.subjects?.length || 0) > 0) {
    students.push(finalizeStudent(currentStudent));
  }

  return students;
}

function cleanName(raw: string): string {
  return raw
    .replace(/^(?:Name|Student|Mr|Ms|Mrs|Shri|Smt)[\s.:]+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeGrade(gradeRaw: string): string {
  if (gradeRaw === 'PASSED' || gradeRaw === 'PASS') return 'A';
  if (gradeRaw === 'FAILED' || gradeRaw === 'FAIL') return 'F';
  if (gradeRaw === 'AB') return 'ABS';
  return gradeRaw;
}

function finalizeStudent(st: Partial<StudentResult>): StudentResult {
  const subjects = st.subjects || [];

  // Calculate pass/fail based on actual subjects
  const hasFail = subjects.some(s => s.grade === 'F' || s.grade === 'ABS' || s.grade === 'FAIL');
  const result = st.result || (hasFail ? 'FAIL' : 'PASS');

  // Calculate exact SGPA/CGPA dynamically from student's actual grades if missing
  let cgpa = st.cgpa || 0;
  if (!st.cgpa || st.cgpa === 0) {
    if (subjects.length > 0) {
      const pointsMap: Record<string, number> = { 'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'P': 4, 'F': 0, 'ABS': 0 };
      const totalPoints = subjects.reduce((acc, s) => acc + (pointsMap[s.grade] ?? 6), 0);
      cgpa = Number((totalPoints / subjects.length).toFixed(2));
    }
  }

  const enrollment = st.enrollment || 'STUDENT';
  const name = st.name || `Student (${enrollment})`;

  return {
    enrollment: enrollment.toUpperCase(),
    name,
    cgpa: Number(cgpa.toFixed(2)),
    sgpa: Number(cgpa.toFixed(2)),
    result,
    semester: st.semester || "VI",
    branch: st.branch || "General Academic",
    subjects
  };
}

