import React from 'react';
import { SubjectAnalysis } from '../types';
import { CheckCircle2, XCircle, BookOpen, Search } from 'lucide-react';

interface SubjectPassAnalysisProps {
  subjects: SubjectAnalysis[];
}

export const SubjectPassAnalysis: React.FC<SubjectPassAnalysisProps> = ({ subjects }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Subject-wise Pass Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Pass and Fail breakdown for each subject with pass percentage statistics.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-xs py-2 pl-9 pr-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Subject Cards & Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => {
          const isHighPass = sub.passPercentage >= 85;
          const isMediumPass = sub.passPercentage >= 70 && sub.passPercentage < 85;

          return (
            <div
              key={sub.code}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-indigo-400 rounded-md border border-slate-700">
                    {sub.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1 line-clamp-1">{sub.name}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    isHighPass
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : isMediumPass
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {sub.passPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Pass Rate</span>
                  <span>{sub.passCount} / {sub.totalEnrolled} Students</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${sub.passPercentage}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${100 - sub.passPercentage}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Detail Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/60 p-2 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pass
                  </span>
                  <span className="font-bold text-emerald-400">{sub.passCount}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> Fail
                  </span>
                  <span className="font-bold text-rose-400">{sub.failCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

