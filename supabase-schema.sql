-- Supabase Schema for PaisaTrack
-- Run this in your Supabase SQL Editor to set up all necessary tables

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  daily_budget NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for development (or create policies)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  note TEXT,
  date TIMESTAMPTZ NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- 3. Balance Entries Table
CREATE TABLE IF NOT EXISTS balance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  note TEXT,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE balance_entries DISABLE ROW LEVEL SECURITY;

-- 4. Stipend Config Table (singleton)
CREATE TABLE IF NOT EXISTS stipend_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  credit_day INTEGER NOT NULL CHECK (credit_day >= 1 AND credit_day <= 31),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE stipend_config DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_balance_entries_type ON balance_entries(type);

-- Create trigger for updated_at on stipend_config
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stipend_config_updated_at BEFORE UPDATE ON stipend_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
