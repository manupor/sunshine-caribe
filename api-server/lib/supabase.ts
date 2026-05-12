import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client (for read operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (bypasses RLS - for server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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
