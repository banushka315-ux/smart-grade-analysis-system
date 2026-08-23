import React from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Star 
} from 'lucide-react';
import { OverallSummary, StudentResult } from '../types';

interface OverviewCardsProps {
  summary: OverallSummary;
  topStudent?: StudentResult;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ summary, topStudent }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Students */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-slate-100">{summary.totalStudents}</span>
          <span className="text-xs text-slate-400 font-medium">Enrolled</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {summary.overallPassCount} Passed
          </span>
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {summary.overallFailCount} Failed
          </span>
        </div>
      </div>

      {/* 2. Overall Pass % */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Pass Rate</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-emerald-400">{summary.overallPassPercentage}%</span>
          <span className="text-xs text-slate-400">Pass Rate</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Fail Rate: <strong className="text-rose-400">{summary.overallFailPercentage}%</strong></span>
          <span>Subjects: <strong className="text-slate-200">{summary.totalSubjects}</strong></span>
        </div>
      </div>

      {/* 3. Average CGPA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average CGPA</span>
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-sky-400">{summary.averageCgpa}</span>
          <span className="text-xs text-slate-400">/ 10.0</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Highest: <strong className="text-emerald-400">{summary.highestCgpa}</strong></span>
          <span>Lowest: <strong className="text-rose-400">{summary.lowestCgpa}</strong></span>
        </div>
      </div>

      {/* 4. Top Performer Highlight */}
      <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rank #1 Topper
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
            CGPA {topStudent?.cgpa || 'N/A'}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-100 truncate mt-1">
          {topStudent?.name || 'Top Student'}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Roll: {topStudent?.enrollment || 'N/A'}
        </p>
        <div className="mt-3 pt-2.5 border-t border-indigo-500/20 flex items-center justify-between text-xs text-indigo-200">
          <span>Status: <strong className="text-emerald-400 font-semibold">{topStudent?.result || 'PASS'}</strong></span>
          <span className="text-[11px] text-slate-400">{topStudent?.subjects.length || 0} Subjects</span>
        </div>
      </div>
    </div>
  );
};
