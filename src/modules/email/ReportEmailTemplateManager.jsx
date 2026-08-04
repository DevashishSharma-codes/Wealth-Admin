import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Save,
  RotateCcw,
  Eye,
  Tag,
  Info,
  Check,
  Paperclip,
  Clock,
  UserCheck,
  AlertCircle,
  Code,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import {
  getEmailTemplate,
  updateEmailTemplate,
  resetEmailTemplate,
} from "../../services/emailTemplatesService";

const DEFAULT_SUBJECT = "Your Wealth Wisdom Goal Analysis Report is Ready";
const DEFAULT_BODY =
  "Dear {{client_name}},\n\nThank you for completing your financial goal assessment with Wealth Wisdom.\n\nPlease find your personalized Goal Analysis Report attached ({{attachment_name}}). It summarizes your goals, recommended investments, and planning insights based on the details you shared.\n\nOpen the attached PDF to review your report and keep this email for your records.\n\nIf you have any questions, reply to this email or contact us at info@wealthswisdom.com.\n\nWarm regards,\nTeam Wealth Wisdom\nhttps://wealthswisdom.com\n";

const AVAILABLE_PLACEHOLDERS = [
  { tag: "{{client_name}}", label: "Client Name", desc: "Replaced with client's full name" },
  { tag: "{{attachment_name}}", label: "Attachment Name", desc: "Replaced with PDF report filename" },
];

export default function ReportEmailTemplateManager() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);

  const [templateMetadata, setTemplateMetadata] = useState({
    id: null,
    templateKey: "report_delivery",
    name: "Report delivery",
    updatedBy: "Admin",
    updatedAt: null,
  });

  // Sample values for Live Preview
  const [sampleClientName, setSampleClientName] = useState("Rahul Sharma");
  const [sampleAttachmentName, setSampleAttachmentName] = useState("Wealth_Wisdom_Goal_Report.pdf");

  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' or 'json'

  const subjectInputRef = useRef(null);
  const bodyTextareaRef = useRef(null);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await getEmailTemplate("report_delivery");
      const data = res?.data || res;
      if (data) {
        if (data.subject !== undefined) setSubject(data.subject);
        if (data.body !== undefined) setBody(data.body);
        setTemplateMetadata({
          id: data.id || null,
          templateKey: data.template_key || "report_delivery",
          name: data.name || "Report delivery",
          updatedBy: data.updated_by || "Admin",
          updatedAt: data.updated_at || null,
        });
      }
    } catch (err) {
      console.warn("Could not fetch remote template, using default:", err);
      const isCors = err?.message?.includes("Network Error") || err?.status === 0;
      if (isCors) {
        setApiError("Backend route update pending on deployed server. Local editing & real-time preview active.");
      }
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholderToSubject = (tag) => {
    if (!subjectInputRef.current) {
      setSubject((prev) => prev + " " + tag);
      return;
    }
    const input = subjectInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newText = subject.substring(0, start) + tag + subject.substring(end);
    setSubject(newText);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const insertPlaceholderToBody = (tag) => {
    if (!bodyTextareaRef.current) {
      setBody((prev) => prev + " " + tag);
      return;
    }
    const textarea = bodyTextareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const newText = body.substring(0, start) + tag + body.substring(end);
    setBody(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!subject.trim()) {
      showToast("Subject line cannot be empty.", "error");
      return;
    }
    if (!body.trim()) {
      showToast("Email body content cannot be empty.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await updateEmailTemplate("report_delivery", {
        subject,
        body,
      });
      const data = res?.data || res;
      if (data) {
        if (data.subject) setSubject(data.subject);
        if (data.body) setBody(data.body);
        setTemplateMetadata((prev) => ({
          ...prev,
          updatedBy: data.updated_by || "Admin",
          updatedAt: data.updated_at || new Date().toISOString(),
        }));
      }
      showToast("Email template saved successfully!", "success");
    } catch (err) {
      console.error("Failed to update email template:", err);
      const errMsg = err?.message || "Failed to save email template.";
      showToast(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setResetting(true);
    setShowResetModal(false);
    try {
      const res = await resetEmailTemplate("report_delivery");
      const data = res?.data || res;
      if (data) {
        setSubject(data.subject || DEFAULT_SUBJECT);
        setBody(data.body || DEFAULT_BODY);
        setTemplateMetadata((prev) => ({
          ...prev,
          updatedBy: data.updated_by || "Admin",
          updatedAt: data.updated_at || new Date().toISOString(),
        }));
      } else {
        setSubject(DEFAULT_SUBJECT);
        setBody(DEFAULT_BODY);
      }
      showToast("Email template reset to default!", "success");
    } catch (err) {
      console.error("Failed to reset email template:", err);
      // Fallback client reset if API fails
      setSubject(DEFAULT_SUBJECT);
      setBody(DEFAULT_BODY);
      showToast("Template reset to default values locally.", "info");
    } finally {
      setResetting(false);
    }
  };

  // Rendered string calculations for live preview
  const previewSubject = (subject || "")
    .replaceAll("{{client_name}}", sampleClientName || "Client")
    .replaceAll("{{attachment_name}}", sampleAttachmentName || "Report.pdf");

  const previewBody = (body || "")
    .replaceAll("{{client_name}}", sampleClientName || "Client")
    .replaceAll("{{attachment_name}}", sampleAttachmentName || "Report.pdf");

  const formattedDate = templateMetadata.updatedAt
    ? new Date(templateMetadata.updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Default";

  return (
    <div className="space-y-6">
      {/* Top Banner / Template Info Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2B7FFF]/10 flex items-center justify-center text-[#2B7FFF]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-800">Report PDF Email Template</h3>
              <span className="text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md">
                report_delivery
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              Custom template sent to clients when their Goal Analysis PDF report is dispatched.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>By: <strong className="text-zinc-700">{templateMetadata.updatedBy}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Updated: <strong className="text-zinc-700">{formattedDate}</strong></span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-amber-800 text-xs font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Grid: Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Form Editor */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2B7FFF]" />
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Template Editor
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                disabled={saving || resetting || loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title="Reset template to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-medium text-zinc-400">
              Loading template content...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Subject Input Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Subject Line
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-semibold mr-1">Insert tag:</span>
                    {AVAILABLE_PLACEHOLDERS.map((p) => (
                      <button
                        key={p.tag}
                        type="button"
                        onClick={() => insertPlaceholderToSubject(p.tag)}
                        className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                        title={`Insert ${p.tag} into subject`}
                      >
                        + {p.tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  ref={subjectInputRef}
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Your Wealth Wisdom Goal Analysis Report is Ready"
                  className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] focus:bg-white text-zinc-800 transition-all font-sans"
                />
              </div>

              {/* Body Content Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Email Body Content (Plain Text with Placeholders)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-semibold mr-1">Insert tag:</span>
                    {AVAILABLE_PLACEHOLDERS.map((p) => (
                      <button
                        key={p.tag}
                        type="button"
                        onClick={() => insertPlaceholderToBody(p.tag)}
                        className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                        title={`Insert ${p.tag} into body`}
                      >
                        + {p.tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={bodyTextareaRef}
                  required
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Dear {{client_name}}, ..."
                  className="w-full text-xs font-normal bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 outline-none focus:border-[#2B7FFF] focus:bg-white text-zinc-800 transition-all font-mono leading-relaxed resize-y"
                />
              </div>

              {/* Available Placeholders Legend */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                  <Tag className="w-3.5 h-3.5 text-[#2B7FFF]" />
                  <span>Available Template Variables</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {AVAILABLE_PLACEHOLDERS.map((p) => (
                    <div
                      key={p.tag}
                      className="bg-white border border-zinc-200 rounded-lg p-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#2B7FFF]">
                          {p.tag}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400">{p.label}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-normal mt-1">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <p className="text-[11px] text-zinc-400 font-medium">
                  Changes take effect immediately for all future report emails.
                </p>

                <button
                  type="submit"
                  disabled={saving || resetting || !subject.trim() || !body.trim()}
                  className="px-5 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-[#2B7FFF]/50 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md shadow-[#2B7FFF]/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Template"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Interactive Live Preview Panel */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#2B7FFF]" />
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Live Client Email Preview
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Real-time Render
            </span>
          </div>

          {/* Sample Inputs for Testing Preview */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-zinc-400" />
              <span>Sample Preview Test Values</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-semibold text-zinc-500 mb-0.5">
                  Client Name:
                </label>
                <input
                  type="text"
                  value={sampleClientName}
                  onChange={(e) => setSampleClientName(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-zinc-500 mb-0.5">
                  Attachment Name:
                </label>
                <input
                  type="text"
                  value={sampleAttachmentName}
                  onChange={(e) => setSampleAttachmentName(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* Visual Email Preview Frame */}
          <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            {/* Email Header Bar */}
            <div className="bg-zinc-50 border-b border-zinc-200 p-4 space-y-2 text-xs">
              <div className="flex items-baseline justify-between border-b border-zinc-200/60 pb-1.5">
                <span className="font-bold text-zinc-400 uppercase text-[9px] w-14">From:</span>
                <span className="font-semibold text-zinc-800 flex-1">
                  Team Wealth Wisdom <span className="text-zinc-400 font-normal">&lt;info@wealthswisdom.com&gt;</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-zinc-200/60 pb-1.5">
                <span className="font-bold text-zinc-400 uppercase text-[9px] w-14">To:</span>
                <span className="font-semibold text-zinc-800 flex-1">
                  {sampleClientName || "Client"} <span className="text-zinc-400 font-normal">&lt;client@example.com&gt;</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-bold text-zinc-400 uppercase text-[9px] w-14">Subject:</span>
                <span className="font-bold text-[#2B7FFF] flex-1">
                  {previewSubject || "(Empty Subject)"}
                </span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 bg-white space-y-6">
              {/* Brand Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Wealth Wisdom" className="h-7 w-auto object-contain" />
                  <span className="text-sm font-bold text-zinc-900 tracking-tight">Wealth Wisdom</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold">Goal Analysis Service</span>
              </div>

              {/* Rendered Body Text */}
              <div className="text-xs font-normal text-zinc-700 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {previewBody ? (
                  previewBody
                ) : (
                  <span className="text-zinc-400 italic">No email body copy specified.</span>
                )}
              </div>

              {/* Attachment Pill Visual */}
              <div className="border border-zinc-200 bg-zinc-50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 truncate">
                      {sampleAttachmentName || "Report.pdf"}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium">PDF Attachment • Secured</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-1 rounded-md">
                  Attached
                </span>
              </div>

              {/* Email Footer */}
              <div className="border-t border-zinc-100 pt-4 text-[10px] text-zinc-400 font-medium space-y-1">
                <p>© {new Date().getFullYear()} Wealth Wisdom. All rights reserved.</p>
                <p>https://wealthswisdom.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-800">Reset Email Template?</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Are you sure you want to reset the report delivery template to system defaults?
                  This action will overwrite your custom subject and body.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Yes, Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
