-- ═══════════════════════════════════════════════════
-- Migration: Create part_sales table for POS revenue tracking
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.part_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sold_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast date-range queries (dashboard revenue)
CREATE INDEX IF NOT EXISTS idx_part_sales_created_at ON public.part_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_part_sales_shop ON public.part_sales(shop_id);

-- Enable RLS
ALTER TABLE public.part_sales ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Owner full access to part_sales"
  ON public.part_sales
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Mechanic can view
CREATE POLICY "Mechanic can view part_sales"
  ON public.part_sales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'mechanic'
    )
  );
