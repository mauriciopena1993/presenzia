-- Free score submissions table
CREATE TABLE IF NOT EXISTS free_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name VARCHAR(255) NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  specialty VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  contact_name VARCHAR(255),
  score INTEGER,
  grade CHAR(1),
  top_competitor_name VARCHAR(255),
  top_competitor_count INTEGER,
  share_id VARCHAR(20) UNIQUE,
  results_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_audit BOOLEAN DEFAULT FALSE,
  converted_to_retainer BOOLEAN DEFAULT FALSE,
  email_sequence_started BOOLEAN DEFAULT FALSE,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_free_scores_share ON free_scores(share_id);
CREATE INDEX IF NOT EXISTS idx_free_scores_email ON free_scores(email);
CREATE INDEX IF NOT EXISTS idx_free_scores_created ON free_scores(created_at);

-- RLS: Allow API to insert/update/select (service role key)
ALTER TABLE free_scores ENABLE ROW LEVEL SECURITY;

-- Policy: service role can do everything
CREATE POLICY "Service role full access on free_scores"
  ON free_scores
  FOR ALL
  USING (true)
  WITH CHECK (true);
