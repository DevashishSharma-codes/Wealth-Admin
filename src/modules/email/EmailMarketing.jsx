import { useState, useRef, useEffect } from "react";
import {
  Mail,
  Eye,
  Send,
  Paperclip,
  Bold,
  Italic,
  List,
  Link,
  X,
  AlertTriangle,
  FileText,
  ChevronDown,
  Search,
  Copy,
  Check,
  Users,
} from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import { sendCampaign, getRecipients } from "../../services/marketingService";

/**
 * Floating recipients control.
 * Renders as an interactive pill that opens an anchored dropdown panel —
 * never shifts surrounding layout, closes on outside click / Escape.
 */
function RecipientsDropdown({ recipients, count }) {
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
      // Focus the filter input on open, once it's mounted
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
        className={`flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2B7FFF]/30 ${open
            ? "bg-[#2B7FFF]/10 border-[#2B7FFF]/30 text-[#2B7FFF]"
            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100"
          }`}
      >
        <Users className="w-3 h-3" />
        <span>
          {count} Recipient{count === 1 ? "" : "s"}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-900/10 z-50 overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="px-3.5 py-3 border-b border-zinc-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-zinc-800">Consented recipients</p>
              <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                This campaign will be sent to everyone below
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={recipients.length === 0}
              className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-zinc-500 hover:text-[#2B7FFF] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Copy all emails"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>

          {/* Filter — only worth showing once the list has enough to search */}
          {recipients.length > 5 && (
            <div className="px-3 pt-2.5 pb-2 border-b border-zinc-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-350 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter recipients..."
                  className="w-full text-[11px] bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-2.5 py-1.5 outline-none focus:border-[#2B7FFF] font-medium text-zinc-700"
                />
              </div>
            </div>
          )}

          {/* List */}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {recipients.length === 0 ? (
              <div className="px-3.5 py-6 text-center">
                <p className="text-[10px] font-semibold text-zinc-400">
                  No consented recipients yet. New opt-ins will appear here automatically.
                </p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-zinc-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8EC5FF]/25 text-[#2B7FFF] text-[9px] font-extrabold flex items-center justify-center shrink-0 uppercase">
                    {email.slice(0, 2)}
                  </div>
                  <span className="text-[11px] font-medium text-zinc-700 truncate">{email}</span>
                </div>
              ))
            ) : (
              <div className="px-3.5 py-6 text-center">
                <p className="text-[10px] font-semibold text-zinc-400">
                  No recipients match &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recipients.length > 0 && (
            <div className="px-3.5 py-2 border-t border-zinc-100 bg-zinc-50/60">
              <p className="text-[9px] font-bold text-zinc-400">
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
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();
  const [attachmentError, setAttachmentError] = useState(null);
  const [recipientsCount, setRecipientsCount] = useState(null);
  const [recipients, setRecipients] = useState("");
  const [recipientsList, setRecipientsList] = useState([]);

  // Tracks active text styles at user's cursor position
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    list: false,
    link: false,
  });

  const editorRef = useRef(null);
  const maxTotalSize = 12 * 1024 * 1024; // 12MB in bytes

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
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
        setAttachmentError("Attachments size exceeds the maximum limit of 12MB.");
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
    <div className="ww-page">
      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">Email & Marketing Campaign</h2>
          <p className="ww-page-subtitle">Author and dispatch customized campaigns directly to users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Form Panel */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2B7FFF]" />
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Email Composer</span>
            </div>
            <RecipientsDropdown recipients={recipientsList} count={recipientsCount} />
          </div>

          <form onSubmit={handleSend} className="space-y-4">
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
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 font-medium font-sans"
              />
            </div>

            {/* Custom Recipients Input */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Recipients (Optional - Comma-separated list of emails, or leave blank to target all consented users)
              </label>
              <input
                type="text"
                placeholder="e.g. user1@example.com, user2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 font-medium font-sans"
              />
            </div>

            {/* Rich text tool bar */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Email Content Body
              </label>

              {/* Tool bar */}
              <div className="flex border border-b-0 border-zinc-200 rounded-t-xl bg-zinc-50 px-2 py-1.5 gap-1.5 shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${activeStyles.bold
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800"
                    }`}
                  title="Bold text"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${activeStyles.italic
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800"
                    }`}
                  title="Italic text"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("list")}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${activeStyles.list
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800"
                    }`}
                  title="List bullets"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("link")}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${activeStyles.link
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800"
                    }`}
                  title="Add web links"
                >
                  <Link className="w-4 h-4" />
                </button>
              </div>

              {/* Rich-text contentEditable editor */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                onKeyUp={updateActiveStyles}
                onMouseUp={updateActiveStyles}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-b-xl px-3 py-2.5 outline-none focus:border-indigo-500 font-normal text-zinc-700 min-h-[180px] overflow-y-auto ww-richtext-editor"
                placeholder="Write your email body copy here..."
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
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
                <input type="file" multiple onChange={handleAttachment} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                <button type="button" className="w-full py-2 border border-dashed border-slate-300 hover:border-slate-450 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 text-xs font-bold text-zinc-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
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
                      <button type="button" onClick={() => removeAttachment(idx)} className="text-zinc-400 hover:text-zinc-600 p-0.5 hover:bg-zinc-200/50 rounded-md cursor-pointer">
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
                disabled={sending || !subject || !emailBody || emailBody === "<br>"}
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
                <span className="font-bold text-zinc-400 mr-2 uppercase text-[9px]">Subject:</span>
                <span className="font-bold text-zinc-800">{subject || "(Untitled Subject Line)"}</span>
              </div>
            </div>

            {/* Email Body pane */}
            <div className="p-6 bg-white min-h-[220px] text-zinc-800 text-xs leading-relaxed space-y-4">
              <div className="border-b border-zinc-200 pb-4">
                <span className="text-sm font-extrabold text-[#2B7FFF] tracking-tight">Wealth Wisdom</span>
              </div>

              <div className="whitespace-pre-wrap font-normal text-zinc-700">
                {emailBody && emailBody !== "<br>" ? (
                  <div
                    className="ww-richtext-preview"
                    style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: emailBody }}
                  />
                ) : (
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