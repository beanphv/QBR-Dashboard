-- Create database schema for healthcare data tracking dashboard

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'analyst');
CREATE TYPE quarter_type AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pid TEXT UNIQUE NOT NULL, -- Hospital PID from Excel
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pid TEXT UNIQUE NOT NULL, -- Pharmacy PID from Excel
  name TEXT NOT NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quarterly hospital data (from Hospital sheet)
CREATE TABLE IF NOT EXISTS quarterly_hospital_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  savings DECIMAL(15,2),
  drug_spend DECIMAL(15,2),
  savings_to_spend_percent DECIMAL(5,2),
  eligible_percent DECIMAL(5,2),
  medicaid_percent DECIMAL(5,2),
  macro_savings DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, quarter, year)
);

-- Hospital qualifications data (from Hospital Qualifications sheet)
CREATE TABLE IF NOT EXISTS hospital_qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  qualified_percent DECIMAL(5,2),
  inpatient_percent DECIMAL(5,2),
  medicaid_percent DECIMAL(5,2),
  orphan_percent DECIMAL(5,2),
  non_340b_drug_percent DECIMAL(5,2),
  drug_exclude_percent DECIMAL(5,2),
  disqualified_percent DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, quarter, year)
);

-- Pharmacy qualifications data (from Retail Qualifications sheet)
CREATE TABLE IF NOT EXISTS pharmacy_qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  qualified_percent DECIMAL(5,2),
  inpatient_percent DECIMAL(5,2),
  medicaid_percent DECIMAL(5,2),
  orphan_percent DECIMAL(5,2),
  non_340b_drug_percent DECIMAL(5,2),
  drug_exclude_percent DECIMAL(5,2),
  disqualified_percent DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pharmacy_id, quarter, year)
);

-- Pharmacy profit data (from Retail Profit sheet)
CREATE TABLE IF NOT EXISTS quarterly_pharmacy_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  scripts INTEGER,
  dispensing_fee DECIMAL(15,2),
  ce_revenue DECIMAL(15,2),
  drug_cost DECIMAL(15,2),
  current_profit DECIMAL(15,2),
  current_profit_median DECIMAL(15,2),
  brand_profit DECIMAL(15,2),
  brand_profit_avg DECIMAL(15,2),
  generic_profit DECIMAL(15,2),
  generic_profit_avg DECIMAL(15,2),
  ep_added_340b_benefit DECIMAL(15,2),
  ep_340b_bucket_split DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pharmacy_id, quarter, year)
);

-- Data upload tracking
CREATE TABLE IF NOT EXISTS data_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID REFERENCES users(id),
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  filename TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  records_processed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospitals_pid ON hospitals(pid);
CREATE INDEX IF NOT EXISTS idx_pharmacies_pid ON pharmacies(pid);
CREATE INDEX IF NOT EXISTS idx_pharmacies_hospital ON pharmacies(hospital_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_hospital_data_quarter_year ON quarterly_hospital_data(quarter, year);
CREATE INDEX IF NOT EXISTS idx_hospital_qualifications_quarter_year ON hospital_qualifications(quarter, year);
CREATE INDEX IF NOT EXISTS idx_pharmacy_qualifications_quarter_year ON pharmacy_qualifications(quarter, year);
CREATE INDEX IF NOT EXISTS idx_quarterly_pharmacy_data_quarter_year ON quarterly_pharmacy_data(quarter, year);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_hospital_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_pharmacy_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_uploads ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

-- Admins can read all data, analysts can read all except user management
CREATE POLICY "Admin full access" ON hospitals FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access" ON hospitals FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);

-- Apply similar policies to other tables
CREATE POLICY "Admin full access pharmacies" ON pharmacies FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access pharmacies" ON pharmacies FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);

CREATE POLICY "Admin full access quarterly_hospital_data" ON quarterly_hospital_data FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access quarterly_hospital_data" ON quarterly_hospital_data FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);

CREATE POLICY "Admin full access hospital_qualifications" ON hospital_qualifications FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access hospital_qualifications" ON hospital_qualifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);

CREATE POLICY "Admin full access pharmacy_qualifications" ON pharmacy_qualifications FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access pharmacy_qualifications" ON pharmacy_qualifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);

CREATE POLICY "Admin full access quarterly_pharmacy_data" ON quarterly_pharmacy_data FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access quarterly_pharmacy_data" ON quarterly_pharmacy_data FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);

CREATE POLICY "Admin full access data_uploads" ON data_uploads FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Analyst read access data_uploads" ON data_uploads FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'analyst'))
);
