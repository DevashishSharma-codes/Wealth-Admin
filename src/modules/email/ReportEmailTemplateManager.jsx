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
  FileEdit,
  Columns,
  Maximize2,
  Smartphone,
  Monitor,
  Copy,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Minus,
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

  // Responsive Layout Mode: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState("split");

  // Device Preview Mode: 'desktop' | 'mobile'
  const [deviceMode, setDeviceMode] = useState("desktop");

  const composerCardRef = useRef(null);
  const previewCardRef = useRef(null);

  const toggleSectionFullscreen = (elementRef, targetMode) => {
    if (!document.fullscreenElement) {
      if (elementRef.current && elementRef.current.requestFullscreen) {
        elementRef.current.requestFullscreen().catch(() => {
          document.documentElement.requestFullscreen().catch(() => {});
        });
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setViewMode(targetMode);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setViewMode("split");
    }
  };

  const exitFullscreenAndNormalize = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setViewMode("split");
  };

  // Sample values for Live Preview
  const [sampleClientName, setSampleClientName] = useState("Rahul Sharma");
  const [sampleAttachmentName, setSampleAttachmentName] = useState("Wealth_Wisdom_Goal_Report.pdf");
  const [showSampleControls, setShowSampleControls] = useState(false);

  // Variable helper drawer state
  const [showVariablesDrawer, setShowVariablesDrawer] = useState(false);
  const [copiedTag, setCopiedTag] = useState(null);

  const [apiError, setApiError] = useState(null);

  const subjectInputRef = useRef(null);
  const bodyTextareaRef = useRef(null);
  const lastFocusedInputRef = useRef("body"); // 'subject' | 'body'

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

  const insertPlaceholder = (tag) => {
    if (lastFocusedInputRef.current === "subject" && subjectInputRef.current) {
      const input = subjectInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newText = subject.substring(0, start) + tag + subject.substring(end);
      setSubject(newText);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else if (bodyTextareaRef.current) {
      const textarea = bodyTextareaRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newText = body.substring(0, start) + tag + body.substring(end);
      setBody(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      setBody((prev) => prev + " " + tag);
    }
    showToast(`Inserted ${tag} into template`, "info");
  };

  const copyTagToClipboard = async (tag) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      showToast(`Copied ${tag} to clipboard!`, "success");
      setTimeout(() => setCopiedTag(null), 2000);
    } catch {
      showToast("Failed to copy variable", "error");
    }
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
      {/* Top Banner: Glass Metadata Bar & Layout Control Bar */}
      <div className="mac-window rounded-2xl p-4 md:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-[#2B7FFF] shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                Report PDF Delivery Template
              </h3>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/25 text-[#2B7FFF] px-2 py-0.5 rounded-full">
                report_delivery
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              Automated PDF goal assessment email sent directly to clients.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Metadata Badges */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-zinc-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>By: <strong className="text-zinc-700">{templateMetadata.updatedBy}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-zinc-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Updated: <strong className="text-zinc-700">{formattedDate}</strong></span>
            </div>
          </div>

          {/* macOS Segmented Layout Mode Switcher */}
          <div className="mac-segmented-bg p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-white text-[#2B7FFF] shadow-md shadow-black/5"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Side-by-side Editor & Preview split view"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "editor"
                  ? "bg-white text-[#2B7FFF] shadow-md shadow-black/5"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Full width Composer Editor focus mode"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Composer Focus</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-white text-[#2B7FFF] shadow-md shadow-black/5"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Full width Client Live Email Preview mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Live Preview</span>
            </button>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3 text-amber-800 text-xs font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Grid: Responsive View Layout */}
      <div
        className={`grid gap-6 transition-all duration-300 ${
          viewMode === "split"
            ? "grid-cols-1 xl:grid-cols-12 items-start"
            : "grid-cols-1"
        }`}
      >
        {/* Left Column: Form Editor Window */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div
            ref={composerCardRef}
            className={`mac-window rounded-3xl p-6 md:p-8 space-y-6 transition-all duration-300 ${
              viewMode === "split"
                ? "xl:col-span-7 shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl"
                : "w-full max-w-5xl mx-auto shadow-2xl bg-white/95 backdrop-blur-3xl border border-white ring-1 ring-black/5 animate-fade-in"
            }`}
          >
            {/* macOS Window Title bar with Traffic Lights */}
            <div className="border-b border-zinc-200/60 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Interactive macOS Window Traffic Lights for Composer */}
                <div className="flex items-center gap-1.5 group/traffic">
                  {/* Red: Close Focus Mode / Reset Form */}
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMode !== "split" || document.fullscreenElement) {
                        exitFullscreenAndNormalize();
                      } else {
                        setShowResetModal(true);
                      }
                    }}
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 flex items-center justify-center text-[#4C0000] hover:bg-[#E0443E] transition-all cursor-pointer shadow-xs"
                    title={viewMode !== "split" ? "Close Full Screen Focus Mode" : "Reset Template to System Defaults"}
                  >
                    <X className="w-2.5 h-2.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  </button>
                  {/* Yellow: Minimize to Normal Screen */}
                  <button
                    type="button"
                    onClick={exitFullscreenAndNormalize}
                    className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 flex items-center justify-center text-[#5C4000] hover:bg-[#DEA123] transition-all cursor-pointer shadow-xs"
                    title="Minimize to Normal Screen"
                  >
                    <Minus className="w-2.5 h-2.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  </button>
                  {/* Green: Maximize / Open Section in Full Screen */}
                  <button
                    type="button"
                    onClick={() => toggleSectionFullscreen(composerCardRef, "editor")}
                    className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 flex items-center justify-center text-[#0A4D00] hover:bg-[#1AAB29] transition-all cursor-pointer shadow-xs"
                    title="Maximize Section in Full Screen Mode"
                  >
                    <Maximize2 className="w-2.5 h-2.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  </button>
                </div>
                <div className="h-4 w-px bg-zinc-200/80" />
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-[#2B7FFF]" /> Template Composer
                </span>
                {viewMode === "editor" && (
                  <span className="text-[9.5px] font-bold text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/25 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                    Full Screen Mode
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVariablesDrawer((prev) => !prev)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    showVariablesDrawer
                      ? "bg-blue-500/10 text-[#2B7FFF] border border-blue-500/30"
                      : "text-zinc-500 hover:text-zinc-800 border border-zinc-200/80 hover:bg-white/80"
                  }`}
                  title="Toggle available variables legend"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Variables</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={saving || resetting || loading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200/80 hover:border-rose-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  title="Reset template to default values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs font-medium text-zinc-400 space-y-2">
                <div className="w-6 h-6 border-2 border-[#2B7FFF] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading template configuration...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {/* Variable Tags Bar */}
                <div className="bg-white/60 backdrop-blur-md border border-zinc-200/70 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#2B7FFF]" /> Quick Variable Tags
                    </span>
                    <span className="text-[10px] text-zinc-400">Click to insert into focused field</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {AVAILABLE_PLACEHOLDERS.map((p) => (
                      <button
                        key={p.tag}
                        type="button"
                        onClick={() => insertPlaceholder(p.tag)}
                        className="mac-chip flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#2B7FFF] cursor-pointer"
                        title={`Insert ${p.tag} (${p.label})`}
                      >
                        <span className="text-zinc-400 font-sans font-normal text-[11px]">
                          {p.label}:
                        </span>
                        <span>{p.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expandable Variables Reference Drawer */}
                {showVariablesDrawer && (
                  <div className="bg-zinc-900/90 text-white backdrop-blur-xl border border-zinc-700/60 rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-700/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Supported Template Variables
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowVariablesDrawer(false)}
                        className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                      >
                        Close ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVAILABLE_PLACEHOLDERS.map((p) => (
                        <div
                          key={p.tag}
                          className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-blue-400">
                              {p.tag}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyTagToClipboard(p.tag)}
                              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedTag === p.tag ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedTag === p.tag ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-300 font-normal">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subject Line Input */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Email Subject Line
                  </label>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    required
                    value={subject}
                    onFocus={() => (lastFocusedInputRef.current = "subject")}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Your Wealth Wisdom Goal Analysis Report is Ready"
                    className="glass-input w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none text-zinc-800 transition-all font-sans"
                  />
                </div>

                {/* Body Content Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Email Body Content (Plain Text with Variables)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {body.length} chars • {body.split("\n").length} lines
                    </span>
                  </div>
                  <textarea
                    ref={bodyTextareaRef}
                    required
                    rows={12}
                    value={body}
                    onFocus={() => (lastFocusedInputRef.current = "body")}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Dear {{client_name}}, ..."
                    className="glass-input w-full text-xs font-normal rounded-xl p-4 outline-none text-zinc-800 transition-all font-mono leading-relaxed resize-y min-h-[260px]"
                  />
                </div>

                {/* Submit Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-200/50">
                  <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                    Changes take effect automatically for future report emails.
                  </p>

                  <button
                    type="submit"
                    disabled={saving || resetting || !subject.trim() || !body.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#2B7FFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-[#2B7FFF]/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving Changes..." : "Save Template"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Right Column: Interactive Live Preview Window */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div
            ref={previewCardRef}
            className={`mac-window rounded-3xl p-6 md:p-8 space-y-5 transition-all duration-300 ${
              viewMode === "split"
                ? "xl:col-span-5 shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl"
                : "w-full max-w-5xl mx-auto shadow-2xl bg-white/95 backdrop-blur-3xl border border-white ring-1 ring-black/5 animate-fade-in"
            }`}
          >
            {/* macOS Window Header & Device Toggle */}
            <div className="border-b border-zinc-200/60 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Interactive macOS Window Traffic Lights for Live Preview */}
                <div className="flex items-center gap-1.5 group/traffic">
                  {/* Red: Close Focus / Reset Sample Data */}
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMode !== "split" || document.fullscreenElement) {
                        exitFullscreenAndNormalize();
                      } else {
                        setSampleClientName("Rahul Sharma");
                        showToast("Reset sample client data", "info");
                      }
                    }}
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 flex items-center justify-center text-[#4C0000] hover:bg-[#E0443E] transition-all cursor-pointer shadow-xs"
                    title={viewMode !== "split" ? "Close Full Screen Focus Mode" : "Reset Sample Client Data"}
                  >
                    <X className="w-2.5 h-2.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  </button>
                  {/* Yellow: Minimize to Normal Screen */}
                  <button
                    type="button"
                    onClick={exitFullscreenAndNormalize}
                    className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 flex items-center justify-center text-[#5C4000] hover:bg-[#DEA123] transition-all cursor-pointer shadow-xs"
                    title="Minimize to Normal Screen"
                  >
                    <Minus className="w-2.5 h-2.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  </button>
                  {/* Green: Open Section in Full Screen */}
                  <button
                    type="button"
                    onClick={() => toggleSectionFullscreen(previewCardRef, "preview")}
                    className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 flex items-center justify-center text-[#0A4D00] hover:bg-[#1AAB29] transition-all cursor-pointer shadow-xs"
                    title="Maximize Section in Full Screen Mode"
                  >
                    <Maximize2 className="w-2.5 h-2.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  </button>
                </div>
                <div className="h-4 w-px bg-zinc-200/80" />
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2B7FFF]" /> Live Client Preview
                </span>
                {viewMode === "preview" && (
                  <span className="text-[9.5px] font-bold text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/25 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                    Full Screen Mode
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop vs Mobile Device Toggle */}
                <div className="bg-zinc-200/60 p-0.5 rounded-lg flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      deviceMode === "desktop"
                        ? "bg-white text-[#2B7FFF] shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                    title="Desktop Email Window Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      deviceMode === "mobile"
                        ? "bg-white text-[#2B7FFF] shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                    title="Mobile iPhone Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSampleControls((prev) => !prev)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    showSampleControls
                      ? "bg-blue-500/10 border-blue-500/30 text-[#2B7FFF]"
                      : "bg-white/80 border-zinc-200/80 text-zinc-500 hover:text-zinc-800"
                  }`}
                  title="Toggle Test Sample Values"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Collapsible Sample Inputs Panel */}
            {showSampleControls && (
              <div className="bg-white/80 backdrop-blur-md border border-zinc-200/80 rounded-xl p-3.5 space-y-2.5 animate-fade-in">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#2B7FFF]" /> Test Variable Inputs
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-500 mb-0.5">
                      Client Name:
                    </label>
                    <input
                      type="text"
                      value={sampleClientName}
                      onChange={(e) => setSampleClientName(e.target.value)}
                      className="glass-input w-full text-xs font-medium rounded-lg px-2.5 py-1 text-zinc-800"
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
                      className="glass-input w-full text-xs font-medium rounded-lg px-2.5 py-1 text-zinc-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Visual Preview Device Container */}
            <div
              className={`transition-all duration-300 ${
                deviceMode === "mobile" ? "py-4" : ""
              }`}
            >
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  deviceMode === "mobile"
                    ? "iphone-frame shadow-2xl"
                    : "border border-zinc-200/80 rounded-2xl bg-white shadow-md"
                }`}
              >
                {/* Mobile iPhone Notch / Status Bar (Only in Mobile Mode) */}
                {deviceMode === "mobile" && (
                  <div className="bg-zinc-950 px-5 py-2 text-white flex items-center justify-between text-[11px] font-semibold shrink-0">
                    <span>9:41</span>
                    <div className="w-14 h-2.5 bg-zinc-800 rounded-full mx-auto" />
                    <span className="text-[9px] font-mono">100%</span>
                  </div>
                )}

                <div className={deviceMode === "mobile" ? "iphone-screen" : ""}>
                  {/* macOS Mail Header Pane */}
                  <div className="bg-zinc-50/90 border-b border-zinc-200/80 p-3 space-y-1 text-xs shrink-0">
                    <div className="flex items-baseline justify-between border-b border-zinc-200/60 pb-1">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] w-12">From:</span>
                      <span className="font-semibold text-zinc-800 flex-1 truncate text-[11px]">
                        Team Wealth Wisdom <span className="text-zinc-400 font-normal">&lt;info@wealthswisdom.com&gt;</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-b border-zinc-200/60 pb-1">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] w-12">To:</span>
                      <span className="font-semibold text-zinc-800 flex-1 truncate text-[11px]">
                        {sampleClientName || "Client"} <span className="text-zinc-400 font-normal">&lt;client@example.com&gt;</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] w-12">Subject:</span>
                      <span className="font-bold text-[#2B7FFF] flex-1 truncate text-[11px]">
                        {previewSubject || "(Empty Subject)"}
                      </span>
                    </div>
                  </div>

                  {/* Email Body Pane */}
                  <div className="p-4 sm:p-5 bg-white space-y-4 flex-1">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Wealth Wisdom" className="h-6 w-auto object-contain" />
                        <span className="text-xs font-extrabold text-zinc-900 tracking-tight">Wealth Wisdom</span>
                      </div>
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        Verified Report
                      </span>
                    </div>

                    {/* Rendered Body Text */}
                    <div className="text-xs font-normal text-zinc-700 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                      {previewBody ? (
                        previewBody
                      ) : (
                        <span className="text-zinc-400 italic">No email body copy specified yet...</span>
                      )}
                    </div>

                    {/* PDF Attachment Pill Card */}
                    <div className="border border-zinc-200 bg-gradient-to-r from-zinc-50 to-blue-50/20 rounded-xl p-3 flex items-center justify-between gap-2.5 shadow-2xs hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-zinc-800 truncate">
                            {sampleAttachmentName || "Report.pdf"}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-medium">PDF Document • 2.4 MB • Encrypted</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-blue-600 bg-white border border-blue-200/80 px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
                        Attached
                      </span>
                    </div>

                    {/* Email Footer */}
                    <div className="border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 font-medium space-y-1">
                      <p>© {new Date().getFullYear()} Wealth Wisdom Platform. All rights reserved.</p>
                      <p className="text-zinc-400">https://wealthswisdom.com</p>
                    </div>
                  </div>
                </div>

                {/* iPhone Bottom Home Indicator Bar */}
                {deviceMode === "mobile" && (
                  <div className="bg-zinc-950 py-1 flex justify-center shrink-0">
                    <div className="w-20 h-1 bg-zinc-600 rounded-full" />
                  </div>
                )}


              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4 animate-fade-in">
          <div className="mac-window rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-white/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Reset Email Template?</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Are you sure you want to reset the report delivery template to system defaults?
                  This action will overwrite your custom subject and body.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-200/60">
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
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer transition-colors shadow-md shadow-rose-600/20"
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
