"use client";

import { useEffect, useState } from "react";
import { STAGES, type Developer, type Stage } from "@/lib/types";

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean) => void;
  developer?: Developer | null;
  mode: "add" | "edit";
}

export default function DeveloperModal({
  isOpen,
  onClose,
  onSubmit,
  developer,
  mode,
}: DeveloperModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    city: "",
    deals_in_market: "",
    total_deals_nationwide: "",
    total_volume_market: "",
    avg_sale_price_market: "",
    is_corp_llc: false,
    sample_addresses: "",
    stage: "Prospect" as Stage,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with developer data in edit mode
  useEffect(() => {
    if (mode === "edit" && developer) {
      setFormData({
        name: developer.name || "",
        state: developer.state || "",
        city: developer.city || "",
        deals_in_market: developer.deals_in_market?.toString() || "",
        total_deals_nationwide: developer.total_deals_nationwide?.toString() || "",
        total_volume_market: developer.total_volume_market?.toString() || "",
        avg_sale_price_market: developer.avg_sale_price_market?.toString() || "",
        is_corp_llc: developer.is_corp_llc || false,
        sample_addresses: developer.sample_addresses || "",
        stage: developer.stage,
      });
    } else {
      setFormData({
        name: "",
        state: "",
        city: "",
        deals_in_market: "",
        total_deals_nationwide: "",
        total_volume_market: "",
        avg_sale_price_market: "",
        is_corp_llc: false,
        sample_addresses: "",
        stage: "Prospect",
      });
    }
    setError("");
  }, [mode, developer, isOpen]);

  // Close modal on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name.trim()) {
      setError("Developer name is required");
      setLoading(false);
      return;
    }

    try {
      let response;

      if (mode === "add") {
        response = await fetch("/api/developers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            state: formData.state || null,
            city: formData.city || null,
            deals_in_market: formData.deals_in_market ? parseInt(formData.deals_in_market) : null,
            total_deals_nationwide: formData.total_deals_nationwide ? parseInt(formData.total_deals_nationwide) : null,
            total_volume_market: formData.total_volume_market ? parseInt(formData.total_volume_market) : null,
            avg_sale_price_market: formData.avg_sale_price_market ? parseInt(formData.avg_sale_price_market) : null,
            is_corp_llc: formData.is_corp_llc,
            sample_addresses: formData.sample_addresses || null,
            stage: formData.stage,
          }),
        });
      } else {
        response = await fetch(`/api/developers/${developer?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            state: formData.state || null,
            city: formData.city || null,
            deals_in_market: formData.deals_in_market ? parseInt(formData.deals_in_market) : null,
            total_deals_nationwide: formData.total_deals_nationwide ? parseInt(formData.total_deals_nationwide) : null,
            total_volume_market: formData.total_volume_market ? parseInt(formData.total_volume_market) : null,
            avg_sale_price_market: formData.avg_sale_price_market ? parseInt(formData.avg_sale_price_market) : null,
            is_corp_llc: formData.is_corp_llc,
            sample_addresses: formData.sample_addresses || null,
            stage: formData.stage,
          }),
        });
      }

      if (response.ok) {
        onClose();
        onSubmit(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save developer");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">
              {mode === "add" ? "Add Developer" : "Edit Developer"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Developer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* State & City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., CA"
                  maxLength={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., San Francisco"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as Stage })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Deals & Volume */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Deals in Market
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deals_in_market}
                  onChange={(e) => setFormData({ ...formData, deals_in_market: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Total Deals Nationwide
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_deals_nationwide}
                  onChange={(e) => setFormData({ ...formData, total_deals_nationwide: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Volume & Avg Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Total Volume Market ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_volume_market}
                  onChange={(e) => setFormData({ ...formData, total_volume_market: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Avg Sale Price Market ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.avg_sale_price_market}
                  onChange={(e) => setFormData({ ...formData, avg_sale_price_market: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Addresses */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Sample Addresses
              </label>
              <textarea
                value={formData.sample_addresses}
                onChange={(e) => setFormData({ ...formData, sample_addresses: e.target.value })}
                placeholder="Enter addresses (one per line or separated by semicolon)"
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Corp/LLC */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_corp_llc"
                checked={formData.is_corp_llc}
                onChange={(e) => setFormData({ ...formData, is_corp_llc: e.target.checked })}
                className="w-4 h-4 bg-slate-800 border-slate-700 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="is_corp_llc" className="text-sm font-medium text-slate-200 cursor-pointer">
                Corporation/LLC
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 text-slate-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white rounded-lg transition"
              >
                {loading ? "Saving..." : mode === "add" ? "Add Developer" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
