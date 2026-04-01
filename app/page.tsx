"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "./components/AppShell";
import DeveloperTable from "./components/DeveloperTable";
import DeveloperModal from "./components/DeveloperModal";
import FiltersPanel, { type FilterValues } from "./components/FiltersPanel";
import type { Developer, PaginatedResponse } from "@/lib/types";

function DevelopersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<PaginatedResponse<Developer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    stage: searchParams.get("stage") || "",
    min_deals: searchParams.get("min_deals") || "",
    min_volume: searchParams.get("min_volume") || "",
  });

  const [modalOpen, setModalOpen] = useState(false);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort_by", sortBy);
    params.set("sort_dir", sortDir);
    params.set("page", String(page));
    params.set("per_page", "50");

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    try {
      const res = await fetch(`/api/developers?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to fetch developers");
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortDir, page, filters]);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  useEffect(() => {
    fetch("/api/developers?per_page=1000")
      .then((r) => r.json())
      .then((json) => {
        const stateSet = new Set<string>(
          (json.data || [])
            .map((d: Developer) => d.state)
            .filter(Boolean) as string[]
        );
        setStates(Array.from(stateSet).sort());
      })
      .catch(() => {});
  }, []);

  const handleSort = (column: string) => {
    if (column === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl);
  }, [router]);

  const handleExport = (format: "csv" | "json") => {
    window.open(`/api/developers/export?format=${format}`, "_blank");
  };

  const handleAddSuccess = () => {
    setModalOpen(false);
    fetchDevelopers();
  };

  return (
    <AppShell>
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Developers</h1>
            <p className="text-sm text-slate-400 mt-1">
              {data ? `${data.total} developers` : "Loading..."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Developer
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              JSON
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <FiltersPanel
              states={states}
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          <div className="flex-1 min-w-0">
            {loading && !data ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-slate-500">Loading developers...</div>
              </div>
            ) : (
              <>
                <DeveloperTable
                  developers={data?.data || []}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={handleSort}
                />

                {data && data.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-slate-500">
                      Page {data.page} of {data.total_pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(data.total_pages, p + 1))
                        }
                        disabled={page === data.total_pages}
                        className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DeveloperModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddSuccess}
          mode="add"
        />
      </div>
    </AppShell>
  );
}

export default function DevelopersPage() {
  return (
    <Suspense fallback={<AppShell><div className="p-6 text-slate-400">Loading...</div></AppShell>}>
      <DevelopersPageContent />
    </Suspense>
  );
}
