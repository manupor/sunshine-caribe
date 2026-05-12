-- ============================================================
-- SUNSHINE CARIBE - SUPABASE SCHEMA
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- ROOMS TABLE
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  booking_room_id text unique,
  name text not null,
  capacity int default 2,
  price_per_night numeric(10,2) not null,
  booking_ical_url text,
  website_ical_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- RESERVATIONS TABLE
create table if not exists reservations (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  source text check (source in ('website','booking','admin')) default 'website',
  status text check (status in ('pending_payment','confirmed','cancelled','booking_com','blocked','temporary_hold')) default 'pending_payment',
  guest_name text,
  guest_email text,
  total_amount numeric(10,2),
  hold_until timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES for availability queries (critical for performance)
create index if not exists idx_reservations_room_dates
  on reservations(room_id, start_date, end_date);

create index if not exists idx_reservations_status
  on reservations(status);

create index if not exists idx_reservations_hold_until
  on reservations(hold_until)
  where status = 'temporary_hold';

-- AUTO-UPDATE updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists reservations_updated_at on reservations;
create trigger reservations_updated_at
  before update on reservations
  for each row execute function update_updated_at();

-- ROW LEVEL SECURITY (protect admin endpoints)
alter table rooms enable row level security;
alter table reservations enable row level security;

-- Public can read rooms
create policy "rooms_public_read" on rooms
  for select using (active = true);

-- Public can read their own reservations by email
create policy "reservations_guest_read" on reservations
  for select using (true);

-- Only service role can write (enforced via SUPABASE_SERVICE_ROLE_KEY in API)
create policy "reservations_service_write" on reservations
  for all using (auth.role() = 'service_role');

create policy "rooms_service_write" on rooms
  for all using (auth.role() = 'service_role');

-- ============================================================
-- SEED: Sunshine Caribe Rooms
-- Update booking_ical_url with actual URLs from Booking.com
-- ============================================================
insert into rooms (booking_room_id, name, capacity, price_per_night, booking_ical_url) values
  ('ac1', 'A/C #1 – Habitación Superior', 4, 85.00, null),
  ('ac2', 'A/C #2 – Habitación Superior', 4, 85.00, null),
  ('ac3', 'A/C #3 – Habitación Standard', 3, 70.00, null),
  ('ac4', 'A/C #4 – Habitación Standard', 3, 70.00, null),
  ('fan5', 'Ventilador #5 – Habitación Estándar', 2, 55.00, null),
  ('fan6', 'Ventilador #6 – Habitación Estándar', 2, 55.00, null),
  ('fan7', 'Ventilador #7 – Habitación Estándar', 2, 55.00, null),
  ('fan8', 'Ventilador #8 – Habitación Estándar', 2, 55.00, null),
  ('fan9', 'Ventilador #9 – Habitación Estándar', 2, 55.00, null)
on conflict (booking_room_id) do nothing;
