import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  try {
    const { data, error } = await supabase
      .from("developer_notes")
      .select("*")
      .eq("developer_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch notes" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
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

  const supabase = createServerSupabase();

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Verify developer exists
    const { data: dev } = await supabase
      .from("developers")
      .select("id")
      .eq("id", id)
      .single();

    if (!dev) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("developer_notes")
      .insert({ developer_id: id, content: content.trim() })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create note" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
