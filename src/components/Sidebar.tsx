import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  CheckCircle2, 
  PieChart, 
  BarChart3, 
  Users, 
  Download, 
  Sparkles,
  BookOpen,
  Layers
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'upload' 
  | 'subject-segregation'
  | 'subject-pass' 
  | 'grade-distribution' 
  | 'analytics' 
  | 'students' 
  | 'exports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  studentCount: number;
  subjectCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  subjectCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload Result PDF', icon: <Upload className="w-4 h-4" />, badge: 'AI Extractor' },
    { id: 'subject-segregation', label: 'Subject Grade Segregation', icon: <Layers className="w-4 h-4" />, badge: 'Segregation' },
    { id: 'subject-pass', label: 'Subject Pass Analysis', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'grade-distribution', label: 'Grade Distribution', icon: <PieChart className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Comparison', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'students', label: 'Student Roster & Search', icon: <Users className="w-4 h-4" />, badge: `${studentCount}` },
    { id: 'exports', label: 'Reports & Export', icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'AI Extractor'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dataset Quick Metrics Box */}
        <div className="p-3.5 bg-slate-800/60 border border-slate-750 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Dataset Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span className="text-base font-extrabold text-slate-100">{studentCount}</span>
              <p className="text-[10px] text-slate-400 font-medium">Students</p>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span className="text-base font-extrabold text-slate-100">{subjectCount}</span>
              <p className="text-[10px] text-slate-400 font-medium">Subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        <p className="flex items-center justify-center gap-1 font-medium text-slate-400">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Smart Grade Analyzer v2.0
        </p>
        <p className="mt-1 text-[10px] text-slate-500">Supports PDF Result Gazette & Gemini AI</p>
      </div>
    </aside>
  );
};
