import React from 'react';
import { StudentResult } from '../types';
import { X, GraduationCap, Award, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface StudentProfileModalProps {
  student: StudentResult | null;
  onClose: () => void;
}

const GRADE_BADGE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'A': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'B+': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'B': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'C+': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'C': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'D': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'F': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'ABS': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  const isPass = student.result.toUpperCase() === 'PASS';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 p-6 flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{student.name}</h2>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    isPass
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {student.result}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Enrollment No: <strong className="text-slate-200">{student.enrollment}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {student.branch || 'Computer Science'} • Semester {student.semester || 'VI'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CGPA & Overview Stats Row */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-750 text-center">
              <span className="text-xs text-slate-400 font-medium">Cumulative GPA</span>
              <p className="text-2xl font-extrabold text-indigo-400 mt-0.5">{student.cgpa}</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-750 text-center">
              <span className="text-xs text-slate-400 font-medium">Semester GPA</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{student.sgpa || student.cgpa}</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-750 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 font-medium">Total Subjects</span>
              <p className="text-2xl font-extrabold text-slate-200 mt-0.5">{student.subjects.length}</p>
            </div>
          </div>

          {/* Subject-Wise Grades List */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Subject-Wise Grade Report
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {student.subjects.map((sub, idx) => {
                const badgeClass =
                  GRADE_BADGE_COLORS[sub.grade.toUpperCase()] ||
                  'bg-slate-800 text-slate-300 border-slate-700';

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{sub.code}</span>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{sub.name}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${badgeClass}`}
                    >
                      {sub.grade}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between text-xs text-slate-400">
          <span>Official Academic Result Gazette Record</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
