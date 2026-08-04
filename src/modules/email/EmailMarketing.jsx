import { useState, useRef, useEffect } from "react";
import {
  Mail,
  Eye,
  Send,
  Paperclip,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  X,
  AlertTriangle,
  FileText,
  ChevronDown,
  Search,
  Copy,
  Check,
  Users,
  Columns,
  FileEdit,
  Monitor,
  Smartphone,
  Code,
  RotateCcw,
} from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import { sendCampaign, getRecipients } from "../../services/marketingService";
import ReportEmailTemplateManager from "./ReportEmailTemplateManager";

/**
 * Floating recipients control.
 * Renders as an interactive macOS glass pill that opens an anchored dropdown panel.
 */
function RecipientsDropdown({ recipients, count, onRecipientClick }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filtered = query
    ? recipients.filter((email) => email.toLowerCase().includes(query.toLowerCase()))
    : recipients;

  const handleCopyAll = async () => {
    if (recipients.length === 0) return;
    try {
      await navigator.clipboard.writeText(recipients.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("Failed to copy recipients:", err);
    }
  };

  if (count === null) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer outline-none ${
          open
            ? "bg-blue-500/10 border-blue-500/40 text-[#2B7FFF] shadow-2xs"
            : "bg-white/80 border-zinc-200/80 text-zinc-700 hover:border-zinc-300 hover:bg-white"
        }`}
      >
        <Users className="w-3.5 h-3.5 text-[#2B7FFF]" />
        <span>
          {count} Recipient{count === 1 ? "" : "s"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute right-0 top-[calc(100%+8px)] w-80 mac-window border border-white/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-200/50 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900">Consented recipients</p>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Target audience for this campaign
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={recipients.length === 0}
              className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-[#2B7FFF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Copy all emails"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>

          {/* Filter */}
          {recipients.length > 5 && (
            <div className="px-3 pt-2.5 pb-2 border-b border-zinc-200/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter recipients..."
                  className="w-full text-xs glass-input rounded-xl pl-8 pr-3 py-1.5 outline-none font-medium text-zinc-700"
                />
              </div>
            </div>
          )}

          {/* List */}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {recipients.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs font-medium text-zinc-400">
                  No consented recipients yet. New opt-ins will appear here automatically.
                </p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((email, idx) => (
                <div
                  key={idx}
                  onClick={() => onRecipientClick?.(email)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-blue-500/10 transition-colors cursor-pointer"
                  title="Click to add email to recipients input"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-[#2B7FFF] border border-blue-500/20 text-[10px] font-extrabold flex items-center justify-center shrink-0 uppercase">
                    {email.slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-zinc-700 truncate">{email}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-xs font-medium text-zinc-400">
                  No recipients match &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recipients.length > 0 && (
            <div className="px-4 py-2 border-t border-zinc-200/50 bg-zinc-50/50">
              <p className="text-[10px] font-bold text-zinc-400">
                Showing {filtered.length} of {recipients.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmailMarketing() {
  const [activeEmailTab, setActiveEmailTab] = useState("template"); // "template" or "marketing"
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();
  const [attachmentError, setAttachmentError] = useState(null);
  const [recipientsCount, setRecipientsCount] = useState(null);
  const [recipients, setRecipients] = useState("");
  const [recipientsList, setRecipientsList] = useState([]);

  // Responsive layout mode: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState("split");
  // Preview device mode: 'desktop' | 'mobile'
  const [deviceMode, setDeviceMode] = useState("desktop");

  const handleRecipientClick = (email) => {
    setRecipients((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return email;
      }
      if (trimmed.endsWith(",")) {
        return `${prev} ${email}`;
      }
      return `${prev}, ${email}`;
    });
  };

  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    list: false,
    link: false,
  });

  const editorRef = useRef(null);
  const maxTotalSize = 12 * 1024 * 1024; // 12MB in bytes

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && emailBody) {
      editorRef.current.innerHTML = emailBody;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getRecipients()
      .then((res) => {
        const payload = res?.data || res;
        if (payload) {
          setRecipientsCount(payload.count ?? payload.recipients?.length ?? 0);
          setRecipientsList(payload.recipients || []);
        }
      })
      .catch((err) => {
        console.warn("Failed to retrieve recipients count:", err);
      });
  }, []);

  const updateActiveStyles = () => {
    let hasLink = false;
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const container = sel.getRangeAt(0).startContainer;
        let node = container;
        while (node && node !== editorRef.current) {
          if (node.nodeName === "A") {
            hasLink = true;
            break;
          }
          node = node.parentNode;
        }
      }
    }
    setActiveStyles({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      list: document.queryCommandState("insertUnorderedList"),
      link: hasLink,
    });
  };

  const handleAttachment = (e) => {
    setAttachmentError(null);
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentTotal = attachments.reduce((sum, f) => sum + f.size, 0);
      const incomingTotal = newFiles.reduce((sum, f) => sum + f.size, 0);

      if (currentTotal + incomingTotal > maxTotalSize) {
        setAttachmentError("Attachments size exceeds maximum limit of 12MB.");
        showToast("Unable to attach. File limits exceeded.", "error");
        return;
      }

      setAttachments((prev) => [...prev, ...newFiles]);
      showToast(`${newFiles.length} file(s) attached successfully.`, "success");
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachmentError(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !emailBody || emailBody === "<br>") {
      alert("Please fill in the subject and email body fields.");
      return;
    }
    setSending(true);
    try {
      await sendCampaign(subject, emailBody, attachments, recipients);
      showToast(`Email campaign dispatched successfully.`, "success");
      setSubject("");
      setEmailBody("");
      setRecipients("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      setAttachments([]);
      setActiveStyles({ bold: false, italic: false, list: false, link: false });
    } catch (err) {
      console.error("Failed to send email campaign:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to send email campaign.";
      showToast(errMsg, "error");
    } finally {
      setSending(false);
    }
  };

  const formatText = (command) => {
    if (command === "bold") {
      document.execCommand("bold", false, null);
    } else if (command === "italic") {
      document.execCommand("italic", false, null);
    } else if (command === "list") {
      document.execCommand("insertUnorderedList", false, null);
    } else if (command === "link") {
      const url = prompt("Enter URL:", "https://");
      if (url) {
        document.execCommand("createLink", false, url);
      }
    }
    if (editorRef.current) {
      setEmailBody(editorRef.current.innerHTML);
    }
    updateActiveStyles();
  };

  const handleEditorInput = (e) => {
    setEmailBody(e.target.innerHTML);
    updateActiveStyles();
  };

  return (
    <div className="ww-page space-y-6">
      {/* Top Header & macOS Segmented Tab Controller */}
      <div className="ww-page-header border-b border-zinc-200/60 pb-4 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="ww-page-title text-xl font-bold tracking-tight">Email & Marketing</h2>
            <p className="ww-page-subtitle text-xs text-zinc-500">
              Manage automated PDF report email templates and dispatch promotional campaigns.
            </p>
          </div>

          <div className="mac-segmented-bg p-1 rounded-2xl flex items-center shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveEmailTab("template")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeEmailTab === "template"
                  ? "bg-white text-[#2B7FFF] shadow-md shadow-black/5"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report Email Template</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEmailTab("marketing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeEmailTab === "marketing"
                  ? "bg-white text-[#2B7FFF] shadow-md shadow-black/5"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Broadcast Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {activeEmailTab === "template" ? (
        <ReportEmailTemplateManager />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar for Broadcast Campaign */}
          <div className="mac-window rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-[#2B7FFF]">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900">Broadcast Email Composer</h3>
                <p className="text-[11px] text-zinc-500">Draft and dispatch email announcements to clients.</p>
              </div>
            </div>

            {/* Layout Mode Switcher */}
            <div className="mac-segmented-bg p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "split"
                    ? "bg-white text-[#2B7FFF] shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "editor"
                    ? "bg-white text-[#2B7FFF] shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Composer Focus</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-white text-[#2B7FFF] shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Preview Only</span>
              </button>
            </div>
          </div>

          {/* Main Content View Grid */}
          <div
            className={`grid gap-6 transition-all duration-300 ${
              viewMode === "split"
                ? "grid-cols-1 xl:grid-cols-12 items-start"
                : "grid-cols-1"
            }`}
          >
            {/* Left Window: Campaign Composer Form */}
            {(viewMode === "split" || viewMode === "editor") && (
              <div
                className={`mac-window rounded-2xl p-5 md:p-6 shadow-2xl space-y-5 transition-all ${
                  viewMode === "split" ? "xl:col-span-7" : "w-full max-w-4xl mx-auto"
                }`}
              >
                {/* macOS Window Titlebar */}
                <div className="border-b border-zinc-200/50 pb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                    </div>
                    <div className="h-4 w-px bg-zinc-200/80" />
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#2B7FFF]" /> Campaign Form
                    </span>
                  </div>

                  <RecipientsDropdown
                    recipients={recipientsList}
                    count={recipientsCount}
                    onRecipientClick={handleRecipientClick}
                  />
                </div>

                <form onSubmit={handleSend} className="space-y-4">
                  {/* Subject Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Review Your Upcoming Retirement Plan Details"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="glass-input w-full text-xs font-medium rounded-xl px-4 py-3 outline-none text-zinc-800 transition-all font-sans"
                    />
                  </div>

                  {/* Custom Recipients Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Recipients (Comma-separated list or leave blank for all opted-in clients)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. client1@example.com, client2@example.com"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      className="glass-input w-full text-xs font-medium rounded-xl px-4 py-3 outline-none text-zinc-800 transition-all font-sans"
                    />
                  </div>

                  {/* Rich text editor container */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Email Content Body
                    </label>

                    {/* Floating macOS Toolbar */}
                    <div className="flex border border-b-0 border-zinc-200/80 rounded-t-xl bg-white/70 backdrop-blur-md px-3 py-2 gap-1 shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => formatText("bold")}
                        className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                          activeStyles.bold
                            ? "bg-blue-500/15 text-[#2B7FFF]"
                            : "hover:bg-zinc-200/60 text-zinc-600 hover:text-zinc-900"
                        }`}
                        title="Bold text"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("italic")}
                        className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                          activeStyles.italic
                            ? "bg-blue-500/15 text-[#2B7FFF]"
                            : "hover:bg-zinc-200/60 text-zinc-600 hover:text-zinc-900"
                        }`}
                        title="Italic text"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("list")}
                        className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                          activeStyles.list
                            ? "bg-blue-500/15 text-[#2B7FFF]"
                            : "hover:bg-zinc-200/60 text-zinc-600 hover:text-zinc-900"
                        }`}
                        title="Bulleted List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("link")}
                        className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                          activeStyles.link
                            ? "bg-blue-500/15 text-[#2B7FFF]"
                            : "hover:bg-zinc-200/60 text-zinc-600 hover:text-zinc-900"
                        }`}
                        title="Add Web Link"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Rich-text contentEditable editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      onKeyUp={updateActiveStyles}
                      onMouseUp={updateActiveStyles}
                      className="w-full text-xs glass-input rounded-b-xl px-4 py-3 outline-none font-normal text-zinc-800 min-h-[200px] overflow-y-auto ww-richtext-editor leading-relaxed"
                      placeholder="Write your broadcast campaign body copy here..."
                      style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif",
                      }}
                    />
                  </div>

                  {/* Attachment Inputs */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Campaign Attachments (Max 12MB Total)
                      </label>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {(attachments.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)}MB / 12MB
                      </span>
                    </div>

                    {attachmentError && (
                      <div className="mb-2 bg-rose-500/10 border border-rose-500/20 text-rose-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> {attachmentError}
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
                        className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-blue-400 rounded-xl bg-white/50 hover:bg-white text-xs font-semibold text-zinc-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4 text-[#2B7FFF]" /> Attach campaign files
                      </button>
                    </div>

                    {/* Attachments List */}
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white/80 rounded-xl border border-zinc-200/80 flex items-center justify-between text-xs font-medium text-zinc-700 animate-fade-in shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-[#2B7FFF]" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-[10px] text-zinc-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-200/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Campaign Button */}
                  <div className="flex justify-end pt-3 border-t border-zinc-200/50">
                    <button
                      type="submit"
                      disabled={sending || !subject || !emailBody || emailBody === "<br>"}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#2B7FFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-[#2B7FFF]/20"
                    >
                      <Send className="w-4 h-4" /> {sending ? "Dispatching Campaign..." : "Send Campaign"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Right Window: Live Campaign Preview */}
            {(viewMode === "split" || viewMode === "preview") && (
              <div
                className={`mac-window rounded-2xl p-5 md:p-6 shadow-2xl space-y-4 transition-all ${
                  viewMode === "split" ? "xl:col-span-5" : "w-full max-w-4xl mx-auto"
                }`}
              >
                <div className="border-b border-zinc-200/50 pb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                    </div>
                    <div className="h-4 w-px bg-zinc-200/80" />
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#2B7FFF]" /> Campaign Preview
                    </span>
                  </div>

                  {/* Device Switcher */}
                  <div className="bg-zinc-200/60 p-0.5 rounded-lg flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setDeviceMode("desktop")}
                      className={`p-1 rounded-md transition-all cursor-pointer ${
                        deviceMode === "desktop"
                          ? "bg-white text-[#2B7FFF] shadow-2xs"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                      title="Desktop Preview"
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
                </div>

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
                    {deviceMode === "mobile" && (
                      <div className="bg-zinc-950 px-5 py-2 text-white flex items-center justify-between text-[11px] font-semibold shrink-0">
                        <span>9:41</span>
                        <div className="w-14 h-2.5 bg-zinc-800 rounded-full mx-auto" />
                        <span className="text-[9px] font-mono">100%</span>
                      </div>
                    )}

                    <div className={deviceMode === "mobile" ? "iphone-screen" : ""}>
                      {/* Email Header bar */}
                      <div className="bg-zinc-50/90 border-b border-zinc-200/80 p-3 space-y-1 text-xs text-zinc-700 shrink-0">
                        <div>
                          <span className="font-bold text-zinc-400 uppercase text-[9px] mr-2">Subject:</span>
                          <span className="font-bold text-zinc-900 text-[11px]">{subject || "(Untitled Subject Line)"}</span>
                        </div>
                      </div>

                      {/* Email Body Pane */}
                      <div className="p-4 sm:p-5 bg-white text-zinc-800 text-xs leading-relaxed space-y-4 flex-1">
                        <div className="border-b border-zinc-100 pb-2.5 flex items-center gap-2">
                          <img src="/logo.png" alt="Wealth Wisdom" className="h-6 w-auto object-contain" />
                          <span className="text-xs font-extrabold text-[#2B7FFF] tracking-tight">Wealth Wisdom</span>
                        </div>

                        <div className="whitespace-pre-wrap font-normal text-zinc-700 min-h-[120px]">
                          {emailBody && emailBody !== "<br>" ? (
                            <div
                              className="ww-richtext-preview"
                              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}
                              dangerouslySetInnerHTML={{ __html: emailBody }}
                            />
                          ) : (
                            <span className="text-zinc-400 italic font-normal">
                              Email content body copy will display here in real-time as you write...
                            </span>
                          )}
                        </div>

                        {/* Display attached files if any */}
                        {attachments.length > 0 && (
                          <div className="border-t border-zinc-100 pt-3 space-y-1.5">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Attachments ({attachments.length}):</p>
                            <div className="space-y-1">
                              {attachments.map((file, idx) => (
                                <div key={idx} className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center gap-2 text-[11px] font-medium text-zinc-700">
                                  <FileText className="w-3.5 h-3.5 text-[#2B7FFF]" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 font-medium space-y-1">
                          <span>© {new Date().getFullYear()} Wealth Wisdom Platform. All rights reserved.</span>
                          <span className="block text-zinc-400">You are receiving this communication as a registered advisor client.</span>
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
        </div>
      )}
    </div>
  );
}