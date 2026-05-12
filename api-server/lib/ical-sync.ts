import ical from 'node-ical'
import { supabaseAdmin, Room } from './supabase'

/**
 * Sync all Booking.com iCal feeds into the reservations table.
 * Run this every 5-10 minutes via cron.
 */
export async function syncAllBookingIcalFeeds(): Promise<{
  synced: number
  errors: string[]
}> {
  const { data: rooms, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('active', true)
    .not('booking_ical_url', 'is', null)

  if (error || !rooms) return { synced: 0, errors: ['Failed to fetch rooms'] }

  let synced = 0
  const errors: string[] = []

  for (const room of rooms as Room[]) {
    if (!room.booking_ical_url) continue
    try {
      await syncRoomIcalFeed(room)
      synced++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Room ${room.name}: ${msg}`)
      console.error(`iCal sync error for ${room.name}:`, msg)
    }
  }

  return { synced, errors }
}

/**
 * Sync a single room's Booking.com iCal feed.
 */
async function syncRoomIcalFeed(room: Room): Promise<void> {
  const events = await ical.async.fromURL(room.booking_ical_url!)

  for (const key in events) {
    const event = events[key]
    if (event.type !== 'VEVENT') continue

    const start = event.start
    const end = event.end
    if (!start || !end) continue

    const startDate = formatDate(new Date(start))
    const endDate = formatDate(new Date(end))
    const uid = event.uid || key
    const summary = event.summary || 'Booking.com Reservation'

    // Upsert by external UID to prevent duplicates
    const { error } = await supabaseAdmin
      .from('reservations')
      .upsert(
        {
          room_id: room.id,
          start_date: startDate,
          end_date: endDate,
          source: 'booking',
          status: 'booking_com',
          notes: `Booking.com UID: ${uid} | ${summary}`,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'room_id,start_date,end_date,source',
          ignoreDuplicates: false,
        }
      )

    if (error) {
      console.error(`Upsert error for room ${room.name}:`, error)
    }
  }

  console.log(`✅ Synced iCal for ${room.name}`)
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
