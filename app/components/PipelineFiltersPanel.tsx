"use client";

import { useCallback, useEffect, useState } from "react";
import { STAGES } from "@/lib/types";

export interface PipelineFilterValues {
  search: string;
  stage: string;
}

interface PipelineFiltersPanelProps {
  stages: string[];
  onFiltersChange: (filters: PipelineFilterValues) => void;
  initialFilters?: Partial<PipelineFilterValues>;
}

export default function PipelineFiltersPanel({
  stages,
  onFiltersChange,
  initialFilters,
}: PipelineFiltersPanelProps) {
  const [filters, setFilters] = useState<PipelineFilterValues>({
    search: initialFilters?.search || "",
    stage: initialFilters?.stage || "",
  });

  const updateFilter = useCallback(
    (key: keyof PipelineFilterValues, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        return updated;
      });
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, onFiltersChange]);

  const clearFilters = () => {
    const cleared: PipelineFilterValues = {
      search: "",
      stage: "",
    };
    setFilters(cleared);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Search</label>
        <input
          type="text"
          placeholder="Name, city, state..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Stage</label>
        <select
          value={filters.stage}
          onChange={(e) => updateFilter("stage", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All stages</option>
          {stages.length > 0 ? (
            stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))
          ) : (
            STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
