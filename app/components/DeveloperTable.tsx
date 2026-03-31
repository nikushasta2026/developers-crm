"use client";

import Link from "next/link";
import { Developer, type Stage } from "@/lib/types";
import { StageBadge } from "./StageSelector";

function formatVolume(cents: number | null): string {
  if (cents === null || cents === undefined) return "—";
  const millions = cents / 1_000_000;
  if (millions >= 1) return `$${millions.toFixed(1)}m`;
  const thousands = cents / 1_000;
  return `$${thousands.toFixed(0)}k`;
}

interface DeveloperTableProps {
  developers: Developer[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (column: string) => void;
}

const columns = [
  { key: "name", label: "Developer Name", sortable: true },
  { key: "state", label: "State/Market", sortable: true },
  { key: "city", label: "City", sortable: true },
  { key: "deals_in_market", label: "Deals in Market", sortable: true },
  { key: "total_deals_nationwide", label: "Total Deals", sortable: true },
  { key: "total_volume_market", label: "Volume", sortable: true },
  { key: "avg_sale_price_market", label: "Avg Price", sortable: true },
  { key: "stage", label: "Stage", sortable: true },
  { key: "is_corp_llc", label: "Corp/LLC", sortable: true },
];

function SortIcon({
  column,
  sortBy,
  sortDir,
}: {
  column: string;
  sortBy: string;
  sortDir: string;
}) {
  if (column !== sortBy) {
    return (
      <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 8l5-5 5 5H5zm0 4l5 5 5-5H5z" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
      {sortDir === "asc" ? (
        <path d="M5 12l5-5 5 5H5z" />
      ) : (
        <path d="M5 8l5 5 5-5H5z" />
      )}
    </svg>
  );
}

export default function DeveloperTable({
  developers,
  sortBy,
  sortDir,
  onSort,
}: DeveloperTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-900/80 border-b border-slate-800">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${
                  col.sortable
                    ? "cursor-pointer hover:text-slate-200 select-none"
                    : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      column={col.key}
                      sortBy={sortBy}
                      sortDir={sortDir}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {developers.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-slate-500"
              >
                No developers found
              </td>
            </tr>
          ) : (
            developers.map((dev) => (
              <tr
                key={dev.id}
                className="bg-slate-900/30 hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/developer/${dev.id}`}
                    className="text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {dev.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{dev.state || "—"}</td>
                <td className="px-4 py-3 text-slate-300">{dev.city || "—"}</td>
                <td className="px-4 py-3 text-slate-300">
                  {dev.deals_in_market ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {dev.total_deals_nationwide ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {formatVolume(dev.total_volume_market)}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {formatVolume(dev.avg_sale_price_market)}
                </td>
                <td className="px-4 py-3">
                  <StageBadge stage={dev.stage as Stage} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      dev.is_corp_llc
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {dev.is_corp_llc ? "Y" : "N"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
