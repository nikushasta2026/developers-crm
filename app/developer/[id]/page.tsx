"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import DeveloperModal from "@/app/components/DeveloperModal";
import StageSelector, { StageBadge } from "@/app/components/StageSelector";
import type { Developer, Stage } from "@/lib/types";

function formatVolume(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  const millions = cents / 1_000_000;
  if (millions >= 1) return `$${millions.toFixed(1)}m`;
  const thousands = cents / 1_000;
  return `$${thousands.toFixed(0)}k`;
}

export default function DeveloperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchDeveloper = useCallback(async () => {
    try {
      const res = await fetch(`/api/developers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDeveloper(data);
        setNotesValue(data.notes || "");
      }
    } catch {
      console.error("Failed to fetch developer");
    }
  }, [id]);

  useEffect(() => {
    fetchDeveloper().finally(() => setLoading(false));
  }, [fetchDeveloper]);

  const handleStageChange = async (stage: Stage) => {
    setUpdatingStage(true);
    try {
      const res = await fetch(`/api/developers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        setDeveloper(await res.json());
      }
    } catch {
      console.error("Failed to update stage");
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/developers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue.trim() || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDeveloper(updated);
        setEditingNotes(false);
      }
    } catch {
      console.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelNotes = () => {
    setNotesValue(developer?.notes || "");
    setEditingNotes(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this developer? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/developers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("Failed to delete developer");
      }
    } catch {
      alert("An error occurred while deleting");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setModalOpen(false);
    fetchDeveloper();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500">Loading developer...</div>
        </div>
      </AppShell>
    );
  }

  if (!developer) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-slate-400">Developer not found</div>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition">
            Back to developers
          </Link>
        </div>
      </AppShell>
    );
  }

  const addresses = developer.sample_addresses
    ? developer.sample_addresses.split(/[;\n]/).map((a) => a.trim()).filter(Boolean)
    : [];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to developers
        </Link>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white">{developer.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {developer.state && (
                  <span className="text-sm text-slate-400">
                    {developer.city ? `${developer.city}, ${developer.state}` : developer.state}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    developer.is_corp_llc
                      ? "bg-emerald-900/50 text-emerald-300"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {developer.is_corp_llc ? "Corp/LLC" : "Individual"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StageBadge stage={developer.stage} />
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-900/30 hover:bg-red-900/50 disabled:bg-red-900/20 text-red-300 transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Deals in Market", value: developer.deals_in_market ?? "" },
            { label: "Total Deals Nationwide", value: developer.total_deals_nationwide ?? "" },
            { label: "Volume", value: formatVolume(developer.total_volume_market) },
            { label: "Avg Price", value: formatVolume(developer.avg_sale_price_market) },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sample Addresses */}
        {addresses.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Sample Addresses</h2>
            <ul className="space-y-1.5">
              {addresses.map((addr, i) => (
                <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">&#8226;</span>
                  {addr}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deal Stage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Deal Stage</h2>
          <StageSelector
            currentStage={developer.stage}
            onStageChange={handleStageChange}
            disabled={updatingStage}
          />
        </div>

        {/* Notes - Single Editable Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Notes</h2>
            {!editingNotes && (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                {developer.notes ? "Edit" : "Add Note"}
              </button>
            )}
          </div>

          {editingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Enter notes here..."
                rows={6}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelNotes}
                  disabled={savingNotes}
                  className="px-3 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
                >
                  {savingNotes ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingNotes(true)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 cursor-pointer hover:bg-slate-800/70 transition"
            >
              {developer.notes ? (
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{developer.notes}</p>
              ) : (
                <p className="text-sm text-slate-500 italic">Click to add a note...</p>
              )}
            </div>
          )}
        </div>
      </div>

      <DeveloperModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEditSuccess}
        developer={developer}
        mode="edit"
      />
    </AppShell>
  );
}
