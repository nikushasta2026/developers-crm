"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { STAGES, type Stage } from "@/lib/types";

interface Stats {
  total_developers: number;
  by_stage: Record<string, number>;
  total_deals_in_market: number;
  total_deals_nationwide: number;
  total_volume: number;
}

const stageBarColors: Record<Stage, string> = {
  Prospect: "bg-slate-500",
  Contacted: "bg-blue-500",
  Qualified: "bg-yellow-500",
  "In Deal": "bg-orange-500",
  Closed: "bg-green-500",
};

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/developers/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500">Loading dashboard...</div>
        </div>
      </AppShell>
    );
  }

  if (!stats) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500">Failed to load dashboard</div>
        </div>
      </AppShell>
    );
  }

  const maxStageCount = Math.max(...Object.values(stats.by_stage), 1);

  return (
    <AppShell>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of your developer pipeline
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Total Developers</p>
            <p className="text-3xl font-bold text-white">{stats.total_developers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Deals in Market</p>
            <p className="text-3xl font-bold text-white">{stats.total_deals_in_market.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Deals Nationwide</p>
            <p className="text-3xl font-bold text-white">{stats.total_deals_nationwide.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Total Volume</p>
            <p className="text-3xl font-bold text-white">{formatVolume(stats.total_volume)}</p>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Pipeline Distribution</h2>
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const count = stats.by_stage[stage] || 0;
              const pct = stats.total_developers > 0
                ? ((count / stats.total_developers) * 100).toFixed(0)
                : "0";
              const barWidth = maxStageCount > 0
                ? (count / maxStageCount) * 100
                : 0;

              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-slate-300 flex-shrink-0">{stage}</div>
                  <div className="flex-1 bg-slate-800 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full ${stageBarColors[stage]} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(barWidth, count > 0 ? 8 : 0)}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-medium text-white">{count}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs text-slate-500">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map((stage) => {
            const count = stats.by_stage[stage] || 0;
            return (
              <a
                key={stage}
                href={`/?stage=${encodeURIComponent(stage)}`}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition group"
              >
                <div className={`w-3 h-3 rounded-full ${stageBarColors[stage]} mb-3`} />
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition">{stage}</p>
              </a>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
