import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") || "json";
  const supabase = createServerSupabase();

  try {
    const { data, error } = await supabase
      .from("developers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to export developers" },
        { status: 500 }
      );
    }

    const developers = data || [];

    if (format === "csv") {
      const headers = [
        "ID", "Name", "State", "City", "Deals in Market",
        "Total Deals Nationwide", "Total Volume (Market)",
        "Avg Sale Price (Market)", "Corp/LLC", "Stage",
        "Sample Addresses", "Created At", "Updated At",
      ];

      const escapeCSV = (val: string | null | undefined): string => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = developers.map((d) =>
        [
          d.id, d.name, d.state, d.city, d.deals_in_market,
          d.total_deals_nationwide, d.total_volume_market,
          d.avg_sale_price_market, d.is_corp_llc ? "Y" : "N",
          d.stage, d.sample_addresses, d.created_at, d.updated_at,
        ]
          .map((v) => escapeCSV(v as string))
          .join(",")
      );

      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="developers-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format
    return new NextResponse(JSON.stringify(developers, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="developers-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Failed to export developers:", error);
    return NextResponse.json(
      { error: "Failed to export developers" },
      { status: 500 }
    );
  }
}
