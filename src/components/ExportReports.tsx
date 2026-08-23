import React from 'react';
import { UniversityDataset, SubjectAnalysis, OverallSummary } from '../types';
import { FileText, FileSpreadsheet, Download, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDFReport } from '../lib/exportUtils';

interface ExportReportsProps {
  dataset: UniversityDataset;
  subjects: SubjectAnalysis[];
  summary: OverallSummary;
}

export const ExportReports: React.FC<ExportReportsProps> = ({ dataset, subjects, summary }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Academic Export Engine
        </div>
        <h2 className="text-xl font-bold text-slate-100">Download Grade Analysis & Gazette Reports</h2>
        <p className="text-xs text-slate-400 max-w-2xl">
          Generate comprehensive university grade reports in PDF, Excel (.xlsx), and CSV formats. Export executive summaries, subject performance breakdowns, and topper merit lists with one click.
        </p>
      </div>

      {/* Main Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Executive Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">PDF Summary & Toppers Report</h3>
              <p className="text-xs text-slate-400 mt-1">
                Formatted PDF document containing executive pass/fail statistics, Top 10 merit list, and subject pass percentages.
              </p>
            </div>
          </div>

          <button
            onClick={() => exportToPDFReport(dataset, subjects, summary)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export PDF Report
          </button>
        </div>

        {/* Excel Complete Dataset */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Excel Multi-Sheet Workbook (.xlsx)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Complete spreadsheet containing Summary Sheet, Full Student Result Roster, and Subject Grade Distribution tables.
              </p>
            </div>
          </div>

          <button
            onClick={() => exportToExcel(dataset, subjects, summary)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel Workbook
          </button>
        </div>

        {/* CSV Data File */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Raw CSV Data Export</h3>
              <p className="text-xs text-slate-400 mt-1">
                Comma-separated values data matrix containing student enrollment numbers, CGPAs, result statuses, and individual grades.
              </p>
            </div>
          </div>

          <button
            onClick={() => exportToCSV(dataset)}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV Data
          </button>
        </div>
      </div>
    </div>
  );
};
