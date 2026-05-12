import { NextRequest, NextResponse } from 'next/server'
import ical from 'ical-generator'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/ical/[roomId]
 * Generates an iCal feed for a room.
 * Booking.com will import this URL to block dates from direct reservations.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params

  // Fetch room info
  const { data: room, error: roomError } = await supabaseAdmin
    .from('rooms')
    .select('id, name, booking_room_id')
    .eq('id', roomId)
    .eq('active', true)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  // Fetch all active reservations for this room (website + admin only — not booking_com to avoid loops)
  const { data: reservations, error: resError } = await supabaseAdmin
    .from('reservations')
    .select('id, start_date, end_date, guest_name, status, source')
    .eq('room_id', roomId)
    .in('status', ['confirmed', 'temporary_hold', 'blocked'])
    .not('source', 'eq', 'booking')
    .order('start_date', { ascending: true })

  if (resError) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }

  // Generate iCal
  const calendar = ical({
    name: `Sunshine Caribe - ${room.name}`,
    description: `Availability calendar for ${room.name} at Sunshine Caribe Hotel`,
    prodId: '//Sunshine Caribe//Hotel Reservation//EN',
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/ical/${roomId}`,
  })

  for (const res of reservations ?? []) {
    calendar.createEvent({
      id: res.id,
      start: new Date(res.start_date),
      end: new Date(res.end_date),
      summary: `BLOCKED - ${res.status === 'temporary_hold' ? 'Pending Payment' : 'Reserved'}`,
      description: res.guest_name ? `Guest: ${res.guest_name}` : 'Direct reservation',
    })
  }

  return new NextResponse(calendar.toString(), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="sunshine-caribe-${roomId}.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
