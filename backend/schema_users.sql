-- ========================================================================================
-- RC MOBILES & SERVICES - SECURE USERS & ROLE-BASED ACCESS CONTROL (RBAC) SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/bjxozcjubwzvuqanvqsp/sql)
-- or PostgreSQL Database terminal to create table, columns, and initial users.
-- ========================================================================================

-- 1. Create the 'users' table
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Fast Case-Insensitive Index on Username
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON public.users (LOWER(username));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create Service Role Policy
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users" 
ON public.users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Seed Initial Staff / Admin Accounts (Plaintext or Hashes - Backend Auto-Upgrades on First Login)
INSERT INTO public.users (username, email, password_hash, full_name, role, is_active)
VALUES 
    ('22913', 'bharathroy@rcmobiles.com', 'Bharathroy@03', 'Super Admin (Bharath Roy)', 'admin', TRUE),
    ('admin', 'admin@rcmobiles.com', 'admin@123', 'Store Owner / Admin', 'admin', TRUE),
    ('manager', 'manager@rcmobiles.com', 'manager@123', 'Store Manager', 'manager', TRUE),
    ('sales', 'sales@rcmobiles.com', 'sales@123', 'Sales Executive', 'staff', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Verification Query:
SELECT id, username, email, full_name, role, is_active, created_at FROM public.users;
