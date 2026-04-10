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
    const {
      name,
      state,
      city,
      deals_in_market,
      total_deals_nationwide,
      total_volume_market,
      avg_sale_price_market,
      is_corp_llc,
      sample_addresses,
      stage,
      notes,
    } = body;

    // Build update object with only provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    if (deals_in_market !== undefined) updateData.deals_in_market = deals_in_market;
    if (total_deals_nationwide !== undefined) updateData.total_deals_nationwide = total_deals_nationwide;
    if (total_volume_market !== undefined) updateData.total_volume_market = total_volume_market;
    if (avg_sale_price_market !== undefined) updateData.avg_sale_price_market = avg_sale_price_market;
    if (is_corp_llc !== undefined) updateData.is_corp_llc = is_corp_llc;
    if (sample_addresses !== undefined) updateData.sample_addresses = sample_addresses;
    if (notes !== undefined) updateData.notes = notes;
    if (stage !== undefined) {
      if (!STAGES.includes(stage as Stage)) {
        return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
      }
      updateData.stage = stage;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("developers")
      .update(updateData)
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  try {
    const { error } = await supabase
      .from("developers")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete developer" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete developer:", error);
    return NextResponse.json(
      { error: "Failed to delete developer" },
      { status: 500 }
    );
  }
}
