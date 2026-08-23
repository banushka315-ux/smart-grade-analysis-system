import { StudentResult, SubjectAnalysis, OverallSummary, FilterOptions } from '../types';

export const GRADE_POINTS: Record<string, number> = {
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 7,
  'C+': 6,
  'C': 5,
  'D': 4,
  'F': 0,
  'ABS': 0
};

export const ALL_GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

export function computeOverallSummary(students: StudentResult[]): OverallSummary {
  if (!students || students.length === 0) {
    return {
      totalStudents: 0,
      totalSubjects: 0,
      overallPassCount: 0,
      overallFailCount: 0,
      overallPassPercentage: 0,
      overallFailPercentage: 0,
      averageCgpa: 0,
      highestCgpa: 0,
      lowestCgpa: 0
    };
  }

  const totalStudents = students.length;
  const passCount = students.filter(s => s.result.toUpperCase() === 'PASS').length;
  const failCount = totalStudents - passCount;
  const passPct = Number(((passCount / totalStudents) * 100).toFixed(1));
  const failPct = Number(((failCount / totalStudents) * 100).toFixed(1));

  const cgpas = students.map(s => Number(s.cgpa) || 0).filter(c => c > 0);
  const avgCgpa = cgpas.length > 0 
    ? Number((cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2)) 
    : 0;
  const highestCgpa = cgpas.length > 0 ? Math.max(...cgpas) : 0;
  const lowestCgpa = cgpas.length > 0 ? Math.min(...cgpas) : 0;

  // Extract unique subjects across all students
  const subjectSet = new Set<string>();
  students.forEach(st => {
    st.subjects?.forEach(sub => {
      subjectSet.add(sub.code || sub.name);
    });
  });

  return {
    totalStudents,
    totalSubjects: subjectSet.size,
    overallPassCount: passCount,
    overallFailCount: failCount,
    overallPassPercentage: passPct,
    overallFailPercentage: failPct,
    averageCgpa: avgCgpa,
    highestCgpa: Number(highestCgpa.toFixed(2)),
    lowestCgpa: Number(lowestCgpa.toFixed(2))
  };
}

export function computeSubjectAnalyses(students: StudentResult[]): SubjectAnalysis[] {
  if (!students || students.length === 0) return [];

  const subjectMap = new Map<string, {
    code: string;
    name: string;
    grades: string[];
    total: number;
    pass: number;
    fail: number;
  }>();

  students.forEach(st => {
    st.subjects?.forEach(sub => {
      const key = sub.code || sub.name;
      if (!key) return;

      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          code: sub.code || 'SUB',
          name: sub.name || sub.code || 'Subject',
          grades: [],
          total: 0,
          pass: 0,
          fail: 0
        });
      }

      const item = subjectMap.get(key)!;
      item.total += 1;
      const g = (sub.grade || 'F').toUpperCase().trim();
      item.grades.push(g);

      if (g === 'F' || g === 'ABS' || g === 'FAIL') {
        item.fail += 1;
      } else {
        item.pass += 1;
      }
    });
  });

  const resultList: SubjectAnalysis[] = [];

  subjectMap.forEach(item => {
    const distribution: Record<string, number> = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0
    };
    const percentages: Record<string, number> = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0
    };

    let totalPoints = 0;

    item.grades.forEach(g => {
      if (distribution[g] !== undefined) {
        distribution[g] += 1;
      } else if (g === 'ABS') {
        distribution['F'] += 1;
      } else {
        // default unknown grade to B if not matching
        distribution['B'] = (distribution['B'] || 0) + 1;
      }

      totalPoints += GRADE_POINTS[g] ?? 6;
    });

    ALL_GRADES.forEach(g => {
      percentages[g] = item.total > 0 
        ? Number(((distribution[g] / item.total) * 100).toFixed(1)) 
        : 0;
    });

    const passPct = item.total > 0 
      ? Number(((item.pass / item.total) * 100).toFixed(1)) 
      : 0;

    const avgGP = item.total > 0 
      ? Number((totalPoints / item.total).toFixed(2)) 
      : 0;

    resultList.push({
      code: item.code,
      name: item.name,
      totalEnrolled: item.total,
      passCount: item.pass,
      failCount: item.fail,
      passPercentage: passPct,
      averageGradePoint: avgGP,
      gradeDistribution: distribution,
      gradePercentages: percentages
    });
  });

  return resultList.sort((a, b) => b.passPercentage - a.passPercentage);
}

export function getTopStudents(students: StudentResult[], count = 10): StudentResult[] {
  return [...students]
    .sort((a, b) => Number(b.cgpa) - Number(a.cgpa))
    .slice(0, count);
}

export function getLowestStudents(students: StudentResult[], count = 10): StudentResult[] {
  return [...students]
    .sort((a, b) => Number(a.cgpa) - Number(b.cgpa))
    .slice(0, count);
}

export function filterStudents(students: StudentResult[], filters: FilterOptions): StudentResult[] {
  return students.filter(st => {
    // Search query check (name or enrollment)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = st.name.toLowerCase().includes(q);
      const matchEnroll = st.enrollment.toLowerCase().includes(q);
      if (!matchName && !matchEnroll) return false;
    }

    // Pass / Fail status filter
    if (filters.statusFilter !== 'ALL') {
      if (st.result.toUpperCase() !== filters.statusFilter) return false;
    }

    // CGPA range filter
    const cgpa = Number(st.cgpa) || 0;
    if (cgpa < filters.minCgpa || cgpa > filters.maxCgpa) return false;

    // Subject Code filter
    if (filters.subjectCode) {
      const hasSub = st.subjects.some(sub => sub.code === filters.subjectCode || sub.name === filters.subjectCode);
      if (!hasSub) return false;
    }

    // Specific Grade Filter
    if (filters.gradeFilter) {
      const hasGrade = st.subjects.some(sub => sub.grade.toUpperCase() === filters.gradeFilter.toUpperCase());
      if (!hasGrade) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'cgpa-desc') return Number(b.cgpa) - Number(a.cgpa);
    if (filters.sortBy === 'cgpa-asc') return Number(a.cgpa) - Number(b.cgpa);
    if (filters.sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (filters.sortBy === 'enrollment-asc') return a.enrollment.localeCompare(b.enrollment);
    return 0;
  });
}
