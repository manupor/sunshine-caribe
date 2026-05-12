import { supabaseAdmin } from './supabase'

/**
 * Core availability engine — prevents overbooking.
 * Checks ALL active reservation sources before confirming any booking.
 */
export async function isRoomAvailable(
  roomId: string,
  checkIn: string,  // YYYY-MM-DD
  checkOut: string  // YYYY-MM-DD
): Promise<{ available: boolean; reason?: string }> {

  // Expire stale temporary holds first
  await supabaseAdmin
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('room_id', roomId)
    .eq('status', 'temporary_hold')
    .lt('hold_until', new Date().toISOString())

  // Check for any overlapping active reservations
  const { data: conflicts, error } = await supabaseAdmin
    .from('reservations')
    .select('id, status, source, start_date, end_date, guest_name')
    .eq('room_id', roomId)
    .not('status', 'in', '("cancelled")')
    .or(
      `and(start_date.lt.${checkOut},end_date.gt.${checkIn})`
    )

  if (error) {
    console.error('Availability check error:', error)
    return { available: false, reason: 'Database error' }
  }

  if (conflicts && conflicts.length > 0) {
    const conflict = conflicts[0]
    return {
      available: false,
      reason: `Room blocked: ${conflict.status} (${conflict.source}) ${conflict.start_date} → ${conflict.end_date}`,
    }
  }

  return { available: true }
}

/**
 * Get full availability map for a room across a date range.
 * Returns array of blocked date ranges.
 */
export async function getRoomBlockedDates(
  roomId: string,
  fromDate: string,
  toDate: string
): Promise<Array<{ start: string; end: string; source: string; status: string }>> {

  // Expire stale holds first
  await supabaseAdmin
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('room_id', roomId)
    .eq('status', 'temporary_hold')
    .lt('hold_until', new Date().toISOString())

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('start_date, end_date, source, status')
    .eq('room_id', roomId)
    .not('status', 'in', '("cancelled")')
    .gte('end_date', fromDate)
    .lte('start_date', toDate)
    .order('start_date', { ascending: true })

  if (error || !data) return []

  return data.map(r => ({
    start: r.start_date,
    end: r.end_date,
    source: r.source,
    status: r.status,
  }))
}

/**
 * Get availability for ALL rooms for a given date range.
 * Used by the booking widget on the website.
 */
export async function getAllRoomsAvailability(
  checkIn: string,
  checkOut: string
): Promise<Array<{ roomId: string; available: boolean }>> {

  const { data: rooms } = await supabaseAdmin
    .from('rooms')
    .select('id')
    .eq('active', true)

  if (!rooms) return []

  const results = await Promise.all(
    rooms.map(async (room) => {
      const result = await isRoomAvailable(room.id, checkIn, checkOut)
      return { roomId: room.id, available: result.available }
    })
  )

  return results
}
