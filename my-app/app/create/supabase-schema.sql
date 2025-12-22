-- Supabase (PostgreSQL) schema for the "events" feature
-- Run this in Supabase Dashboard -> SQL Editor
--
-- Notes:
-- - Supabase uses Postgres; prefer `public` schema.
-- - Arrays are used for languages/tags/images for simplicity.
-- - Rating + I/E stats are stored as summary fields (can be derived later).

-- Enable pgcrypto for gen_random_uuid() (often enabled by default in Supabase)
create extension if not exists "pgcrypto";

-- Create dedicated schema (namespace)
create schema if not exists create_event;

-- Optional: updated_at trigger helper
create or replace function create_event.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Main table: create_event.created_data
create table if not exists create_event.created_data (
  id uuid primary key default gen_random_uuid(),

  -- Core fields
  title text not null,
  category text not null,
  event_date date not null,
  event_time text not null, -- HH:MM
  location text not null,
  description text not null,

  -- Capacity / pricing
  max_participants int not null check (max_participants >= 2),
  current_participants int not null default 0 check (current_participants >= 0),
  fee int not null default 0 check (fee >= 0),

  -- Arrays
  languages text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  images text[] not null default '{}'::text[],

  -- Organizer snapshot (until you implement auth/user profiles)
  organizer_id text null,
  organizer_name text null,
  organizer_avatar text null,

  -- Organizer rating summary (0..5)
  organizer_rating_average numeric(3,2) not null default 0 check (organizer_rating_average >= 0 and organizer_rating_average <= 5),
  organizer_rating_count int not null default 0 check (organizer_rating_count >= 0),

  -- Privacy-safe MBTI summary (Introvert/Extrovert counts)
  introvert_count int not null default 0 check (introvert_count >= 0),
  extrovert_count int not null default 0 check (extrovert_count >= 0),

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
-- NOTE: trigger function must be in the same schema-qualified reference.
drop trigger if exists trg_created_data_updated_at on create_event.created_data;
create trigger trg_created_data_updated_at
before update on create_event.created_data
for each row
execute function create_event.set_updated_at();

-- Helpful indexes
create index if not exists idx_created_data_event_date on create_event.created_data (event_date);
create index if not exists idx_created_data_category on create_event.created_data (category);
