"use client";

import { useCallback, useEffect, useState } from "react";
import { STAGES } from "@/lib/types";

export interface FilterValues {
  search: string;
  state: string;
  stage: string;
  min_deals: string;
  min_volume: string;
}

interface FiltersPanelProps {
  states: string[];
  onFiltersChange: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
}

export default function FiltersPanel({
  states,
  onFiltersChange,
  initialFilters,
}: FiltersPanelProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: initialFilters?.search || "",
    state: initialFilters?.state || "",
    stage: initialFilters?.stage || "",
    min_deals: initialFilters?.min_deals || "",
    min_volume: initialFilters?.min_volume || "",
  });

  const updateFilter = useCallback(
    (key: keyof FilterValues, value: string) => {
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
    const cleared: FilterValues = {
      search: "",
      state: "",
      stage: "",
      min_deals: "",
      min_volume: "",
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
          placeholder="Developer name..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">State</label>
        <select
          value={filters.state}
          onChange={(e) => updateFilter("state", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Stage</label>
        <select
          value={filters.stage}
          onChange={(e) => updateFilter("stage", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Min Deals in Market
        </label>
        <input
          type="number"
          min={0}
          placeholder="0"
          value={filters.min_deals}
          onChange={(e) => updateFilter("min_deals", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Min Volume ($)
        </label>
        <input
          type="number"
          min={0}
          placeholder="0"
          value={filters.min_volume}
          onChange={(e) => updateFilter("min_volume", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
