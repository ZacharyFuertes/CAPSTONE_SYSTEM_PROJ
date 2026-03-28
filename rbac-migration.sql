-- RBAC Security Overhaul: Schema Additions & Constraints
-- Run this script in the Supabase SQL Editor

-- 1. Enforce Role Constraints on users table
-- Note: 'admin' is replaced by 'owner'. Since some demo data might have 'admin',
-- it's safer to allow 'admin' for now or update it first.
UPDATE public.users SET role = 'owner' WHERE role = 'admin';

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('owner', 'mechanic', 'customer'));

-- 2. Cleanup legacy invite table if it exists from previous attempts
DROP TABLE IF EXISTS public.staff_invitations CASCADE;



-- 3. Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR NOT NULL,
  details TEXT,
  ip_address VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 4. Set up Row Level Security (RLS) policies

-- Enable RLS on new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- audit_logs policies
DROP POLICY IF EXISTS "Owners can view audit logs" ON public.audit_logs;
CREATE POLICY "Owners can view audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Only service role (or authenticated users via a secure function) should insert.
-- Let's allow authenticated users to insert their own logs.
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert their own audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );
