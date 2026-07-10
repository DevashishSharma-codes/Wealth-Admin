import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import AdminModal from "../../components/UI/AdminModal";
import StatusToggle from "../../components/UI/StatusToggle";
import ExpandableText from "../../components/UI/ExpandableText";
import { logAction } from "../../utils/activityLogger";

const initialServices = [
  {
    id: "srv-1",
    title: "Financial Health Check",
    description:
      "Get a comprehensive assessment of your financial health by analyzing your income, expenses, savings, investments, liabilities, and overall financial preparedness.",
    active: true,
  },
  {
    id: "srv-2",
    title: "Goal-Based Financial Planning",
    description:
      "Plan for your life goals such as buying a home, children's education, travel, retirement, and wealth creation with a personalized financial roadmap.",
    active: true,
  },
  {
    id: "srv-3",
    title: "Investment & Portfolio Review",
    description:
      "Evaluate your existing investments and receive recommendations to build a well-diversified portfolio aligned with your financial goals and risk profile.",
    active: true,
  },
  {
    id: "srv-4",
    title: "Insurance & Risk Management",
    description:
      "Identify protection gaps and ensure adequate coverage through Term Insurance, Health Insurance, Personal Accident Cover, and Emergency Planning.",
    active: true,
  },
  {
    id: "srv-5",
    title: "Retirement Planning",
    description:
      "Estimate the retirement corpus required, assess your retirement readiness, and create a strategy for a financially independent retirement.",
    active: true,
  },
  {
    id: "srv-6",
    title: "Estate Planning (Will & Trust)",
    description:
      "Secure your family's future with proper estate planning, including Wills, Trusts, nominations, and seamless wealth transfer across generations.",
    active: true,
  },
];

export default function ServicesAdmin() {
  const [services, setServices] = useState(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewService, setPreviewService] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const handleOpenAdd = () => {
    setCurrentService(null);
    setTitle("");
    setDescription("");
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setCurrentService(service);
    setTitle(service.title);
    setDescription(service.description);
    setActive(service.active);
    setIsModalOpen(true);
  };

  const handleOpenPreview = (service) => {
    setPreviewService(service);
    setIsPreviewOpen(true);
  };

  const handleToggleActive = (id) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const nextActive = !service.active;

    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: nextActive } : s))
    );

    showToast(
      `Service "${service.title}" status updated to ${nextActive ? "Active" : "Inactive"}.`,
      "success"
    );
    logAction(`Toggled status of service '${service.title}' to ${nextActive ? "Active" : "Inactive"}`);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete service "${name}"?`)) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast(`Service "${name}" deleted successfully.`, "success");
      logAction(`Deleted service: '${name}'`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const cleanTitle = title.trim();

    if (currentService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === currentService.id
            ? {
                ...s,
                title: cleanTitle,
                description: description.trim(),
                active,
              }
            : s
        )
      );
      showToast(`Service "${cleanTitle}" updated successfully.`, "success");
      logAction(`Updated service: '${cleanTitle}'`);
    } else {
      const newService = {
        id: `srv-${Date.now()}`,
        title: cleanTitle,
        description: description.trim(),
        active,
      };
      setServices((prev) => [...prev, newService]);
      showToast(`Service "${cleanTitle}" added successfully.`, "success");
      logAction(`Added service: '${cleanTitle}'`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="ww-page space-y-6">
      {/* Header section */}
      <div className="ww-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="ww-page-title">Manage Services</h2>
          <p className="ww-page-subtitle">
            Add, edit, delete, and control client visibility of your firm's offerings.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 hover:shadow-md active:scale-95 transition-all text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Services List — card-based rows for a softer, modern feel */}
      <div className="max-w-6xl space-y-3">
        {/* Column labels (hidden on small screens, cards still stack fine) */}
        <div className="hidden md:grid grid-cols-[2fr_2.4fr_1fr_0.9fr] gap-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>Service Title</span>
          <span>Description</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {services.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm py-10 text-center text-zinc-400 font-bold text-sm">
            No services defined. Click "Add Service" to create one.
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_2.4fr_1fr_0.9fr] gap-4 items-center bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-200 px-6 py-5 font-medium text-zinc-650 text-xs"
            >
              <div className="font-bold text-zinc-800 text-xs">{service.title}</div>

              <div className="text-zinc-550 leading-relaxed">
                <ExpandableText text={service.description} maxLength={80} />
              </div>

              <div>
                <StatusToggle
                  checked={service.active}
                  onChange={() => handleToggleActive(service.id)}
                  activeLabel="Active"
                  inactiveLabel="Inactive"
                />
              </div>

              <div className="flex items-center md:justify-end gap-1.5">
                <button
                  onClick={() => handleOpenPreview(service)}
                  className="p-2 text-zinc-400 hover:text-[#2B7FFF] hover:bg-blue-50 rounded-lg cursor-pointer transition-all"
                  title="Preview on Website"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer transition-all"
                  title="Edit Service"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.title)}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                  title="Delete Service"
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
        title={currentService ? "Edit Offering" : "Add New Service"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 tracking-wide select-none">
              Service Title <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wealth Planning"
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-medium transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 tracking-wide select-none">
              Description <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize this service and what benefits it brings to clients..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-medium resize-y min-h-[120px] leading-relaxed transition-all"
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
            <div>
              <span className="block text-xs font-bold text-slate-700 tracking-wide">
                Service Status
              </span>
              <span className="block text-[10px] text-zinc-400 font-semibold mt-0.5">
                Make this offering visible to all clients.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                active ? "bg-emerald-500" : "bg-zinc-200"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-xs ${
                  active ? "left-6" : "left-1"
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
        {previewService && (
          <div className="space-y-4">
            <p className="text-[11px] font-semibold text-zinc-400">
              This is how this service will appear in the services section on your public website.
            </p>
            {/* Mocked site background frame with soft depth accents */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#f0fdf4] to-[#fffbeb] rounded-3xl p-12 border border-zinc-200/50">
              {/* Decorative blurred glow blobs for depth, like a modern SaaS marketing section */}
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#2B7FFF]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-14 -right-10 w-72 h-72 bg-[#2d9c7e]/12 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative max-w-sm mx-auto bg-white/70 hover:bg-white/85 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[-4px_-4px_12px_rgba(255,255,255,0.6),4px_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[-6px_-6px_16px_rgba(255,255,255,0.8),6px_6px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col justify-between min-h-[220px]">
                <div className="pt-3">
                  <h4 className="text-base font-extrabold text-zinc-800">
                    {previewService.title}
                  </h4>
                  <p className="text-sm text-zinc-555 leading-relaxed mt-3 font-medium">
                    {previewService.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-white/30 relative">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-800">
                        Wealth Services
                      </p>
                      <p className="text-[10px] text-zinc-400 font-semibold">
                        Firm Offering
                      </p>
                    </div>
                  </div>

                  {/* Active/inactive status badge aligned in footer row */}
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wide rounded-full px-3 py-1.5 shadow-sm transition-transform hover:scale-105 ${
                    previewService.active
                      ? "bg-gradient-to-r from-emerald-500 to-[#2d9c7e] text-white shadow-[0_4px_10px_rgba(45,156,126,0.2)]"
                      : "bg-zinc-200 text-zinc-650"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${previewService.active ? "bg-white animate-pulse" : "bg-zinc-400"}`} />
                    {previewService.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {!previewService.active && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-xl px-3.5 py-2.5">
                This service is currently inactive and will not display on the live site.
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