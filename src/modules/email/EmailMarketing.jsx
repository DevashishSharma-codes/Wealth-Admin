import React, { useState } from "react";
import { Mail, Eye, Send, Paperclip, Bold, Italic, List, Link, X, AlertTriangle, FileText } from "lucide-react";
import Toast from "../../components/UI/Toast";

export default function EmailMarketing() {
  const [recipientGroup, setRecipientGroup] = useState("All Leads");
  const [customRecipients, setCustomRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [attachmentError, setAttachmentError] = useState(null);

  const maxTotalSize = 12 * 1024 * 1024; // 12MB in bytes

  const handleAttachment = (e) => {
    setAttachmentError(null);
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Calculate current total size
      const currentTotal = attachments.reduce((sum, f) => sum + f.size, 0);
      const incomingTotal = newFiles.reduce((sum, f) => sum + f.size, 0);

      if (currentTotal + incomingTotal > maxTotalSize) {
        setAttachmentError("Attachments size exceeds the maximum limit of 12MB.");
        setToast({
          message: "Unable to attach. File limits exceeded.",
          type: "error",
        });
        return;
      }

      setAttachments((prev) => [...prev, ...newFiles]);
      setToast({
        message: `${newFiles.length} file(s) attached successfully.`,
        type: "success",
      });
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachmentError(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject || !emailBody) {
      alert("Please fill in the subject and email body fields.");
      return;
    }
    if (recipientGroup === "Custom Email" && !customRecipients) {
      alert("Please enter at least one recipient email address.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setToast({
        message: `Email campaign dispatched successfully to ${
          recipientGroup === "Custom Email" ? customRecipients : `segment "${recipientGroup}"`
        }.`,
        type: "success",
      });
      // Clear forms
      setSubject("");
      setEmailBody("");
      setAttachments([]);
      setCustomRecipients("");
    }, 2000);
  };

  const formatText = (command) => {
    // Simple rich text simulations
    if (command === "bold") {
      setEmailBody((prev) => prev + " **bold text**");
    } else if (command === "italic") {
      setEmailBody((prev) => prev + " *italic text*");
    } else if (command === "list") {
      setEmailBody((prev) => prev + "\n- Bullet item");
    } else if (command === "link") {
      setEmailBody((prev) => prev + " [link text](https://example.com)");
    }
  };

  return (
    <div className="ww-page">
      {/* Toast alert */}
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
          <h2 className="ww-page-title">Email & Marketing Campaign</h2>
          <p className="ww-page-subtitle">Author and dispatch customized campaigns directly to selected user segments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Form Panel */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2B7FFF]" />
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Email Composer</span>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Recipient Segment */}
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Recipient Segment Audience
                </label>
                <select
                  value={recipientGroup}
                  onChange={(e) => {
                    setRecipientGroup(e.target.value);
                    if (e.target.value !== "Custom Email") {
                      setCustomRecipients("");
                    }
                  }}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="All Leads">All Leads (Flow 1 + get-in-touch)</option>
                  <option value="All Clients">All Clients (Unique users by email)</option>
                  <option value="Custom Email">Custom Email (Specify recipients)</option>
                  <option value="High Net Worth Clients (Potential > ₹2Cr)">High Net Worth Clients (Potential &gt; ₹2Cr)</option>
                  <option value="Retirement Age Approaching (< 10 Years)">Retirement Age Approaching (&lt; 10 Years)</option>
                </select>
              </div>

              {recipientGroup === "Custom Email" && (
                <div className="animate-fade-in space-y-1">
                  <label className="block text-[10px] font-bold text-[#2B7FFF] text-[#2B7FFF] uppercase tracking-wider mb-1">
                    Custom Recipient Emails (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. client1@example.com, client2@example.com"
                    value={customRecipients}
                    onChange={(e) => setCustomRecipients(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Review Your Upcoming Retirement Plan Details"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Rich text tool bar */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Email Content Body
              </label>
              
              {/* Tool bar */}
              <div className="flex border border-b-0 border-zinc-200 rounded-t-xl bg-zinc-50 px-2 py-1 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className="p-1 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-md cursor-pointer"
                  title="Bold text"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className="p-1 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-md cursor-pointer"
                  title="Italic text"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("list")}
                  className="p-1 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-md cursor-pointer"
                  title="List bullets"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("link")}
                  className="p-1 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-md cursor-pointer"
                  title="Add web links"
                >
                  <Link className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                required
                rows="8"
                placeholder="Write your email body copy here..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-b-xl px-3 py-2.5 outline-none focus:border-indigo-500 font-medium font-sans resize-none"
              />
            </div>

            {/* Attachment inputs */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Attachments (Max 12MB Total)
                </label>
                <span className="text-[9px] text-zinc-400 font-bold">
                  {(attachments.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)}MB / 12MB
                </span>
              </div>

              {attachmentError && (
                <div className="mb-2 bg-rose-50 border border-rose-100 text-rose-800 px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 animate-fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> {attachmentError}
                </div>
              )}

              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleAttachment}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <button
                  type="button"
                  className="w-full py-2 border border-dashed border-slate-300 hover:border-slate-450 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 text-xs font-bold text-zinc-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" /> Attach campaign files
                </button>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="p-2 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-[11px] font-medium text-zinc-700 animate-fade-in">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[9px] text-zinc-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-zinc-400 hover:text-zinc-600 p-0.5 hover:bg-zinc-200/50 rounded-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Campaign button */}
            <div className="flex justify-end pt-4 border-t border-zinc-100 mt-6">
              <button
                type="submit"
                disabled={sending || !subject || !emailBody}
                className="px-5 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-[#2B7FFF]/50 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md shadow-[#2B7FFF]/10"
              >
                <Send className="w-4 h-4" /> {sending ? "Sending Campaign..." : "Send Campaign"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#2B7FFF]" />
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Live Campaign Preview</span>
          </div>

          <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs bg-zinc-50">
            {/* Header info bar */}
            <div className="bg-white border-b border-slate-150 p-4 space-y-1.5 text-xs text-slate-650">
              <div>
                <span className="font-bold text-zinc-400 mr-2 uppercase text-[9px]">To:</span>
                <span className="bg-[#2B7FFF]/5 text-[#2B7FFF] px-2 py-0.5 rounded-md font-bold text-[10px]">
                  {recipientGroup === "Custom Email"
                    ? (customRecipients || "Specify custom emails above")
                    : recipientGroup}
                </span>
              </div>
              <div className="border-t border-zinc-100 pt-1.5">
                <span className="font-bold text-zinc-400 mr-2 uppercase text-[9px]">Subject:</span>
                <span className="font-bold text-zinc-800">{subject || "(Untitled Subject Line)"}</span>
              </div>
            </div>

            {/* Email Body pane */}
            <div className="p-6 bg-white min-h-[220px] text-zinc-800 text-xs leading-relaxed font-sans space-y-4">
              <div className="border-b border-zinc-200 pb-4">
                {/* Logo placeholder */}
                <span className="text-sm font-extrabold text-[#2B7FFF] tracking-tight">Wealth Wisdom</span>
              </div>

              <div className="whitespace-pre-wrap font-medium">
                {emailBody || (
                  <span className="text-slate-350 italic font-normal">
                    Email content body copy will display here in real-time as you write...
                  </span>
                )}
              </div>

              <div className="border-t border-zinc-200 pt-4 text-[10px] text-zinc-400 font-semibold space-y-1">
                <span>© {new Date().getFullYear()} Wealth Wisdom Platform. All rights reserved.</span>
                <span className="block text-zinc-400">You are receiving this communication as a registered advisor administrator.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
