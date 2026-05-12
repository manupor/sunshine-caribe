import { NextRequest, NextResponse } from 'next/server'
import { isRoomAvailable, getAllRoomsAvailability, getRoomBlockedDates } from '@/lib/availability'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/availability
 * 
 * Query params:
 *   ?check_in=2026-06-01&check_out=2026-06-05               → all rooms availability
 *   ?room_id=uuid&check_in=2026-06-01&check_out=2026-06-05  → single room check
 *   ?room_id=uuid&from=2026-06-01&to=2026-07-01&blocked=1   → get blocked dates for calendar
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('room_id')
  const checkIn = searchParams.get('check_in')
  const checkOut = searchParams.get('check_out')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const blocked = searchParams.get('blocked')

  try {
    // Return blocked dates for a room's calendar widget
    if (roomId && from && to && blocked) {
      const blockedDates = await getRoomBlockedDates(roomId, from, to)
      return NextResponse.json({ blocked_dates: blockedDates })
    }

    // Check single room availability
    if (roomId && checkIn && checkOut) {
      const result = await isRoomAvailable(roomId, checkIn, checkOut)
      
      // Fetch room pricing if available
      const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('id, name, capacity, price_per_night')
        .eq('id', roomId)
        .single()

      const nights = Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )

      return NextResponse.json({
        available: result.available,
        reason: result.reason,
        room: room ?? null,
        nights,
        total_price: room ? room.price_per_night * nights : null,
      })
    }

    // Check all rooms availability
    if (checkIn && checkOut) {
      const allRooms = await getAllRoomsAvailability(checkIn, checkOut)

      // Fetch room details
      const { data: rooms } = await supabaseAdmin
        .from('rooms')
        .select('id, name, capacity, price_per_night')
        .eq('active', true)

      const nights = Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )

      const result = allRooms.map(r => {
        const roomData = rooms?.find(rm => rm.id === r.roomId)
        return {
          room_id: r.roomId,
          available: r.available,
          name: roomData?.name ?? 'Unknown',
          capacity: roomData?.capacity ?? 0,
          price_per_night: roomData?.price_per_night ?? 0,
          total_price: roomData ? roomData.price_per_night * nights : 0,
          nights,
        }
      })

      return NextResponse.json({
        check_in: checkIn,
        check_out: checkOut,
        nights,
        rooms: result,
      })
    }

    return NextResponse.json(
      { error: 'Missing params: check_in and check_out are required' },
      { status: 400 }
    )
  } catch (err) {
    console.error('Availability error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
