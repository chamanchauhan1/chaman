-- Supabase schema for FarmMRLPortal
-- This schema matches the existing Drizzle ORM schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'inspector', 'admin')),
  email TEXT NOT NULL UNIQUE,
  farm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  total_animals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals table
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tag_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cattle', 'sheep', 'goat', 'pig', 'poultry')),
  breed TEXT,
  date_of_birth TEXT,
  weight DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quarantine', 'sold', 'deceased')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment records table
CREATE TABLE treatment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  mrl_level DECIMAL(10,2),
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'warning', 'violation', 'pending')),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm reports table
CREATE TABLE farm_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'excel', 'csv')),
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('compliance', 'inspection', 'veterinary')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_farm_id ON users(farm_id);
CREATE INDEX idx_animals_farm_id ON animals(farm_id);
CREATE INDEX idx_animals_tag_number ON animals(tag_number);
CREATE INDEX idx_treatment_records_animal_id ON treatment_records(animal_id);
CREATE INDEX idx_treatment_records_farm_id ON treatment_records(farm_id);
CREATE INDEX idx_treatment_records_recorded_by ON treatment_records(recorded_by);
CREATE INDEX idx_farm_reports_farm_id ON farm_reports(farm_id);
CREATE INDEX idx_farm_reports_uploaded_by ON farm_reports(uploaded_by);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Farms policies
CREATE POLICY "Users can view farms they have access to" ON farms FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (farm_id = farms.id OR role = 'inspector'))
);
CREATE POLICY "Farmers can update their own farm" ON farms FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND farm_id = farms.id)
);
CREATE POLICY "Inspectors can view all farms" ON farms FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'inspector')
);

-- Animals policies
CREATE POLICY "Users can view animals from farms they have access to" ON animals FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (farm_id = animals.farm_id OR role = 'inspector'))
);
CREATE POLICY "Farmers can manage animals in their farm" ON animals FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND farm_id = animals.farm_id)
);

-- Treatment records policies
CREATE POLICY "Users can view treatment records from farms they have access to" ON treatment_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (farm_id = treatment_records.farm_id OR role = 'inspector'))
);
CREATE POLICY "Farmers can manage treatment records in their farm" ON treatment_records FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND farm_id = treatment_records.farm_id)
);

-- Farm reports policies
CREATE POLICY "Users can view farm reports from farms they have access to" ON farm_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (farm_id = farm_reports.farm_id OR role = 'inspector'))
);
CREATE POLICY "Farmers can upload reports for their farm" ON farm_reports FOR INSERT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND farm_id = farm_reports.farm_id)
);
