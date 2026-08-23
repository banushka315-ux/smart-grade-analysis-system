import React from 'react';
import { StudentResult } from '../types';
import { Award, AlertOctagon, ExternalLink, Trophy, CheckCircle2, XCircle } from 'lucide-react';

interface TopStudentsTableProps {
  topStudents: StudentResult[];
  lowestStudents: StudentResult[];
  onSelectStudent: (student: StudentResult) => void;
}

export const TopStudentsTable: React.FC<TopStudentsTableProps> = ({
  topStudents,
  lowestStudents,
  onSelectStudent,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 10 Toppers Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Top 10 Performing Students (Toppers)</h3>
              <p className="text-[11px] text-slate-400">Ranked by highest CGPA</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
            Merit List
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-2.5 rounded-l-xl">Rank</th>
                <th className="p-2.5">Student Name</th>
                <th className="p-2.5">Enrollment No</th>
                <th className="p-2.5">CGPA</th>
                <th className="p-2.5 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topStudents.map((st, idx) => (
                <tr
                  key={st.enrollment}
                  onClick={() => onSelectStudent(st)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <td className="p-2.5 font-bold">
                    <span
                      className={`w-6 h-6 rounded-lg text-[11px] font-extrabold inline-flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700/80 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {st.name}
                  </td>
                  <td className="p-2.5 font-mono text-slate-400">{st.enrollment}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 text-xs font-extrabold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                      {st.cgpa}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <button
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title="View Student Grade Report"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lowest Performing Students Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Lowest Performing Students</h3>
              <p className="text-[11px] text-slate-400">Students needing academic guidance</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
            Intervention List
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-2.5 rounded-l-xl">Enrollment</th>
                <th className="p-2.5">Student Name</th>
                <th className="p-2.5">Result</th>
                <th className="p-2.5">CGPA</th>
                <th className="p-2.5 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {lowestStudents.map((st) => (
                <tr
                  key={st.enrollment}
                  onClick={() => onSelectStudent(st)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <td className="p-2.5 font-mono text-slate-400">{st.enrollment}</td>
                  <td className="p-2.5 font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                    {st.name}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 w-fit ${
                        st.result.toUpperCase() === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {st.result.toUpperCase() === 'PASS' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {st.result}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-slate-200">{st.cgpa}</td>
                  <td className="p-2.5">
                    <button
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title="View Student Grade Report"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
