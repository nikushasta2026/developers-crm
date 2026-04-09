"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import KanbanBoard from "../components/KanbanBoard";
import PipelineFiltersPanel, { type PipelineFilterValues } from "../components/PipelineFiltersPanel";
import type { Developer, Stage } from "@/lib/types";

export default function PipelinePage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<PipelineFilterValues>({
    search: "",
    stage: "",
  });
  const [stages, setStages] = useState<string[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(`/api/developers?per_page=1000&sort_by=name&sort_dir=asc&cache_bust=${Date.now()}`);
      const json = await res.json();
      const devs = json.data || [];
      setDevelopers(devs);
      
      // Extract unique stages
      const stageSet = new Set<string>(devs.map((d: Developer) => d.stage).filter(Boolean) as string[]);
      setStages(Array.from(stageSet).sort());
    } catch {
      console.error("Failed to fetch developers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to developers
  useEffect(() => {
    let filtered = developers;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(searchLower) ||
        (d.city && d.city.toLowerCase().includes(searchLower)) ||
        (d.state && d.state.toLowerCase().includes(searchLower))
      );
    }

    if (filters.stage) {
      filtered = filtered.filter((d) => d.stage === filters.stage);
    }

    setFilteredDevelopers(filtered);
  }, [developers, filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, refreshKey]);

  // Poll for data changes every 10 seconds to catch status changes from the developers page
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll();
    }, 10000);

    return () => clearInterval(interval);
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

  const handleFiltersChange = useCallback((newFilters: PipelineFilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <AppShell>
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pipeline</h1>
            <p className="text-sm text-slate-400 mt-1">
              Drag developers between stages to update their status ({filteredDevelopers.length} shown)
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <PipelineFiltersPanel
              stages={stages}
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-slate-500">Loading pipeline...</div>
              </div>
            ) : (
              <KanbanBoard
                developers={filteredDevelopers}
                onStageChange={handleStageChange}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
