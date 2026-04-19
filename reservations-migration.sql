-- ============================================================
-- MotoShop: Reservations Table Migration
-- TODO: implemented — Run this in your Supabase SQL editor
-- ============================================================

-- Create the reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  status VARCHAR NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'fulfilled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Customers can create reservations (insert)
CREATE POLICY "Customers can insert reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can view their own reservations
CREATE POLICY "Customers can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = customer_id);

-- Owners can manage all reservations (full CRUD)
CREATE POLICY "Owners can manage all reservations" ON reservations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- Enable Realtime for reservations table (for live dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_part ON reservations(part_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
