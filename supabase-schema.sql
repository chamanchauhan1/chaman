-- Supabase Schema Migration
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'inspector')),
  email TEXT NOT NULL UNIQUE,
  farm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  total_animals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tag_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cattle', 'sheep', 'goat', 'pig', 'poultry')),
  breed TEXT,
  date_of_birth TEXT,
  weight DECIMAL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quarantine', 'sold', 'deceased')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment Records table
CREATE TABLE IF NOT EXISTS treatment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  antimicrobial_type TEXT NOT NULL,
  dosage TEXT NOT NULL,
  unit TEXT NOT NULL,
  administered_by TEXT NOT NULL,
  administered_date TEXT NOT NULL,
  withdrawal_period_days INTEGER NOT NULL,
  withdrawal_end_date TEXT NOT NULL,
  purpose_of_treatment TEXT NOT NULL,
  mrl_level DECIMAL,
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'warning', 'violation', 'pending')),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Reports table
CREATE TABLE IF NOT EXISTS farm_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'excel', 'csv')),
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('compliance', 'inspection', 'veterinary')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_animals_farm_id ON animals(farm_id);
CREATE INDEX IF NOT EXISTS idx_treatment_records_animal_id ON treatment_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_treatment_records_farm_id ON treatment_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_reports_farm_id ON farm_reports(farm_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add foreign key constraint for users.farm_id
ALTER TABLE users ADD CONSTRAINT fk_users_farm_id FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can customize these based on your security requirements)
-- Note: These are permissive policies for development. In production, you should restrict access appropriately.

-- Users policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON users FOR UPDATE USING (true);

-- Farms policies
CREATE POLICY "Enable read access for all users" ON farms FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON farms FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON farms FOR UPDATE USING (true);

-- Animals policies
CREATE POLICY "Enable read access for all users" ON animals FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON animals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON animals FOR UPDATE USING (true);

-- Treatment Records policies
CREATE POLICY "Enable read access for all users" ON treatment_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON treatment_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON treatment_records FOR UPDATE USING (true);

-- Farm Reports policies
CREATE POLICY "Enable read access for all users" ON farm_reports FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON farm_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON farm_reports FOR UPDATE USING (true);
