export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isRoomAvailable } from '@/lib/availability'
import { supabaseAdmin } from '@/lib/supabase'

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SC-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * POST /api/reservations
 * Creates a new reservation with a temporary hold (bank transfer workflow).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { room_id, check_in, check_out, guest_name, guest_email, notes } = body

    if (!room_id || !check_in || !check_out || !guest_name || !guest_email) {
      return NextResponse.json(
        { error: 'Missing required fields: room_id, check_in, check_out, guest_name, guest_email' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'check_out must be after check_in' }, { status: 400 })
    }
    if (checkInDate < new Date()) {
      return NextResponse.json({ error: 'check_in cannot be in the past' }, { status: 400 })
    }

    // AVAILABILITY CHECK — core anti-overbooking
    const availability = await isRoomAvailable(room_id, check_in, check_out)
    if (!availability.available) {
      return NextResponse.json(
        { error: 'Room not available for selected dates', detail: availability.reason },
        { status: 409 }
      )
    }

    // Fetch room for pricing
    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('id, name, price_per_night')
      .eq('id', room_id)
      .eq('active', true)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const totalAmount = room.price_per_night * nights

    // Temporary hold: 48 hours to complete bank transfer
    const holdUntil = new Date()
    holdUntil.setHours(holdUntil.getHours() + 48)

    // Generate unique reference code for BNCR transfer
    const referenceCode = generateReferenceCode()

    // Create reservation as pending_payment
    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .insert({
        room_id,
        start_date: check_in,
        end_date: check_out,
        source: 'website',
        status: 'pending_payment',
        guest_name,
        guest_email,
        total_amount: totalAmount,
        hold_until: holdUntil.toISOString(),
        reference_code: referenceCode,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Reservation insert error:', error)
      return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reservation_id: reservation.id,
      reference_code: referenceCode,
      status: 'pending_payment',
      room_name: room.name,
      check_in,
      check_out,
      nights,
      total_amount: totalAmount,
      hold_until: holdUntil.toISOString(),
      message: `Habitación reservada por 48 horas. Realice su transferencia de $${totalAmount} USD para confirmar.`,
      payment_instructions: {
        bank: 'Banco Nacional de Costa Rica (BNCR)',
        account_usd: '100-02-072-000092-8',
        account_crc: '100-01-072-000195-3',
        account_name: 'Inversiones Joseph & Brooks S.A.',
        amount_usd: totalAmount,
        description: `OBLIGATORIO escribir en descripción: ${referenceCode}`,
        reference_code: referenceCode,
        deadline: holdUntil.toLocaleDateString('es-CR'),
        warning: 'Sin el código en la descripción no se puede confirmar automáticamente su reserva.',
      },
    })
  } catch (err) {
    console.error('Reservations POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/reservations?email=guest@email.com
 * Allows guests to check their reservation status.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const id = searchParams.get('id')

  if (!email && !id) {
    return NextResponse.json({ error: 'Provide email or reservation id' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('reservations')
    .select('id, room_id, start_date, end_date, status, total_amount, hold_until, created_at, rooms(name)')

  if (id) query = query.eq('id', id)
  if (email) query = query.eq('guest_email', email)

  const { data, error } = await query.order('created_at', { ascending: false }).limit(10)

  if (error) return NextResponse.json({ error: 'Query failed' }, { status: 500 })

  return NextResponse.json({ reservations: data })
}
