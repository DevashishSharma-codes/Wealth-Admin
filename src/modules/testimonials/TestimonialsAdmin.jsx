import { useState, useEffect, useCallback } from "react";
import {
  Info,
  Plus,
  Edit2,
  Trash2,
  Check,
  Eye,
  Quote,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import AdminModal from "../../components/UI/AdminModal";
import StatusToggle from "../../components/UI/StatusToggle";
import ExpandableText from "../../components/UI/ExpandableText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/Avatar";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../services/testimonialsService";
import { logAction } from "../../utils/activityLogger";

// Small deterministic accent rotation for avatar fallbacks, all pulled from
// the existing theme palette (blue / emerald / amber) — nothing new.
const avatarPalette = [
  { bg: "bg-blue-50", text: "text-[#2B7FFF]" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function getAvatarStyle(name) {
  const idx = name.charCodeAt(0) % avatarPalette.length;
  return avatarPalette[idx];
}

// Reusable shadcn-based avatar for a testimonial, sized via className.
function TestimonialAvatar({ testimonial, className = "w-9 h-9", ring = false }) {
  const style = getAvatarStyle(testimonial.name || "Client");
  return (
    <Avatar className={`${className} ${ring ? "ring-2 ring-white shadow-md" : ""} shrink-0`}>
      {testimonial.avatar ? (
        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
      ) : null}
      <AvatarFallback
        className={`${style.bg} ${style.text} font-extrabold text-[11px]`}
      >
        {getInitials(testimonial.name || "Client")}
      </AvatarFallback>
    </Avatar>
  );
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTestimonial, setPreviewTestimonial] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await getTestimonials();
      const rawList = response.data || response;
      const parsedList = (Array.isArray(rawList) ? rawList : (rawList?.items || [])).map((t) => ({
        id: t.id,
        name: t.name || "",
        message: t.message || "",
        visible: t.visible !== undefined ? !!t.visible : !!t.is_visible,
        avatar: t.avatar || "",
      }));
      setTestimonials(parsedList);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to load testimonials.";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleOpenAdd = () => {
    setCurrentTestimonial(null);
    setName("");
    setMessage("");
    setVisible(true);
    setAvatarUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (testimonial) => {
    setCurrentTestimonial(testimonial);
    setName(testimonial.name);
    setMessage(testimonial.message);
    setVisible(testimonial.visible);
    setAvatarUrl(testimonial.avatar || "");
    setIsModalOpen(true);
  };

  const handleOpenPreview = (testimonial) => {
    setPreviewTestimonial(testimonial);
    setIsPreviewOpen(true);
  };

  const handleToggleVisibility = async (id) => {
    const testimonial = testimonials.find((t) => t.id === id);
    if (!testimonial) return;

    const visibleCount = testimonials.filter((t) => t.visible).length;
    const nextVisible = !testimonial.visible;

    // Enforce max 3 visible testimonials (or exactly 3, but client requested max 3)
    if (nextVisible && visibleCount >= 3) {
      showToast(
        "Cannot display this testimonial. A maximum of 3 visible testimonials is allowed. Please hide another testimonial first.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      await updateTestimonial(id, {
        name: testimonial.name,
        message: testimonial.message,
        visible: nextVisible,
        is_visible: nextVisible,
        avatar: testimonial.avatar || "",
      });
      showToast(
        `Testimonial by "${testimonial.name}" status updated to ${nextVisible ? "Visible" : "Hidden"}.`,
        "success"
      );
      logAction(`Toggled visibility of testimonial from '${testimonial.name}' to ${nextVisible ? "Visible" : "Hidden"}`);
      fetchTestimonials();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update visibility status.";
      showToast(errMsg, "error");
    }
  };

  const handleDelete = async (id, clientName) => {
    if (window.confirm(`Are you sure you want to delete testimonial from "${clientName}"?`)) {
      try {
        setLoading(true);
        await deleteTestimonial(id);
        showToast(`Testimonial from "${clientName}" deleted successfully.`, "success");
        logAction(`Deleted testimonial from '${clientName}'`);
        fetchTestimonials();
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to delete testimonial.";
        showToast(errMsg, "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const clientName = name.trim();
    const visibleCount = testimonials.filter((t) => t.visible).length;

    try {
      setLoading(true);
      if (currentTestimonial) {
        const otherVisibleCount = testimonials.filter(
          (t) => t.visible && t.id !== currentTestimonial.id
        ).length;
        if (visible && otherVisibleCount >= 3) {
          showToast(
            "Cannot save. You already have 3 visible testimonials. Please hide another testimonial first, or save this one as hidden.",
            "error"
          );
          setLoading(false);
          return;
        }

        await updateTestimonial(currentTestimonial.id, {
          name: clientName,
          message: message.trim(),
          visible,
          is_visible: visible,
          avatar: avatarUrl.trim(),
        });
        showToast(`Testimonial from "${clientName}" updated successfully.`, "success");
        logAction(`Updated testimonial from '${clientName}'`);
      } else {
        if (visible && visibleCount >= 3) {
          showToast(
            "Cannot save. You already have 3 visible testimonials. Please hide another testimonial first, or save this one as hidden.",
            "error"
          );
          setLoading(false);
          return;
        }

        await createTestimonial({
          name: clientName,
          message: message.trim(),
          visible,
          is_visible: visible,
          avatar: avatarUrl.trim(),
        });
        showToast(`Testimonial from "${clientName}" added successfully.`, "success");
        logAction(`Added testimonial from '${clientName}'`);
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to save testimonial.";
      showToast(errMsg, "error");
    }
  };


  return (
    <div className="ww-page space-y-6">
      {/* Header section */}
      <div className="ww-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="ww-page-title">Manage Testimonials</h2>
          <p className="ww-page-subtitle">
            Publish, edit, delete, and control client feedback visible on your website.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 hover:shadow-md active:scale-95 transition-all text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Informational Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700 leading-relaxed max-w-6xl shadow-sm">
        <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
        <div>
          <span className="font-bold">Important Note:</span> You may add as many testimonials as you like for record-keeping. However, <strong>exactly 3 testimonials must remain visible at all times</strong>.
        </div>
      </div>

      {/* Testimonials List — card-based rows for a softer, modern feel */}
      <div className="max-w-6xl space-y-3">
        {/* Column labels (hidden on small screens, cards still stack fine) */}
        <div className="hidden md:grid grid-cols-[2fr_2.8fr_1.1fr_1fr] gap-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>Client</span>
          <span>Review Message</span>
          <span>Visibility</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm py-12 text-center text-zinc-400 font-bold text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#2B7FFF]" /> Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm py-10 text-center text-zinc-400 font-bold text-sm">
            No testimonials found. Click "Add Testimonial" to create one.
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_2.8fr_1.1fr_1fr] gap-4 items-center bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-200 px-6 py-5 font-medium text-zinc-650 text-xs"
            >
              <div className="flex items-center gap-3">
                <TestimonialAvatar testimonial={testimonial} className="w-9 h-9" />
                <span className="font-bold text-zinc-800 text-xs">
                  {testimonial.name}
                </span>
              </div>

              <div className="text-zinc-555 leading-relaxed">
                <ExpandableText text={testimonial.message} maxLength={80} />
              </div>

              <div>
                <StatusToggle
                  checked={testimonial.visible}
                  onChange={() => handleToggleVisibility(testimonial.id)}
                  activeLabel="Visible"
                  inactiveLabel="Hidden"
                />
              </div>

              <div className="flex items-center md:justify-end gap-1.5">
                <button
                  onClick={() => handleOpenPreview(testimonial)}
                  className="p-2 text-zinc-400 hover:text-[#2B7FFF] hover:bg-blue-50 rounded-lg cursor-pointer transition-all"
                  title="Preview on Website"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(testimonial)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer transition-all"
                  title="Edit Testimonial"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id, testimonial.name)}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                  title="Delete Testimonial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTestimonial ? "Edit Review" : "Add Review"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 tracking-wide select-none">
              Client Name <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-medium transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 tracking-wide select-none">
              Avatar Image URL <span className="text-zinc-400 font-semibold">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={name || "Preview"} /> : null}
                <AvatarFallback
                  className={`${getAvatarStyle(name || "?").bg} ${getAvatarStyle(name || "?").text
                    } font-extrabold text-[11px]`}
                >
                  {getInitials(name || "?")}
                </AvatarFallback>
              </Avatar>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-medium transition-all"
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-semibold">
              Leave blank to use auto-generated initials.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 tracking-wide select-none">
              Message <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the client testimonial here..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-medium resize-y min-h-[120px] leading-relaxed transition-all"
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
            <div>
              <span className="block text-xs font-bold text-slate-700 tracking-wide">
                Visible on Website
              </span>
              <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">
                Render this testimonial in the website feedback section.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${visible ? "bg-emerald-500" : "bg-zinc-200"
                }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-xs ${visible ? "left-6" : "left-1"
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-95 text-xs font-bold text-zinc-550 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 active:scale-95 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Live Website Preview Modal */}
      <AdminModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Website Preview"
      >
        {previewTestimonial && (
          <div className="space-y-4">
            <p className="text-[11px] font-semibold text-zinc-400">
              This is how this testimonial will appear in the feedback section on your public website.
            </p>

            {/* Mocked site background frame with soft depth accents */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#f0fdf4] to-[#fffbeb] rounded-3xl p-12 border border-zinc-200/50">
              {/* Decorative blurred glow blobs for depth, like a modern SaaS marketing section */}
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#2B7FFF]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-14 -right-10 w-72 h-72 bg-[#2d9c7e]/12 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-sm mx-auto bg-white/70 hover:bg-white/85 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[-4px_-4px_12px_rgba(255,255,255,0.6),4px_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[-6px_-6px_16px_rgba(255,255,255,0.8),6px_6px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col justify-between min-h-[220px]">
                {/* Gradient quote icon badge, floating above the card edge */}
                <div className="absolute -top-5 -left-4 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2B7FFF] to-[#2d9c7e] shadow-[0_8px_20px_rgba(43,127,255,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer">
                  <Quote className="w-5 h-5 text-white" fill="white" />
                </div>

                <div className="pt-3">
                  <p className="text-sm text-zinc-700 leading-relaxed mt-4 font-medium">
                    "{previewTestimonial.message}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-white/30 relative">
                  <div className="flex items-center gap-3">
                    <TestimonialAvatar
                      testimonial={previewTestimonial}
                      className="w-11 h-11 ring-2 ring-white/60 shadow-sm"
                      ring
                    />
                    <div>
                      <p className="text-sm font-bold text-zinc-800">
                        {previewTestimonial.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-semibold">
                        Client
                      </p>
                    </div>
                  </div>
                  
                  {/* Verified badge floating slightly outside the bottom-right card edge */}
                  <span className="absolute -bottom-3 -right-3 inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-[#2d9c7e] text-white text-[10px] font-extrabold tracking-wide rounded-full px-3 py-1.5 shadow-[0_8px_16px_rgba(45,156,126,0.35)] shrink-0 transition-transform hover:scale-105">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {!previewTestimonial.visible && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-xl px-3.5 py-2.5">
                This testimonial is currently hidden and will not display on the live site.
              </div>
            )}

            <div className="flex items-center justify-end border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-95 text-xs font-bold text-zinc-555 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}