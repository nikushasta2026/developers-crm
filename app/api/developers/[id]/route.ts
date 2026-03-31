import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { STAGES, type Stage } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const result = await pool.query("SELECT * FROM developers WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch developer:", error);
    return NextResponse.json(
      { error: "Failed to fetch developer" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { stage } = body;

    if (!stage || !STAGES.includes(stage as Stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const result = await pool.query(
      "UPDATE developers SET stage = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [stage, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update developer:", error);
    return NextResponse.json(
      { error: "Failed to update developer" },
      { status: 500 }
    );
  }
}
