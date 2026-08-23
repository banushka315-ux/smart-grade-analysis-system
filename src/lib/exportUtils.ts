import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { StudentResult, SubjectAnalysis, OverallSummary, UniversityDataset } from '../types';

export function exportToExcel(dataset: UniversityDataset, subjects: SubjectAnalysis[], summary: OverallSummary) {
  const wb = XLSX.utils.book_new();

  // 1. Overview Sheet
  const overviewData = [
    ["Grade Analysis Report", dataset.title],
    ["University / Institute", dataset.universityName || "N/A"],
    ["Department", dataset.department || "N/A"],
    ["Batch / Semester", `${dataset.batch || ''} | ${dataset.semester || ''}`],
    ["Report Date", new Date().toLocaleDateString()],
    [""],
    ["OVERVIEW STATISTICS"],
    ["Total Students", summary.totalStudents],
    ["Total Subjects", summary.totalSubjects],
    ["Overall Pass Count", summary.overallPassCount],
    ["Overall Fail Count", summary.overallFailCount],
    ["Overall Pass Percentage", `${summary.overallPassPercentage}%`],
    ["Overall Fail Percentage", `${summary.overallFailPercentage}%`],
    ["Average CGPA", summary.averageCgpa],
    ["Highest CGPA", summary.highestCgpa],
    ["Lowest CGPA", summary.lowestCgpa]
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Summary");

  // 2. Student Results Sheet
  const studentRows = dataset.students.map((st, idx) => {
    const row: Record<string, any> = {
      "Rank": idx + 1,
      "Enrollment No": st.enrollment,
      "Student Name": st.name,
      "CGPA": st.cgpa,
      "Result": st.result
    };
    st.subjects.forEach(s => {
      row[`${s.code} (${s.name})`] = s.grade;
    });
    return row;
  });
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, "Student Results");

  // 3. Subject-wise Analysis Sheet
  const subjectRows = subjects.map(sub => ({
    "Subject Code": sub.code,
    "Subject Name": sub.name,
    "Enrolled": sub.totalEnrolled,
    "Pass Count": sub.passCount,
    "Fail Count": sub.failCount,
    "Pass %": `${sub.passPercentage}%`,
    "A+": sub.gradeDistribution['A+'] || 0,
    "A": sub.gradeDistribution['A'] || 0,
    "B+": sub.gradeDistribution['B+'] || 0,
    "B": sub.gradeDistribution['B'] || 0,
    "C+": sub.gradeDistribution['C+'] || 0,
    "C": sub.gradeDistribution['C'] || 0,
    "D": sub.gradeDistribution['D'] || 0,
    "F": sub.gradeDistribution['F'] || 0
  }));
  const wsSubjects = XLSX.utils.json_to_sheet(subjectRows);
  XLSX.utils.book_append_sheet(wb, wsSubjects, "Subject Analysis");

  const fileName = `${dataset.title.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToCSV(dataset: UniversityDataset) {
  const headers = ["Enrollment", "Student Name", "CGPA", "Result", "Semester", "Branch"];
  // Collect all unique subjects
  const subjectCodes: string[] = [];
  dataset.students.forEach(st => {
    st.subjects.forEach(sub => {
      if (!subjectCodes.includes(sub.code)) subjectCodes.push(sub.code);
    });
  });

  const allHeaders = [...headers, ...subjectCodes];
  const rows = dataset.students.map(st => {
    const base = [st.enrollment, `"${st.name}"`, st.cgpa, st.result, st.semester || '', st.branch || ''];
    const grades = subjectCodes.map(code => {
      const s = st.subjects.find(sub => sub.code === code);
      return s ? s.grade : '-';
    });
    return [...base, ...grades].join(',');
  });

  const csvContent = "data:text/csv;charset=utf-8," + [allHeaders.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${dataset.title.replace(/[^a-zA-Z0-9]/g, '_')}_Data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDFReport(dataset: UniversityDataset, subjects: SubjectAnalysis[], summary: OverallSummary) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(dataset.universityName || "University Grade Analysis Report", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${dataset.title} | ${dataset.semester || ''} (${dataset.batch || ''})`, 14, 24);

  // Overview Metrics Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Result Overview", 14, 42);

  autoTable(doc, {
    startY: 46,
    head: [['Metric', 'Value', 'Metric', 'Value']],
    body: [
      ['Total Students Enrolled', `${summary.totalStudents}`, 'Average CGPA', `${summary.averageCgpa}`],
      ['Total Subjects', `${summary.totalSubjects}`, 'Highest CGPA', `${summary.highestCgpa}`],
      ['Overall Pass Count', `${summary.overallPassCount} (${summary.overallPassPercentage}%)`, 'Lowest CGPA', `${summary.lowestCgpa}`],
      ['Overall Fail Count', `${summary.overallFailCount} (${summary.overallFailPercentage}%)`, 'Report Date', new Date().toLocaleDateString()]
    ],
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85] },
    styles: { fontSize: 10 }
  });

  // Top 10 Toppers Table
  const finalY1 = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Top 10 Performing Students (Toppers)", 14, finalY1);

  const toppers = [...dataset.students]
    .sort((a, b) => Number(b.cgpa) - Number(a.cgpa))
    .slice(0, 10);

  autoTable(doc, {
    startY: finalY1 + 4,
    head: [['Rank', 'Enrollment No', 'Student Name', 'CGPA', 'Status']],
    body: toppers.map((t, idx) => [
      `#${idx + 1}`,
      t.enrollment,
      t.name,
      `${t.cgpa}`,
      t.result
    ]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald
    styles: { fontSize: 9 }
  });

  // Subject-wise Pass Breakdown Table
  doc.addPage();
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Subject-wise Pass & Fail Performance", 14, 18);

  autoTable(doc, {
    startY: 22,
    head: [['Code', 'Subject Name', 'Total', 'Pass', 'Fail', 'Pass %', 'Avg GP']],
    body: subjects.map(s => [
      s.code,
      s.name,
      `${s.totalEnrolled}`,
      `${s.passCount}`,
      `${s.failCount}`,
      `${s.passPercentage}%`,
      `${s.averageGradePoint}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
    styles: { fontSize: 9 }
  });

  doc.save(`${dataset.title.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.pdf`);
}

/** Generates a sample printable University Result PDF file for testing user upload! */
export function generateSampleResultPDF(dataset: UniversityDataset) {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(dataset.universityName.toUpperCase(), 14, 16);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`OFFICIAL EXAMINATION RESULT GAZETTE - ${dataset.semester.toUpperCase()}`, 14, 25);
  doc.text(`Academic Session: ${dataset.academicYear} | Department: ${dataset.department}`, 14, 31);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`Date of Issue: ${dataset.uploadDate}`, 14, 44);

  // Print Student Result Blocks
  let startY = 50;

  dataset.students.forEach((st, sIdx) => {
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Roll/Enrollment: ${st.enrollment}    Name: ${st.name}    CGPA: ${st.cgpa}    Result: ${st.result}`, 18, startY + 5.5);

    startY += 10;

    const subData = st.subjects.map(s => [s.code, s.name, s.grade]);
    autoTable(doc, {
      startY: startY,
      margin: { left: 14, right: 14 },
      head: [['Subject Code', 'Subject Title', 'Grade']],
      body: subData,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: 'bold' }
    });

    startY = (doc as any).lastAutoTable.finalY + 6;
  });

  doc.save(`${dataset.fileName || 'University_Result.pdf'}`);
}
