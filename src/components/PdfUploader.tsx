import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Download, RefreshCw, Cpu, Scan, Image } from 'lucide-react';
import { UniversityDataset } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { generateSampleResultPDF } from '../lib/exportUtils';

interface PdfUploaderProps {
  onDatasetLoaded: (dataset: UniversityDataset) => void;
  allDatasets: UniversityDataset[];
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onDatasetLoaded, allDatasets }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parseLog, setParseLog] = useState<string | null>(null);
  const [isOcrActive, setIsOcrActive] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setErrorMessage('Please upload a valid PDF (.pdf) or scanned image (.png, .jpg, .webp).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setIsOcrActive(false);
    setUploadStatus(`Reading file (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);
    setParseLog('Initializing PDF & OCR extraction pipeline...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        setUploadStatus(isImage ? 'Processing scanned image with Optical Character Recognition (OCR)...' : 'Analyzing document layout & OCR engine...');

        try {
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              fileName: file.name,
              mimeType: file.type || (isPdf ? 'application/pdf' : 'image/png')
            })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            if (data.isScanned || data.ocrAttempted) {
              setIsOcrActive(true);
            }
            throw new Error(data.error || 'Failed to extract result data from document.');
          }

          if (data.isScanned || data.ocrAttempted) {
            setIsOcrActive(true);
          }

          const methodLabel = data.method === 'gemini-ocr-multimodal'
            ? 'Gemini Multimodal OCR Vision Engine'
            : data.method === 'tesseract-ocr'
            ? 'Tesseract.js OCR Engine'
            : data.method === 'gemini-ai'
            ? 'Gemini AI Parser'
            : 'Regex Heuristic Parser';

          setParseLog(`Extracted ${data.students?.length || 0} student records using ${methodLabel}. ${data.isScanned ? ' (Scanned Document OCR)' : ''}`);

          const newDataset: UniversityDataset = {
            id: `pdf-${Date.now()}`,
            title: `${file.name.replace(/\.[^/.]+$/, '')} Analysis`,
            universityName: data.universityName || 'University Examination Gazette',
            department: data.department || 'Department Result',
            batch: data.batch || '2022-2026',
            semester: data.semester || 'Semester VI',
            academicYear: '2025-2026',
            uploadDate: new Date().toISOString().split('T')[0],
            students: data.students || [],
            fileName: file.name
          };

          onDatasetLoaded(newDataset);
          setUploadStatus(`Extraction Complete! Loaded ${data.students.length} students.`);
        } catch (apiErr: any) {
          console.error('API parse error:', apiErr);
          setErrorMessage(apiErr.message || 'Error processing PDF or scanned image on server.');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to read local document file.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-8 lg:p-12 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
        }`}
      >
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            {loading ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-100">Upload University Result PDF or Scan</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <Scan className="w-3 h-3 text-indigo-400" /> OCR Pipeline Integrated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Supports native text PDFs, scanned image PDFs, and direct result images (.png, .jpg, .webp).
              Optical Character Recognition (OCR) converts image scans into structured student records automatically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <label className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition-all inline-flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Select PDF or Image Scan</span>
              <input
                type="file"
                accept=".pdf,application/pdf,image/png,image/jpeg,image/webp,image/bmp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                disabled={loading}
              />
            </label>

            <button
              onClick={() => generateSampleResultPDF(SAMPLE_DATASETS[0])}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl transition-all inline-flex items-center gap-2"
              title="Download a sample University Result PDF to test uploading!"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download Sample PDF to Test
            </button>
          </div>

          {/* Status & Loader */}
          {loading && (
            <div className="pt-4 space-y-2">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full animate-pulse w-3/4"></div>
              </div>
              <p className="text-xs font-medium text-indigo-400">{uploadStatus}</p>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs text-left space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Extraction or OCR Error</span>
              </div>
              <p className="text-slate-300 pl-6">{errorMessage}</p>
              {isOcrActive && (
                <p className="text-[11px] text-rose-300/80 pl-6 pt-1 italic">
                  Tip: If your document is a physical scan or photograph, make sure the camera is aligned, lighting is even, and text is unblurred.
                </p>
              )}
            </div>
          )}

          {/* Log Message */}
          {parseLog && !errorMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{parseLog}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preset Dataset Picker Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Pre-loaded Sample Datasets (Instant Preview)
          </h3>
          <span className="text-xs text-slate-400">Click any preset to load analysis instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_DATASETS.map((ds) => (
            <div
              key={ds.id}
              onClick={() => onDatasetLoaded(ds)}
              className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all hover:bg-slate-800/80 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  {ds.semester}
                </span>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {ds.title}
                </h4>
                <p className="text-xs text-slate-400">{ds.universityName}</p>
                <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-3">
                  <span>🎓 {ds.students.length} Students</span>
                  <span>📚 {ds.students[0]?.subjects.length || 0} Subjects</span>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

