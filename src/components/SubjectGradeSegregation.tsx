import React, { useState } from 'react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SubjectAnalysis, UniversityDataset, OverallSummary } from '../types';
import { 
  BookOpen, 
  Filter, 
  Award, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  FileText, 
  FileSpreadsheet, 
  PieChart as PieIcon,
  BarChart2,
  ArrowRightLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface SubjectGradeSegregationProps {
  subjects: SubjectAnalysis[];
  dataset: UniversityDataset;
  summary: OverallSummary;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': '#10B981', // Emerald
  'A': '#3B82F6',  // Blue
  'B+': '#6366F1', // Indigo
  'B': '#8B5CF6',  // Purple
  'C+': '#F59E0B', // Amber
  'C': '#EC4899',  // Pink
  'D': '#F97316',  // Orange
  'F': '#EF4444',  // Red
};

const ALL_GRADES_LIST = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

export const SubjectGradeSegregation: React.FC<SubjectGradeSegregationProps> = ({
  subjects,
  dataset,
  summary
}) => {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL');
  const [compareSubjectCodes, setCompareSubjectCodes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'compare'>('cards');

  // Filtered subjects list based on selector
  const displayedSubjects = selectedSubjectCode === 'ALL'
    ? subjects
    : subjects.filter((s) => s.code === selectedSubjectCode);

  // Toggle compare selection for multi-subject comparison
  const toggleCompareSubject = (code: string) => {
    if (compareSubjectCodes.includes(code)) {
      setCompareSubjectCodes(compareSubjectCodes.filter((c) => c !== code));
    } else {
      if (compareSubjectCodes.length >= 4) return; // Limit to 4 for clean layout
      setCompareSubjectCodes([...compareSubjectCodes, code]);
    }
  };

  // Export handlers for Subject-wise Grade Segregation Report
  const exportSegregationPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 34, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject-Wise Grade Segregation Report', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${dataset.universityName || 'University Examination Gazette'} | ${dataset.title}`, 14, 25);

    doc.setTextColor(15, 23, 42);
    let startY = 42;

    displayedSubjects.forEach((sub) => {
      if (startY > 230) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sub.code}: ${sub.name}`, 14, startY);

      const failPct = (100 - sub.passPercentage).toFixed(1);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Total Enrolled: ${sub.totalEnrolled} | Passed: ${sub.passCount} (${sub.passPercentage}%) | Failed: ${sub.failCount} (${failPct}%) | Avg GP: ${sub.averageGradePoint}`,
        14,
        startY + 5
      );

      const tableBody = ALL_GRADES_LIST.map((g) => {
        const count = sub.gradeDistribution[g] || 0;
        const pct = sub.gradePercentages[g] || 0;
        return [g, `${count} Students`, `${pct}%`];
      });

      autoTable(doc, {
        startY: startY + 8,
        margin: { left: 14, right: 14 },
        head: [['Grade', 'Student Count', 'Percentage']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo
        styles: { fontSize: 8, cellPadding: 2 }
      });

      startY = (doc as any).lastAutoTable.finalY + 12;
    });

    doc.save(`${dataset.title.replace(/[^a-zA-Z0-9]/g, '_')}_Grade_Segregation.pdf`);
  };

  const exportSegregationExcel = () => {
    const wb = XLSX.utils.book_new();

    const segregationRows = displayedSubjects.map((sub) => {
      const failPct = Number((100 - sub.passPercentage).toFixed(1));
      return {
        'Subject Code': sub.code,
        'Subject Name': sub.name,
        'Total Enrolled': sub.totalEnrolled,
        'Pass Count': sub.passCount,
        'Fail Count': sub.failCount,
        'Pass %': `${sub.passPercentage}%`,
        'Fail %': `${failPct}%`,
        'Avg GP': sub.averageGradePoint,
        'Grade A+': sub.gradeDistribution['A+'] || 0,
        'Grade A': sub.gradeDistribution['A'] || 0,
        'Grade B+': sub.gradeDistribution['B+'] || 0,
        'Grade B': sub.gradeDistribution['B'] || 0,
        'Grade C+': sub.gradeDistribution['C+'] || 0,
        'Grade C': sub.gradeDistribution['C'] || 0,
        'Grade D': sub.gradeDistribution['D'] || 0,
        'Grade F': sub.gradeDistribution['F'] || 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(segregationRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Grade Segregation');
    XLSX.writeFile(wb, `${dataset.title.replace(/[^a-zA-Z0-9]/g, '_')}_Grade_Segregation.xlsx`);
  };

  const exportSegregationCSV = () => {
    const headers = [
      'Subject Code',
      'Subject Name',
      'Total Enrolled',
      'Pass Count',
      'Fail Count',
      'Pass %',
      'Fail %',
      'A+',
      'A',
      'B+',
      'B',
      'C+',
      'C',
      'D',
      'F'
    ];

    const rows = displayedSubjects.map((sub) => {
      const failPct = (100 - sub.passPercentage).toFixed(1);
      return [
        sub.code,
        `"${sub.name}"`,
        sub.totalEnrolled,
        sub.passCount,
        sub.failCount,
        `${sub.passPercentage}%`,
        `${failPct}%`,
        sub.gradeDistribution['A+'] || 0,
        sub.gradeDistribution['A'] || 0,
        sub.gradeDistribution['B+'] || 0,
        sub.gradeDistribution['B'] || 0,
        sub.gradeDistribution['C+'] || 0,
        sub.gradeDistribution['C'] || 0,
        sub.gradeDistribution['D'] || 0,
        sub.gradeDistribution['F'] || 0
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dataset.title.replace(/[^a-zA-Z0-9]/g, '_')}_Grade_Segregation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preparation for comparison chart data
  const compareSubjects = subjects.filter((s) => compareSubjectCodes.includes(s.code));
  const compareChartData = ALL_GRADES_LIST.map((grade) => {
    const row: Record<string, any> = { grade };
    compareSubjects.forEach((s) => {
      row[s.code] = s.gradeDistribution[grade] || 0;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Section Header & Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" /> Academic Analytics Module
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Subject-wise Grade Segregation
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Breakdown of student grade distribution (A+, A, B+, B, C+, C, D, F) across all subjects extracted from the result gazette. Includes pass/fail statistics, count tables, and interactive pie charts.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportSegregationPDF}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
              title="Download Subject-wise Grade Segregation Report as PDF"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={exportSegregationExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              title="Download Subject-wise Grade Segregation Report as Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button
              onClick={exportSegregationCSV}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
              title="Download Subject-wise Grade Segregation Report as CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Filter and View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">Filter Subject:</span>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="bg-slate-900 text-slate-200 text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Subjects ({subjects.length})</option>
                {subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubjectCode !== 'ALL' && (
              <button
                onClick={() => setSelectedSubjectCode('ALL')}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
              >
                Show All Subjects
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" /> Subject Cards
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'compare'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Compare Subjects
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: Subject Cards Grid */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {displayedSubjects.map((sub) => {
            const failCount = sub.failCount;
            const failPct = Number((100 - sub.passPercentage).toFixed(1));

            // Format Pie Chart Data for this specific subject
            const pieData = Object.entries(sub.gradeDistribution)
              .filter(([_, count]) => Number(count) > 0)
              .map(([grade, count]) => ({
                name: grade,
                value: count,
                percentage: sub.gradePercentages[grade] || 0,
                color: GRADE_COLORS[grade] || '#64748B'
              }));

            return (
              <div
                key={sub.code}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm hover:border-slate-750 transition-all space-y-6"
              >
                {/* Subject Header with Summary Badges */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 text-xs font-extrabold bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                        {sub.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100">{sub.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Academic Subject Performance & Grade Count
                    </p>
                  </div>

                  {/* Top Stats Pills */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Students</span>
                      <span className="text-sm font-extrabold text-slate-100">{sub.totalEnrolled}</span>
                    </div>

                    <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-400/80 uppercase font-semibold block">Passed ({sub.passPercentage}%)</span>
                      <span className="text-sm font-extrabold text-emerald-400">{sub.passCount}</span>
                    </div>

                    <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-rose-400/80 uppercase font-semibold block">Failed ({failPct}%)</span>
                      <span className="text-sm font-extrabold text-rose-400">{sub.failCount}</span>
                    </div>

                    <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-indigo-400/80 uppercase font-semibold block">Avg Grade Point</span>
                      <span className="text-sm font-extrabold text-indigo-300">{sub.averageGradePoint}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Layout: Table + Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Grade Distribution Table (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" /> Grade Count & Segregation Breakdown
                    </h4>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Grade</th>
                            <th className="p-3">Students</th>
                            <th className="p-3">Percentage</th>
                            <th className="p-3">Distribution Bar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {ALL_GRADES_LIST.map((grade) => {
                            const count = sub.gradeDistribution[grade] || 0;
                            const pct = sub.gradePercentages[grade] || 0;
                            const color = GRADE_COLORS[grade] || '#64748B';

                            return (
                              <tr key={grade} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-bold">
                                  <span
                                    className="px-2.5 py-1 rounded-md text-xs text-white font-extrabold shadow-sm"
                                    style={{ backgroundColor: color }}
                                  >
                                    {grade}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-slate-100">
                                  {count} <span className="text-[10px] text-slate-500 font-normal">Students</span>
                                </td>
                                <td className="p-3 font-semibold text-slate-300">{pct}%</td>
                                <td className="p-3 w-40">
                                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${pct}%`, backgroundColor: color }}
                                      className="h-full rounded-full transition-all duration-300"
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grade Distribution Pie Chart (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-indigo-400" /> Grade Distribution Doughnut Chart
                      </h4>
                      <p className="text-[11px] text-slate-500">Visual breakdown of grades for {sub.code}</p>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            labelLine={false}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              borderColor: '#334155',
                              borderRadius: '0.75rem',
                              color: '#F8FAFC',
                              fontSize: '12px'
                            }}
                            formatter={(value: any, name: any, props: any) => [
                              `${value} Students (${props.payload.percentage}%)`,
                              `Grade ${name}`
                            ]}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                          />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: Multi-Subject Comparison */}
      {viewMode === 'compare' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" /> Compare Grade Segregation Between Subjects
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select 2 to 4 subjects to compare their student grade distributions side-by-side.
            </p>
          </div>

          {/* Subject Checkboxes */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mr-2">Select Subjects to Compare:</span>
            {subjects.map((sub) => {
              const isChecked = compareSubjectCodes.includes(sub.code);
              return (
                <button
                  key={sub.code}
                  onClick={() => toggleCompareSubject(sub.code)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span>{sub.code}</span>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>

          {compareSubjects.length < 2 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
              <p className="text-xs font-medium">Please select at least 2 subjects from the options above to compare grade distributions.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Comparison Grouped Bar Chart */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Side-by-Side Grade Count Comparison Chart
                </h4>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compareChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="grade" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#F8FAFC',
                          fontSize: '12px'
                        }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                      {compareSubjects.map((sub, idx) => {
                        const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899'];
                        return (
                          <Bar
                            key={sub.code}
                            dataKey={sub.code}
                            name={`${sub.code} - ${sub.name}`}
                            fill={colors[idx % colors.length]}
                            radius={[4, 4, 0, 0]}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Grade</th>
                      {compareSubjects.map((sub) => (
                        <th key={sub.code} className="p-3">
                          {sub.code} ({sub.name})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ALL_GRADES_LIST.map((grade) => (
                      <tr key={grade} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold">
                          <span
                            className="px-2 py-0.5 rounded text-xs text-white font-extrabold"
                            style={{ backgroundColor: GRADE_COLORS[grade] || '#64748B' }}
                          >
                            {grade}
                          </span>
                        </td>
                        {compareSubjects.map((sub) => {
                          const count = sub.gradeDistribution[grade] || 0;
                          const pct = sub.gradePercentages[grade] || 0;
                          return (
                            <td key={sub.code} className="p-3 font-semibold text-slate-200">
                              {count} Students <span className="text-[10px] text-slate-500">({pct}%)</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
