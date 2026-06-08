-- Run this in the Supabase SQL Editor before using recurring payments

create table if not exists recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric not null,
  category_id uuid references categories(id) on delete set null,
  frequency text check (frequency in ('weekly', 'monthly', 'custom')) not null default 'monthly',
  custom_days integer,
  next_due_date date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
