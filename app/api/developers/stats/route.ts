import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { STAGES } from "@/lib/types";

export async function GET() {
  const supabase = createServerSupabase();

  try {
    // Get all developers for stats calculation
    const { data: developers, error } = await supabase
      .from("developers")
      .select("stage, deals_in_market, total_volume_market, total_deals_nationwide");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const devs = developers || [];
    const total = devs.length;

    const byStage: Record<string, number> = {};
    for (const stage of STAGES) {
      byStage[stage] = 0;
    }
    for (const dev of devs) {
      if (dev.stage && byStage[dev.stage] !== undefined) {
        byStage[dev.stage]++;
      }
    }

    const totalDeals = devs.reduce(
      (sum, d) => sum + (d.deals_in_market || 0),
      0
    );
    const totalVolume = devs.reduce(
      (sum, d) => sum + (d.total_volume_market || 0),
      0
    );
    const totalDealsNationwide = devs.reduce(
      (sum, d) => sum + (d.total_deals_nationwide || 0),
      0
    );

    return NextResponse.json({
      total_developers: total,
      by_stage: byStage,
      total_deals_in_market: totalDeals,
      total_deals_nationwide: totalDealsNationwide,
      total_volume: totalVolume,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
