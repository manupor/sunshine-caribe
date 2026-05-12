export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/ical/[roomId]
 * Generates an iCal feed for a room.
 * Booking.com will import this URL to block dates from direct reservations.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params

    const db = getSupabaseAdmin()

    const { data: room, error: roomError } = await db
      .from('rooms')
      .select('id, name, booking_room_id')
      .eq('id', roomId)
      .maybeSingle()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const { data: reservations, error: resError } = await db
      .from('reservations')
      .select('id, start_date, end_date, guest_name, status, source')
      .eq('room_id', roomId)
      .in('status', ['confirmed', 'temporary_hold', 'blocked'])
      .not('source', 'eq', 'booking')
      .order('start_date', { ascending: true })

    if (resError) {
      console.error('Reservations fetch error:', resError)
      return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sunshine Caribe//Hotel Reservation//EN',
      `X-WR-CALNAME:Sunshine Caribe - ${room.name}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    for (const res of reservations ?? []) {
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${res.id}@sunshinecaribe.com`)
      lines.push(`DTSTAMP:${now}`)
      lines.push(`DTSTART;VALUE=DATE:${res.start_date.replace(/-/g, '')}`)
      lines.push(`DTEND;VALUE=DATE:${res.end_date.replace(/-/g, '')}`)
      lines.push('SUMMARY:BLOCKED')
      lines.push(`DESCRIPTION:${res.guest_name ? `Guest: ${res.guest_name}` : 'Direct reservation'}`)
      lines.push('END:VEVENT')
    }

    lines.push('END:VCALENDAR')

    const icalContent = lines.join('\r\n')

    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="sunshine-caribe-${roomId}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err) {
    console.error('iCal route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
