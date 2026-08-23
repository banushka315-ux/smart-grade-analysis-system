import React, { useState } from 'react';
import { StudentResult, FilterOptions, SubjectAnalysis } from '../types';
import { Search, Filter, ArrowUpDown, CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { filterStudents } from '../lib/analytics';

interface StudentSearchTableProps {
  students: StudentResult[];
  subjects: SubjectAnalysis[];
  onSelectStudent: (student: StudentResult) => void;
}

export const StudentSearchTable: React.FC<StudentSearchTableProps> = ({
  students,
  subjects,
  onSelectStudent,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    subjectCode: '',
    gradeFilter: '',
    statusFilter: 'ALL',
    minCgpa: 0,
    maxCgpa: 10,
    sortBy: 'cgpa-desc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = filterStudents(students, filters);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      subjectCode: '',
      gradeFilter: '',
      statusFilter: 'ALL',
      minCgpa: 0,
      maxCgpa: 10,
      sortBy: 'cgpa-desc',
    });
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">Student Roster & Grade Search</h2>
          <p className="text-xs text-slate-400">
            Search by Name or Enrollment Number, filter by CGPA range or Subject Grade.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Name or Enrollment..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters({ ...filters, searchQuery: e.target.value });
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800 text-slate-200 text-xs py-2.5 pl-9 pr-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Status Filter */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Status</label>
          <select
            value={filters.statusFilter}
            onChange={(e) => {
              setFilters({ ...filters, statusFilter: e.target.value as any });
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800 text-slate-200 text-xs py-2 px-2.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="PASS">PASS Only</option>
            <option value="FAIL">FAIL Only</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Subject</label>
          <select
            value={filters.subjectCode}
            onChange={(e) => {
              setFilters({ ...filters, subjectCode: e.target.value });
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800 text-slate-200 text-xs py-2 px-2.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Grade</label>
          <select
            value={filters.gradeFilter}
            onChange={(e) => {
              setFilters({ ...filters, gradeFilter: e.target.value });
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800 text-slate-200 text-xs py-2 px-2.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Grades</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => {
              setFilters({ ...filters, sortBy: e.target.value as any });
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800 text-slate-200 text-xs py-2 px-2.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="cgpa-desc">CGPA: High to Low</option>
            <option value="cgpa-asc">CGPA: Low to High</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="enrollment-asc">Enrollment No</option>
          </select>
        </div>

        {/* Min CGPA */}
        <div>
          <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Min CGPA ({filters.minCgpa})</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.minCgpa}
            onChange={(e) => {
              setFilters({ ...filters, minCgpa: parseFloat(e.target.value) });
              setCurrentPage(1);
            }}
            className="w-full cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Reset Filters */}
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-3 rounded-l-xl">Enrollment No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Branch / Sem</th>
              <th className="p-3">Result Status</th>
              <th className="p-3">CGPA</th>
              <th className="p-3">Subject Grades Snippet</th>
              <th className="p-3 rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No student records match the selected filters.
                </td>
              </tr>
            ) : (
              paginated.map((st) => (
                <tr
                  key={st.enrollment}
                  onClick={() => onSelectStudent(st)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <td className="p-3 font-mono font-bold text-slate-200">{st.enrollment}</td>
                  <td className="p-3 font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {st.name}
                  </td>
                  <td className="p-3 text-slate-400">{st.branch || 'CSE'} ({st.semester || 'VI'})</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md inline-flex items-center gap-1 ${
                        st.result.toUpperCase() === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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
                  <td className="p-3 font-extrabold text-slate-100">{st.cgpa}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 flex-wrap max-w-xs">
                      {st.subjects.slice(0, 4).map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 rounded border border-slate-700"
                        >
                          {sub.code}: <strong className="text-indigo-400">{sub.grade}</strong>
                        </span>
                      ))}
                      {st.subjects.length > 4 && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          +{st.subjects.length - 4} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Report
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
        <span>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} Students
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 font-bold text-slate-200">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
