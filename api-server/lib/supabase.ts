import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
}

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Public client (for read operations)
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// Admin client (bypasses RLS - for server-side only)
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabaseAdmin
}

// Lazy exports for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabase() as Record<string | symbol, unknown>)[prop],
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabaseAdmin() as Record<string | symbol, unknown>)[prop],
})

void getSupabaseUrl

export type Room = {
  id: string
  booking_room_id: string
  name: string
  capacity: number
  price_per_night: number
  booking_ical_url: string | null
  website_ical_url: string | null
  active: boolean
  created_at: string
}

export type Reservation = {
  id: string
  room_id: string
  start_date: string
  end_date: string
  source: 'website' | 'booking' | 'admin'
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'booking_com' | 'blocked' | 'temporary_hold'
  guest_name: string | null
  guest_email: string | null
  total_amount: number | null
  hold_until: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
