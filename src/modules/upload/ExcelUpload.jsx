import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, Play, CheckCircle, Database, RefreshCw, X, AlertCircle } from "lucide-react";
import Toast from "../../components/UI/Toast";

export default function ExcelUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const [previewData, setPreviewData] = useState([]);

  // Mock parsed spreadsheet preview list
  const mockSpreadsheetRows = [
    { name: "Karan Johar", email: "karan.j@bollywealth.com", phone: "+91 9988776655", occupation: "Film Director", status: "Ready" },
    { name: "Meera Nair", email: "meera.nair@cinema.in", phone: "+91 9822334455", occupation: "Creative Producer", status: "Ready" },
    { name: "Dev Patel", email: "dev.patel@globalactor.co", phone: "+1 555 102 3049", occupation: "Director", status: "Ready" },
    { name: "Preeti Shenoy", email: "preeti@authorworld.in", phone: "+91 8877665544", occupation: "Novelist", status: "Ready" },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateUpload = (fileName) => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setPreviewData(mockSpreadsheetRows);
          setToast({
            message: `Excel sheet "${fileName}" uploaded and parsed successfully.`,
            type: "success",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      simulateUpload(droppedFile.name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      simulateUpload(selectedFile.name);
    }
  };

  const handleGenerate = () => {
    setToast({
      message: `Initiating assessment builders for ${previewData.length} records.`,
      type: "info",
    });
    setTimeout(() => {
      setToast({
        message: "Assessments generated successfully. Log entries appended to database.",
        type: "success",
      });
      setPreviewData([]);
      setFile(null);
    }, 2000);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setProgress(0);
  };

  return (
    <div className="ww-page">
      {/* Toast notifications */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "info" })}
        />
      )}

      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">Excel Upload</h2>
          <p className="ww-page-subtitle">Bulk import client records to spawn assessments in batches.</p>
        </div>
      </div>

      {/* Dropzone Container */}
      <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs max-w-3xl">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
            dragActive
              ? "border-indigo-500 bg-[#2B7FFF]/5/10"
              : "border-zinc-200 bg-zinc-50/30 hover:border-slate-350"
          }`}
        >
          <UploadCloud className="w-12 h-12 text-zinc-400 mb-4 animate-float" />
          <p className="text-xs font-bold text-zinc-700">Drag and drop your spreadsheet here</p>
          <p className="text-[10px] text-zinc-400 mt-1">Accepts CSV, XLS, XLSX files (Max 12MB)</p>
          
          <div className="relative mt-4">
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <button className="px-4 py-2 border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-600 transition-colors shadow-xs">
              Choose File
            </button>
          </div>
        </div>

        {/* Upload progress indicator */}
        {(uploading || file) && (
          <div className="mt-6 p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#2B7FFF]/5 border border-[#2B7FFF]/10 flex items-center justify-center text-[#2B7FFF] shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-zinc-700 truncate">{file?.name || "Uploading..."}</span>
                <span className="block text-[9px] text-zinc-400 font-semibold">Size: {(file?.size ? (file.size / 1024).toFixed(1) : "0")} KB</span>
                
                {uploading && (
                  <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-[#2B7FFF] h-full rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {uploading ? (
                <span className="text-xs font-extrabold text-[#2B7FFF]">{progress}%</span>
              ) : (
                <button
                  onClick={clearFile}
                  className="p-1 text-zinc-400 hover:text-slate-650 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spreadsheet Preview Grid Table */}
      {previewData.length > 0 && (
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4 animate-fade-in max-w-5xl">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Spreadsheet Parse Preview
              </h3>
              <p className="text-[10px] text-zinc-400">Parsed rows ready to compile to platform database.</p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Generate Assessments
            </button>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-medium bg-zinc-50/50">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Occupation</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-slate-750">
                {previewData.map((row, index) => (
                  <tr key={index} className="hover:bg-zinc-50/30">
                    <td className="py-2.5 px-3 font-semibold text-zinc-800">{row.name}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{row.email}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{row.phone}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{row.occupation}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle className="w-3 h-3" /> {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
