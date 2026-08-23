import React from 'react';
import { SubjectAnalysis } from '../types';
import { Award, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface TopWeakSubjectsProps {
  subjects: SubjectAnalysis[];
}

export const TopWeakSubjects: React.FC<TopWeakSubjectsProps> = ({ subjects }) => {
  const topSubjects = [...subjects]
    .sort((a, b) => b.passPercentage - a.passPercentage)
    .slice(0, 5);

  const weakSubjects = [...subjects]
    .sort((a, b) => a.passPercentage - b.passPercentage)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performing Subjects Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Top Performing Subjects</h3>
              <p className="text-[11px] text-slate-400">Highest pass rate subjects</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
            High Pass %
          </span>
        </div>

        <div className="space-y-3">
          {topSubjects.map((sub, idx) => (
            <div
              key={sub.code}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl flex items-center justify-between gap-3 border border-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{sub.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{sub.code}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-400">{sub.passPercentage}%</span>
                <p className="text-[10px] text-slate-400">{sub.passCount} Pass / {sub.failCount} Fail</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Subjects Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Weak Subjects (Needs Attention)</h3>
              <p className="text-[11px] text-slate-400">Lowest pass rate subjects requiring academic focus</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full">
            Low Pass %
          </span>
        </div>

        <div className="space-y-3">
          {weakSubjects.map((sub, idx) => (
            <div
              key={sub.code}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl flex items-center justify-between gap-3 border border-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{sub.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{sub.code}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-rose-400">{sub.passPercentage}%</span>
                <p className="text-[10px] text-slate-400">{sub.failCount} Failed Students</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
