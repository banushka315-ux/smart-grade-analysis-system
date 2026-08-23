import React, { useState } from 'react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SubjectAnalysis } from '../types';
import { PieChart, Filter, Award } from 'lucide-react';

interface GradeDistributionPieChartProps {
  subjects: SubjectAnalysis[];
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

export const GradeDistributionPieChart: React.FC<GradeDistributionPieChartProps> = ({ subjects }) => {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(
    subjects[0]?.code || ''
  );

  const selectedSubject = subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];

  if (!selectedSubject) return null;

  const pieData = Object.entries(selectedSubject.gradeDistribution)
    .filter(([_, count]) => Number(count) > 0)
    .map(([grade, count]) => ({
      name: grade,
      value: count,
      percentage: selectedSubject.gradePercentages[grade] || 0,
      color: GRADE_COLORS[grade] || '#64748B'
    }));

  return (
    <div className="space-y-6">
      {/* Subject Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" /> Subject Grade Distribution Pie Chart
          </h2>
          <p className="text-xs text-slate-400">
            Select a subject to view its grade distribution (A+, A, B+, B, C+, C, D, F) breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubjectCode}
            onChange={(e) => setSelectedSubjectCode(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {subjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart & Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Pie Chart Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                {selectedSubject.code}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">{selectedSubject.name}</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Total Enrolled: <strong className="text-slate-200">{selectedSubject.totalEnrolled}</strong>
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
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

        {/* Grade Breakdown Table Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Grade Distribution Breakdown Table
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 rounded-l-xl">Grade</th>
                  <th className="p-2.5">Students Count</th>
                  <th className="p-2.5">Percentage</th>
                  <th className="p-2.5 rounded-r-xl">Visual Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(selectedSubject.gradeDistribution).map(([grade, count]) => {
                  const pct = selectedSubject.gradePercentages[grade] || 0;
                  const color = GRADE_COLORS[grade] || '#64748B';

                  return (
                    <tr key={grade} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] text-white font-extrabold"
                          style={{ backgroundColor: color }}
                        >
                          {grade}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-200">{count}</td>
                      <td className="p-2.5 font-medium text-slate-300">{pct}%</td>
                      <td className="p-2.5 w-32">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%`, backgroundColor: color }}
                            className="h-full rounded-full"
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
      </div>
    </div>
  );
};
