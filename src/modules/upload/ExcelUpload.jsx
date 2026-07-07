import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, Play, X, Loader2 } from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import { convertExcelToPdf } from "../../services/assessmentService";

export default function ExcelUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;

    // Check size limit: max 12MB
    const MAX_SIZE = 12 * 1024 * 1024; // 12MB
    if (uploadedFile.size > MAX_SIZE) {
      showToast("File size exceeds the 12MB limit.", "error");
      return;
    }

    setFile(uploadedFile);
    setProgress(0);
    showToast(`File "${uploadedFile.name}" selected. Click "Generate Assessments" to upload.`, "success");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
    e.target.value = ""; // Reset value to allow uploading the same file again
  };

  const handleGenerate = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(20);
    showToast("Uploading and converting spreadsheet to PDF...", "info");

    try {
      setProgress(50);
      const response = await convertExcelToPdf(file);
      setProgress(85);
      
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const blob = response;
      const contentType = blob.type || "";
      console.log("[Convert PDF Response Content-Type]:", contentType);

      if (contentType.includes("json")) {
        const text = await blob.text();
        const result = JSON.parse(text);
        console.log("[Convert PDF Response JSON]:", result);
        
        const pdfBase64 = result.pdf || result.pdf_data || result.pdf_base64 || result.file;
        if (pdfBase64) {
          const byteCharacters = atob(pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${baseName}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }
      } else {
        console.log("[Convert PDF Response PDF Blob]:", blob);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      setProgress(100);
      showToast("Assessments generated and PDF report downloaded successfully!", "success");
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error("PDF generation/download failed:", error);
      showToast("Failed to generate assessments/PDF: " + error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="ww-page">

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
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.01] hover:border-[#2B7FFF]/45 active:scale-[0.99] relative overflow-hidden group cursor-pointer ${
            dragActive
              ? "border-[#2B7FFF] bg-[#2B7FFF]/5"
              : "border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50/60"
          }`}
        >
          <input
            type="file"
            accept=".csv, .xls, .xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          />
          <UploadCloud className="w-12 h-12 text-zinc-400 mb-4 animate-float group-hover:scale-110 transition-all duration-300" />
          <p className="text-xs font-bold text-zinc-700">Drag and drop your spreadsheet here</p>
          <p className="text-[10px] text-zinc-400 mt-1">Accepts CSV, XLS, XLSX files (Max 12MB)</p>
          
          <div className="relative mt-4">
            <button className="px-4 py-2 border border-zinc-200 rounded-xl bg-white text-xs font-bold text-zinc-600 shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:bg-zinc-50 group-active:scale-95 pointer-events-none">
              Choose File
            </button>
          </div>
        </div>

        {/* Upload progress indicator & Generate Actions */}
        {(uploading || file) && (
          <div className="mt-6 space-y-4">
            <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 flex items-center justify-between gap-4 animate-fade-in">
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
                    className="p-1 text-zinc-400 hover:text-slate-650 hover:bg-zinc-100 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end animate-fade-in">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={uploading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-emerald-600/10 flex items-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {uploading ? "Generating..." : "Generate Assessments"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
