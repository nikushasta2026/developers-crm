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

CREATE TABLE IF NOT EXISTS developer_notes (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
