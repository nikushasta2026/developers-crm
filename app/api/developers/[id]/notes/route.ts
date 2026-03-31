import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM developer_notes WHERE developer_id = $1 ORDER BY created_at DESC",
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const devCheck = await pool.query(
      "SELECT id FROM developers WHERE id = $1",
      [id]
    );
    if (devCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      "INSERT INTO developer_notes (developer_id, content) VALUES ($1, $2) RETURNING *",
      [id, content.trim()]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
