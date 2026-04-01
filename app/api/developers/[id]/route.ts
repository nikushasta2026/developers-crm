import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { STAGES, type Stage } from "@/lib/types";

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
      .from("developers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
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

  const supabase = createServerSupabase();

  try {
    const body = await request.json();
    const { stage } = body;

    if (!stage || !STAGES.includes(stage as Stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("developers")
      .update({ stage, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update developer:", error);
    return NextResponse.json(
      { error: "Failed to update developer" },
      { status: 500 }
    );
  }
}
