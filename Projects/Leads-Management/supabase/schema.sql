-- Run this once in the Supabase SQL editor for your project.
-- (Reflects the live schema — matches what's actually deployed.)

create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null default '',
  description text not null default '',
  image_url text,
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Company-wide employees — not tied to a single project.
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  -- Managers use the admin panel directly and never appear in the GPS
  -- attendance flow (they aren't field staff clocking in).
  is_manager boolean not null default false,
  created_at timestamptz not null default now()
);

-- Which employees are assigned to work on which project.
create table if not exists project_employees (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, employee_id)
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  name text not null,
  phone text not null,
  answers jsonb not null default '{}'::jsonb,
  employee_name text default '',
  employee_phone text default '',
  created_at timestamptz not null default now()
);

create index if not exists project_employees_project_id_idx on project_employees(project_id);
create index if not exists project_employees_employee_id_idx on project_employees(employee_id);
create index if not exists leads_project_id_idx on leads(project_id);
create index if not exists leads_employee_id_idx on leads(employee_id);

-- Locks a browser/phone to the one employee who first logged into it
-- (name + phone), so it can't be re-claimed from another device without
-- an admin unlinking it first.
create table if not exists employee_devices (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null unique references employees(id) on delete cascade,
  device_token text not null unique,
  created_at timestamptz not null default now()
);

-- One row per employee per day. GPS check-in is idempotent per day —
-- the unique constraint is what makes "once a day" hold.
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  attendance_date date not null,
  checked_in_at timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null,
  unique (employee_id, attendance_date)
);

create index if not exists attendance_employee_id_idx on attendance(employee_id);
create index if not exists attendance_date_idx on attendance(attendance_date);

-- Row Level Security stays enabled with no public policies.
-- The app never talks to Supabase from the browser — every read/write
-- goes through Next.js API routes using the service role key, which
-- bypasses RLS. This keeps the database safe even without auth.
alter table projects enable row level security;
alter table employees enable row level security;
alter table project_employees enable row level security;
alter table leads enable row level security;
alter table employee_devices enable row level security;
alter table attendance enable row level security;
