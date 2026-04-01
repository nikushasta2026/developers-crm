-- Run this in the Supabase SQL Editor to set up the database schema

-- Developers table
CREATE TABLE IF NOT EXISTS developers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT,
  city TEXT,
  deals_in_market INTEGER,
  total_deals_nationwide INTEGER,
  total_volume_market BIGINT,
  avg_sale_price_market INTEGER,
  is_corp_llc BOOLEAN DEFAULT false,
  sample_addresses TEXT,
  stage TEXT DEFAULT 'Prospect',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developer notes table
CREATE TABLE IF NOT EXISTS developer_notes (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_notes ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users full access
CREATE POLICY "Authenticated users can read developers"
  ON developers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert developers"
  ON developers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update developers"
  ON developers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete developers"
  ON developers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read notes"
  ON developer_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notes"
  ON developer_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notes"
  ON developer_notes FOR DELETE
  TO authenticated
  USING (true);

-- Sample data (optional - run after schema creation)
INSERT INTO developers (name, state, city, deals_in_market, total_deals_nationwide, total_volume_market, avg_sale_price_market, is_corp_llc, sample_addresses, stage)
VALUES
  ('Meridian Development Group', 'FL', 'Miami', 12, 45, 78500000, 6541667, true, '1200 Brickell Ave, Miami FL; 500 Ocean Dr, Miami Beach FL', 'Qualified'),
  ('Pacific Heights Capital', 'CA', 'San Francisco', 8, 32, 124000000, 15500000, true, '2800 Pacific Ave, San Francisco CA; 1500 Broadway, San Francisco CA', 'Contacted'),
  ('Manhattan Luxury Partners', 'NY', 'New York', 22, 67, 340000000, 15454545, true, '432 Park Ave, New York NY; 220 Central Park S, New York NY', 'In Deal'),
  ('Desert View Estates LLC', 'AZ', 'Scottsdale', 6, 14, 28500000, 4750000, true, '10040 E Happy Valley Rd, Scottsdale AZ', 'Prospect'),
  ('John Richardson', 'TX', 'Austin', 4, 9, 18200000, 4550000, false, '1100 West Ave, Austin TX; 200 Congress Ave, Austin TX', 'Prospect'),
  ('Coastal Properties Inc', 'FL', 'Naples', 15, 28, 95000000, 6333333, true, '4000 Gulf Shore Blvd N, Naples FL', 'Closed'),
  ('Sarah Chen Developments', 'CA', 'Los Angeles', 10, 38, 156000000, 15600000, false, '1 W Century Dr, Los Angeles CA', 'Qualified'),
  ('Summit Real Estate Holdings', 'CO', 'Aspen', 5, 18, 67000000, 13400000, true, '600 E Main St, Aspen CO', 'Contacted'),
  ('Harbor Point Group', 'CT', 'Greenwich', 7, 22, 89000000, 12714286, true, '200 Field Point Rd, Greenwich CT', 'In Deal'),
  ('Michael Torres', 'NV', 'Las Vegas', 9, 24, 42000000, 4666667, false, '1 Queensridge Pl, Las Vegas NV', 'Prospect');
