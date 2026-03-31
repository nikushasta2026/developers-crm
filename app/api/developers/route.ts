import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { DeveloperFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
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

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (filters.search) {
    conditions.push(`name ILIKE $${paramIdx}`);
    values.push(`%${filters.search}%`);
    paramIdx++;
  }

  if (filters.state) {
    conditions.push(`state = $${paramIdx}`);
    values.push(filters.state);
    paramIdx++;
  }

  if (filters.stage) {
    conditions.push(`stage = $${paramIdx}`);
    values.push(filters.stage);
    paramIdx++;
  }

  if (filters.min_deals !== undefined) {
    conditions.push(`deals_in_market >= $${paramIdx}`);
    values.push(filters.min_deals);
    paramIdx++;
  }

  if (filters.min_volume !== undefined) {
    conditions.push(`total_volume_market >= $${paramIdx}`);
    values.push(filters.min_volume);
    paramIdx++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortColumns = [
    "name",
    "state",
    "city",
    "deals_in_market",
    "total_deals_nationwide",
    "total_volume_market",
    "avg_sale_price_market",
    "stage",
    "is_corp_llc",
  ];
  const sortBy = allowedSortColumns.includes(filters.sort_by || "")
    ? filters.sort_by
    : "name";
  const sortDir = filters.sort_dir === "desc" ? "DESC" : "ASC";

  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(100, Math.max(1, filters.per_page || 50));
  const offset = (page - 1) * perPage;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM developers ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT * FROM developers ${whereClause} ORDER BY ${sortBy} ${sortDir} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...values, perPage, offset]
    );

    return NextResponse.json({
      data: dataResult.rows,
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
