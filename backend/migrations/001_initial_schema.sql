-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  checks_today INTEGER DEFAULT 0,
  last_check_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  text_content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create shingles table (for plagiarism detection)
CREATE TABLE IF NOT EXISTS shingles (
  id BIGSERIAL PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  shingle_hash BIGINT NOT NULL,
  position INTEGER NOT NULL,
  text_fragment TEXT
);

-- Create index on shingle_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_shingles_hash ON shingles(shingle_hash);
CREATE INDEX IF NOT EXISTS idx_shingles_document ON shingles(document_id);

-- Create check_results table
CREATE TABLE IF NOT EXISTS check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plagiarism_percent DECIMAL(5,2) NOT NULL,
  ai_detection_percent DECIMAL(5,2) NOT NULL,
  sources JSONB,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  check_result_id UUID REFERENCES check_results(id) ON DELETE CASCADE,
  source_doc_id UUID REFERENCES documents(id),
  matched_text TEXT,
  match_percent DECIMAL(5,2),
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_check_results_user ON check_results(user_id);
CREATE INDEX IF NOT EXISTS idx_check_results_document ON check_results(document_id);
CREATE INDEX IF NOT EXISTS idx_matches_check ON matches(check_result_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
