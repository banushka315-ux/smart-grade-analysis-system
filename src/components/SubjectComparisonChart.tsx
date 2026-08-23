import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { SubjectAnalysis } from '../types';
import { BarChart3 } from 'lucide-react';

interface SubjectComparisonChartProps {
  subjects: SubjectAnalysis[];
}

export const SubjectComparisonChart: React.FC<SubjectComparisonChartProps> = ({ subjects }) => {
  const chartData = subjects.map((s) => ({
    code: s.code,
    name: s.name,
    passPercentage: s.passPercentage,
    avgGP: s.averageGradePoint,
    passCount: s.passCount,
    failCount: s.failCount
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Subject Pass Rate Comparison
          </h3>
          <p className="text-xs text-slate-400">
            Compare pass percentages across all subjects in the result gazette.
          </p>
        </div>
      </div>

      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="code"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              domain={[0, 100]}
              unit="%"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
              formatter={(val: any, name: any, props: any) => [
                `${val}% Pass Rate (${props.payload.passCount} Pass, ${props.payload.failCount} Fail)`,
                props.payload.name
              ]}
            />
            <Bar dataKey="passPercentage" name="Pass Percentage" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.passPercentage >= 85
                      ? '#10B981' // Green
                      : entry.passPercentage >= 70
                      ? '#6366F1' // Indigo
                      : '#EF4444' // Red
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
