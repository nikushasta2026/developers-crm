"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import KanbanBoard from "../components/KanbanBoard";
import type { Developer, Stage } from "@/lib/types";

export default function PipelinePage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/developers?per_page=100&sort_by=name&sort_dir=asc");
      const json = await res.json();
      setDevelopers(json.data || []);
    } catch {
      console.error("Failed to fetch developers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleStageChange = async (developerId: number, newStage: Stage) => {
    // Optimistic update
    setDevelopers((prev) =>
      prev.map((d) =>
        d.id === developerId ? { ...d, stage: newStage } : d
      )
    );

    try {
      const res = await fetch(`/api/developers/${developerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        // Revert on failure
        await fetchAll();
      }
    } catch {
      await fetchAll();
    }
  };

  return (
    <AppShell>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Drag developers between stages to update their status
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-500">Loading pipeline...</div>
          </div>
        ) : (
          <KanbanBoard
            developers={developers}
            onStageChange={handleStageChange}
          />
        )}
      </div>
    </AppShell>
  );
}
