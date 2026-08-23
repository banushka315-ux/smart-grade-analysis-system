/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewCards } from './components/OverviewCards';
import { PdfUploader } from './components/PdfUploader';
import { SubjectPassAnalysis } from './components/SubjectPassAnalysis';
import { SubjectGradeSegregation } from './components/SubjectGradeSegregation';
import { GradeDistributionPieChart } from './components/GradeDistributionPieChart';
import { SubjectComparisonChart } from './components/SubjectComparisonChart';
import { TopWeakSubjects } from './components/TopWeakSubjects';
import { TopStudentsTable } from './components/TopStudentsTable';
import { StudentSearchTable } from './components/StudentSearchTable';
import { StudentProfileModal } from './components/StudentProfileModal';
import { ExportReports } from './components/ExportReports';

import { UniversityDataset, StudentResult } from './types';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { computeOverallSummary, computeSubjectAnalyses, getTopStudents, getLowestStudents } from './lib/analytics';
import { exportToPDFReport, exportToExcel } from './lib/exportUtils';

export default function App() {
  const [allDatasets, setAllDatasets] = useState<UniversityDataset[]>(SAMPLE_DATASETS);
  const [currentDataset, setCurrentDataset] = useState<UniversityDataset>(SAMPLE_DATASETS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Compute analytics dynamically based on current dataset
  const summary = useMemo(() => computeOverallSummary(currentDataset.students), [currentDataset]);
  const subjects = useMemo(() => computeSubjectAnalyses(currentDataset.students), [currentDataset]);
  const topStudents = useMemo(() => getTopStudents(currentDataset.students, 10), [currentDataset]);
  const lowestStudents = useMemo(() => getLowestStudents(currentDataset.students, 10), [currentDataset]);

  const handleDatasetLoaded = (newDataset: UniversityDataset) => {
    setAllDatasets((prev) => [newDataset, ...prev.filter((d) => d.id !== newDataset.id)]);
    setCurrentDataset(newDataset);
    setActiveTab('dashboard');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Header */}
      <Header
        currentDataset={currentDataset}
        allDatasets={allDatasets}
        onSelectDataset={setCurrentDataset}
        onOpenUploadModal={() => setActiveTab('upload')}
        onExportPDF={() => exportToPDFReport(currentDataset, subjects, summary)}
        onExportExcel={() => exportToExcel(currentDataset, subjects, summary)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Layout Container */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          studentCount={summary.totalStudents}
          subjectCount={summary.totalSubjects}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* 1. Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <OverviewCards summary={summary} topStudent={topStudents[0]} />
              <SubjectGradeSegregation subjects={subjects} dataset={currentDataset} summary={summary} />
              <SubjectPassAnalysis subjects={subjects} />
              <TopWeakSubjects subjects={subjects} />
              <TopStudentsTable
                topStudents={topStudents}
                lowestStudents={lowestStudents}
                onSelectStudent={setSelectedStudent}
              />
            </div>
          )}

          {/* 2. Upload PDF View */}
          {activeTab === 'upload' && (
            <PdfUploader
              onDatasetLoaded={handleDatasetLoaded}
              allDatasets={allDatasets}
            />
          )}

          {/* 3. Subject Grade Segregation View */}
          {activeTab === 'subject-segregation' && (
            <SubjectGradeSegregation subjects={subjects} dataset={currentDataset} summary={summary} />
          )}

          {/* 4. Subject Pass Analysis View */}
          {activeTab === 'subject-pass' && (
            <SubjectPassAnalysis subjects={subjects} />
          )}

          {/* 4. Grade Distribution Pie Chart View */}
          {activeTab === 'grade-distribution' && (
            <GradeDistributionPieChart subjects={subjects} />
          )}

          {/* 5. Analytics & Comparison View */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <SubjectComparisonChart subjects={subjects} />
              <TopWeakSubjects subjects={subjects} />
            </div>
          )}

          {/* 6. Student Roster & Search View */}
          {activeTab === 'students' && (
            <StudentSearchTable
              students={currentDataset.students}
              subjects={subjects}
              onSelectStudent={setSelectedStudent}
            />
          )}

          {/* 7. Export Reports View */}
          {activeTab === 'exports' && (
            <ExportReports
              dataset={currentDataset}
              subjects={subjects}
              summary={summary}
            />
          )}
        </main>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
