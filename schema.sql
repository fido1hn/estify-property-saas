
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROPERTIES
-- Stores main building assets
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Residential', 'Commercial', 'Industrial')),
  units INTEGER DEFAULT 0,
  occupancy INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STAFF
-- Stores personnel profiles (security, cleaners, etc.)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TENANTS
-- Stores tenant profiles linked to properties
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  unit_id TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lease_end DATE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Delinquent', 'Notice')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STAFF_PROPERTIES
-- Junction table for many-to-many relationship (Staff assigned to multiple buildings)
CREATE TABLE IF NOT EXISTS staff_properties (
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, property_id)
);

-- 5. MAINTENANCE REQUESTS
-- Work orders linked to properties/units
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INVOICES
-- Financial records for tenants
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MESSAGES
-- In-app communication history
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL, 
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Setup
-- You can expand these policies for multi-tenancy isolation
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Simple "Allow All" policy for initial dev environment (Docker)
-- IMPORTANT: Update these for production!
CREATE POLICY "Enable read for all users" ON properties FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON tenants FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON staff FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON maintenance_requests FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON invoices FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON messages FOR SELECT USING (true);
