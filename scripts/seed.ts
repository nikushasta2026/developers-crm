import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import bcrypt from "bcrypt";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://lux_crm:password@localhost:5432/lux_crm";

const pool = new Pool({ connectionString: DATABASE_URL });

function parseNumber(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const cleaned = val.replace(/[$,\s]/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

function parseBool(val: string | undefined): boolean {
  if (!val) return false;
  const lower = val.trim().toLowerCase();
  return lower === "y" || lower === "yes" || lower === "true" || lower === "1";
}

async function seed() {
  console.log("Running migration...");
  const migrationSql = fs.readFileSync(
    path.join(__dirname, "migrate.sql"),
    "utf-8"
  );
  await pool.query(migrationSql);
  console.log("Migration complete.");

  // Seed admin user
  const adminEmail = "marcus@shasta-collective.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Stilgar2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
    [adminEmail, passwordHash]
  );
  console.log(`Admin user seeded: ${adminEmail}`);

  // Check for CSV
  const csvPaths = [
    path.join(process.cwd(), "data", "developer_outreach_CORRECTED.csv"),
    path.join(__dirname, "..", "data", "developer_outreach_CORRECTED.csv"),
    "/data/developer_outreach_CORRECTED.csv",
  ];

  let csvPath: string | null = null;
  for (const p of csvPaths) {
    if (fs.existsSync(p)) {
      csvPath = p;
      break;
    }
  }

  if (!csvPath) {
    console.log(
      "No CSV file found. Seeding sample data instead."
    );
    await seedSampleData();
    await pool.end();
    return;
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records in CSV.`);

  // Clear existing developers
  await pool.query("DELETE FROM developer_notes");
  await pool.query("DELETE FROM developers");

  let inserted = 0;
  for (const row of records) {
    const name =
      row["Developer Name"] || row["developer_name"] || row["name"] || "";
    if (!name.trim()) continue;

    const state = row["State"] || row["state"] || row["Market"] || null;
    const city = row["City"] || row["city"] || null;
    const dealsInMarket = parseNumber(
      row["Deals in Market"] || row["deals_in_market"]
    );
    const totalDeals = parseNumber(
      row["Total Deals Nationwide"] || row["total_deals_nationwide"]
    );
    const volume = parseNumber(
      row["Total Volume (Market)"] ||
        row["total_volume_market"] ||
        row["Volume"]
    );
    const avgPrice = parseNumber(
      row["Avg Sale Price (Market)"] ||
        row["avg_sale_price_market"] ||
        row["Avg Price"]
    );
    const isCorpLlc = parseBool(
      row["Corp/LLC"] || row["is_corp_llc"] || row["corp_llc"]
    );
    const sampleAddresses =
      row["Sample Addresses"] || row["sample_addresses"] || null;

    await pool.query(
      `INSERT INTO developers (name, state, city, deals_in_market, total_deals_nationwide, total_volume_market, avg_sale_price_market, is_corp_llc, sample_addresses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        name.trim(),
        state?.trim() || null,
        city?.trim() || null,
        dealsInMarket,
        totalDeals,
        volume,
        avgPrice,
        isCorpLlc,
        sampleAddresses?.trim() || null,
      ]
    );
    inserted++;
  }

  console.log(`Inserted ${inserted} developers.`);
  await pool.end();
  console.log("Seed complete.");
}

async function seedSampleData() {
  const developers = [
    {
      name: "Meridian Development Group",
      state: "FL",
      city: "Miami",
      deals_in_market: 12,
      total_deals_nationwide: 45,
      total_volume_market: 78500000,
      avg_sale_price_market: 6541667,
      is_corp_llc: true,
      sample_addresses:
        "1200 Brickell Ave, Miami FL; 500 Ocean Dr, Miami Beach FL; 900 Collins Ave, Miami Beach FL",
    },
    {
      name: "Pacific Heights Capital",
      state: "CA",
      city: "San Francisco",
      deals_in_market: 8,
      total_deals_nationwide: 32,
      total_volume_market: 124000000,
      avg_sale_price_market: 15500000,
      is_corp_llc: true,
      sample_addresses:
        "2800 Pacific Ave, San Francisco CA; 1500 Broadway, San Francisco CA",
    },
    {
      name: "Manhattan Luxury Partners",
      state: "NY",
      city: "New York",
      deals_in_market: 22,
      total_deals_nationwide: 67,
      total_volume_market: 340000000,
      avg_sale_price_market: 15454545,
      is_corp_llc: true,
      sample_addresses:
        "432 Park Ave, New York NY; 220 Central Park S, New York NY; 15 Hudson Yards, New York NY",
    },
    {
      name: "Desert View Estates LLC",
      state: "AZ",
      city: "Scottsdale",
      deals_in_market: 6,
      total_deals_nationwide: 14,
      total_volume_market: 28500000,
      avg_sale_price_market: 4750000,
      is_corp_llc: true,
      sample_addresses:
        "10040 E Happy Valley Rd, Scottsdale AZ; 7500 E Doubletree Ranch Rd, Scottsdale AZ",
    },
    {
      name: "John Richardson",
      state: "TX",
      city: "Austin",
      deals_in_market: 4,
      total_deals_nationwide: 9,
      total_volume_market: 18200000,
      avg_sale_price_market: 4550000,
      is_corp_llc: false,
      sample_addresses: "1100 West Ave, Austin TX; 200 Congress Ave, Austin TX",
    },
    {
      name: "Coastal Properties Inc",
      state: "FL",
      city: "Naples",
      deals_in_market: 15,
      total_deals_nationwide: 28,
      total_volume_market: 95000000,
      avg_sale_price_market: 6333333,
      is_corp_llc: true,
      sample_addresses:
        "4000 Gulf Shore Blvd N, Naples FL; 280 Vanderbilt Beach Rd, Naples FL",
    },
    {
      name: "Sarah Chen Developments",
      state: "CA",
      city: "Los Angeles",
      deals_in_market: 10,
      total_deals_nationwide: 38,
      total_volume_market: 156000000,
      avg_sale_price_market: 15600000,
      is_corp_llc: false,
      sample_addresses:
        "1 W Century Dr, Los Angeles CA; 10000 Santa Monica Blvd, Los Angeles CA",
    },
    {
      name: "Summit Real Estate Holdings",
      state: "CO",
      city: "Aspen",
      deals_in_market: 5,
      total_deals_nationwide: 18,
      total_volume_market: 67000000,
      avg_sale_price_market: 13400000,
      is_corp_llc: true,
      sample_addresses:
        "600 E Main St, Aspen CO; 135 E Hyman Ave, Aspen CO",
    },
    {
      name: "Harbor Point Group",
      state: "CT",
      city: "Greenwich",
      deals_in_market: 7,
      total_deals_nationwide: 22,
      total_volume_market: 89000000,
      avg_sale_price_market: 12714286,
      is_corp_llc: true,
      sample_addresses:
        "200 Field Point Rd, Greenwich CT; 50 Byram Shore Rd, Greenwich CT",
    },
    {
      name: "Michael Torres",
      state: "NV",
      city: "Las Vegas",
      deals_in_market: 9,
      total_deals_nationwide: 24,
      total_volume_market: 42000000,
      avg_sale_price_market: 4666667,
      is_corp_llc: false,
      sample_addresses:
        "1 Queensridge Pl, Las Vegas NV; 9500 W Flamingo Rd, Las Vegas NV",
    },
  ];

  await pool.query("DELETE FROM developer_notes");
  await pool.query("DELETE FROM developers");

  for (const dev of developers) {
    await pool.query(
      `INSERT INTO developers (name, state, city, deals_in_market, total_deals_nationwide, total_volume_market, avg_sale_price_market, is_corp_llc, sample_addresses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        dev.name,
        dev.state,
        dev.city,
        dev.deals_in_market,
        dev.total_deals_nationwide,
        dev.total_volume_market,
        dev.avg_sale_price_market,
        dev.is_corp_llc,
        dev.sample_addresses,
      ]
    );
  }

  console.log(`Inserted ${developers.length} sample developers.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
