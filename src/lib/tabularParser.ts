import * as XLSX from 'xlsx';
import { StudentResult, SubjectGrade } from '../types';

const gradePoints: Record<string, number> = { 'A+': 10, A: 9, 'B+': 8, B: 7, 'C+': 6, C: 5, D: 4, F: 0, ABS: 0 };
const knownGrades = new Set(Object.keys(gradePoints));
const normalizeHeader = (value: unknown) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const textValue = (value: unknown) => String(value ?? '').trim();

function findColumn(headers: unknown[], candidates: string[]): number {
  const accepted = new Set(candidates);
  return headers.findIndex((header) => accepted.has(normalizeHeader(header)));
}

function numericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const match = textValue(value).match(/^\d+(?:\.\d+)?$/);
  return match ? Number(match[0]) : undefined;
}

function gradeValue(value: unknown): string | undefined {
  const grade = textValue(value).toUpperCase().replace(/\s+/g, '');
  return knownGrades.has(grade) ? grade : undefined;
}

function splitSubjectHeader(header: string): { name: string; kind: 'grade' | 'marks' | 'value' } {
  const suffix = header.trim().match(/^(.*?)[\s_\-]*(?:letter\s*)?(grade|marks?|score)$/i);
  if (!suffix) return { name: header.trim(), kind: 'value' };
  return { name: suffix[1].trim() || header.trim(), kind: /grade/i.test(suffix[2]) ? 'grade' : 'marks' };
}

export async function parseTabularFile(file: File): Promise<StudentResult[]> {
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension !== 'xlsx' && extension !== 'csv') throw new Error('Choose an .xlsx or .csv file.');
  const workbook = extension === 'csv'
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('The file does not contain a worksheet.');
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: true });
  const enrollmentHeaders = ['enrollment', 'enrollmentno', 'enrollmentnumber', 'rollno', 'rollnumber', 'registrationno', 'registrationnumber', 'studentid'];
  const nameHeaders = ['name', 'studentname', 'fullname', 'student'];
  const headerIndex = rows.findIndex((row) => findColumn(row, enrollmentHeaders) >= 0 && findColumn(row, nameHeaders) >= 0);
  if (headerIndex < 0) throw new Error('Could not find both student name and enrollment/roll number columns.');

  const headers = rows[headerIndex];
  const enrollmentColumn = findColumn(headers, enrollmentHeaders);
  const nameColumn = findColumn(headers, nameHeaders);
  const cgpaColumn = findColumn(headers, ['cgpa', 'cumulativegpa', 'overallgpa']);
  const sgpaColumn = findColumn(headers, ['sgpa', 'semestergpa', 'gpa']);
  const resultColumn = findColumn(headers, ['result', 'finalresult', 'overallresult', 'status', 'finalstatus', 'passfail', 'outcome']);
  const metadataHeader = /^(?:cgpa|sgpa|gpa|final|overall|total|grandtotal|result|status|passfail|outcome|percentage|percent|credit|creditpoint|roll|enrollment|registration|studentname|name|branch|department|semester|batch|year|serial|srno|studentid)/i;
  const groups = new Map<string, { name: string; gradeColumn?: number; marksColumn?: number; valueColumn?: number }>();

  headers.forEach((header, column) => {
    if ([enrollmentColumn, nameColumn, cgpaColumn, sgpaColumn, resultColumn].includes(column)) return;
    const label = textValue(header);
    if (!label || metadataHeader.test(normalizeHeader(label))) return;
    const parsed = splitSubjectHeader(label);
    const key = normalizeHeader(parsed.name);
    if (!key) return;
    const group = groups.get(key) || { name: parsed.name };
    if (parsed.kind === 'grade') group.gradeColumn = column;
    else if (parsed.kind === 'marks') group.marksColumn = column;
    else group.valueColumn = column;
    groups.set(key, group);
  });

  const students: StudentResult[] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const enrollment = textValue(row[enrollmentColumn]);
    const name = textValue(row[nameColumn]);
    if (!enrollment || !name) continue;
    const subjects: SubjectGrade[] = [];
    for (const group of groups.values()) {
      const value = group.valueColumn === undefined ? undefined : row[group.valueColumn];
      const rawGrade = group.gradeColumn === undefined ? value : row[group.gradeColumn];
      const grade = gradeValue(rawGrade);
      const marks = numericValue(group.marksColumn === undefined ? (grade ? undefined : value) : row[group.marksColumn]);
      if (!grade && marks === undefined) continue;
      const code = group.name.match(/\b[A-Za-z]{2,5}\s*\d{2,4}[A-Za-z]?\b/)?.[0].replace(/\s+/g, '').toUpperCase() || group.name;
      subjects.push({ code, name: group.name, grade: grade || '', ...(marks === undefined ? {} : { marks }) });
    }
    if (!subjects.length) continue;

    const rawResult = resultColumn < 0 ? '' : textValue(row[resultColumn]).toUpperCase();
    const result = /^(PASS|PASSED|PROMOTED)$/.test(rawResult)
      ? 'PASS'
      : /^(FAIL|FAILED|DETAINED)$/.test(rawResult)
        ? 'FAIL'
        : subjects.some((subject) => ['F', 'ABS'].includes(subject.grade))
          ? 'FAIL'
          : subjects.some((subject) => knownGrades.has(subject.grade)) ? 'PASS' : 'UNKNOWN';
    const cgpa = cgpaColumn < 0 ? undefined : numericValue(row[cgpaColumn]);
    const sgpa = sgpaColumn < 0 ? undefined : numericValue(row[sgpaColumn]);
    const graded = subjects.filter((subject) => knownGrades.has(subject.grade));
    const derivedCgpa = graded.length
      ? Number((graded.reduce((total, subject) => total + gradePoints[subject.grade], 0) / graded.length).toFixed(2))
      : undefined;
    students.push({ enrollment, name, result, subjects, ...(cgpa ?? derivedCgpa) === undefined ? {} : { cgpa: cgpa ?? derivedCgpa }, ...(sgpa === undefined ? {} : { sgpa }) });
  }
  if (!students.length) throw new Error('No student rows with subject marks or grades were found.');
  return students;
}