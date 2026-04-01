import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import type { DeveloperFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const params = request.nextUrl.searchParams;

  const filters: DeveloperFilters = {
    search: params.get("search") || undefined,
    state: params.get("state") || undefined,
    stage: params.get("stage") || undefined,
    min_deals: params.get("min_deals")
      ? Number(params.get("min_deals"))
      : undefined,
    min_volume: params.get("min_volume")
      ? Number(params.get("min_volume"))
      : undefined,
    sort_by: params.get("sort_by") || "name",
    sort_dir: (params.get("sort_dir") as "asc" | "desc") || "asc",
    page: params.get("page") ? Number(params.get("page")) : 1,
    per_page: params.get("per_page") ? Number(params.get("per_page")) : 50,
  };

  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(100, Math.max(1, filters.per_page || 50));
  const offset = (page - 1) * perPage;

  const allowedSortColumns = [
    "name", "state", "city", "deals_in_market",
    "total_deals_nationwide", "total_volume_market",
    "avg_sale_price_market", "stage", "is_corp_llc",
  ];
  const sortBy = allowedSortColumns.includes(filters.sort_by || "")
    ? filters.sort_by!
    : "name";
  const ascending = filters.sort_dir !== "desc";

  try {
    let query = supabase.from("developers").select("*", { count: "exact" });

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters.state) {
      query = query.eq("state", filters.state);
    }
    if (filters.stage) {
      query = query.eq("stage", filters.stage);
    }
    if (filters.min_deals !== undefined) {
      query = query.gte("deals_in_market", filters.min_deals);
    }
    if (filters.min_volume !== undefined) {
      query = query.gte("total_volume_market", filters.min_volume);
    }

    query = query
      .order(sortBy, { ascending })
      .range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch developers" },
        { status: 500 }
      );
    }

    const total = count || 0;

    return NextResponse.json({
      data: data || [],
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("Failed to fetch developers:", error);
    return NextResponse.json(
      { error: "Failed to fetch developers" },
      { status: 500 }
    );
  }
}
