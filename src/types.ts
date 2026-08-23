export interface SubjectGrade {
  code: string;
  name: string;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | 'ABS' | string;
  marks?: number;
  maxMarks?: number;
  credits?: number;
}

export interface StudentResult {
  enrollment: string;
  name: string;
  cgpa: number;
  sgpa?: number;
  result: 'PASS' | 'FAIL' | 'PROMOTED' | 'DETAINED' | string;
  semester?: string | number;
  branch?: string;
  subjects: SubjectGrade[];
}

export interface SubjectAnalysis {
  code: string;
  name: string;
  totalEnrolled: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
  averageGradePoint: number;
  gradeDistribution: Record<string, number>;
  gradePercentages: Record<string, number>;
}

export interface OverallSummary {
  totalStudents: number;
  totalSubjects: number;
  overallPassCount: number;
  overallFailCount: number;
  overallPassPercentage: number;
  overallFailPercentage: number;
  averageCgpa: number;
  highestCgpa: number;
  lowestCgpa: number;
}

export interface UniversityDataset {
  id: string;
  title: string;
  universityName: string;
  department: string;
  batch: string;
  semester: string;
  academicYear: string;
  uploadDate: string;
  students: StudentResult[];
  fileName?: string;
}

export interface FilterOptions {
  searchQuery: string;
  subjectCode: string;
  gradeFilter: string;
  statusFilter: 'ALL' | 'PASS' | 'FAIL';
  minCgpa: number;
  maxCgpa: number;
  sortBy: 'cgpa-desc' | 'cgpa-asc' | 'name-asc' | 'enrollment-asc';
}
