import React from 'react';
import { GraduationCap, FileSpreadsheet, FileText, Sparkles, Download, Moon, Sun, RefreshCw } from 'lucide-react';
import { UniversityDataset } from '../types';

interface HeaderProps {
  currentDataset: UniversityDataset;
  allDatasets: UniversityDataset[];
  onSelectDataset: (dataset: UniversityDataset) => void;
  onOpenUploadModal: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  allDatasets,
  onSelectDataset,
  onOpenUploadModal,
  onExportPDF,
  onExportExcel,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Active Dataset Name */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">Smart Grade Analysis</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> PDF Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium truncate max-w-md">
            {currentDataset.title} • <span className="text-slate-300">{currentDataset.universityName}</span>
          </p>
        </div>
      </div>

      {/* Dataset Selector & Quick Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Dataset dropdown */}
        <div className="relative">
          <select
            value={currentDataset.id}
            onChange={(e) => {
              const found = allDatasets.find((d) => d.id === e.target.value);
              if (found) onSelectDataset(found);
            }}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium py-2 px-3 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {allDatasets.map((ds) => (
              <option key={ds.id} value={ds.id} className="bg-slate-900 text-slate-200">
                {ds.title} ({ds.students.length} Students)
              </option>
            ))}
          </select>
        </div>

        {/* Upload New PDF Button */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Upload PDF Result
        </button>

        {/* Export Buttons */}
        <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-2.5">
          <button
            onClick={onExportPDF}
            title="Download PDF Report"
            className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            PDF
          </button>
          <button
            onClick={onExportExcel}
            title="Download Excel (.xlsx)"
            className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Excel
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
