export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/reservations/confirm
 * Called by n8n when BNCR transfer email is received.
 * 
 * Body: { "reference_code": "SC-A3X9" }
 * Auth: Bearer ADMIN_SECRET (set in n8n HTTP Request header)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { reference_code, amount_received, notes } = body

    if (!reference_code) {
      return NextResponse.json({ error: 'reference_code is required' }, { status: 400 })
    }

    const code = reference_code.toString().trim().toUpperCase()

    // Find reservation by reference code
    const { data: reservation, error: findError } = await supabaseAdmin
      .from('reservations')
      .select('*, rooms(name)')
      .eq('reference_code', code)
      .single()

    if (findError || !reservation) {
      return NextResponse.json(
        { error: `Reservation with code ${code} not found` },
        { status: 404 }
      )
    }

    if (reservation.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        message: 'Reservation already confirmed',
        reservation_id: reservation.id,
      })
    }

    if (reservation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Reservation was cancelled' },
        { status: 409 }
      )
    }

    // Check if hold expired
    if (reservation.hold_until && new Date(reservation.hold_until) < new Date()) {
      return NextResponse.json(
        { error: 'Reservation hold has expired. Guest must re-book.' },
        { status: 410 }
      )
    }

    // Confirm the reservation
    const { error: updateError } = await supabaseAdmin
      .from('reservations')
      .update({
        status: 'confirmed',
        notes: notes
          ? `${reservation.notes || ''}\nConfirmado por n8n: ${notes}`
          : reservation.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservation.id)

    if (updateError) {
      console.error('Confirm update error:', updateError)
      return NextResponse.json({ error: 'Failed to confirm reservation' }, { status: 500 })
    }

    console.log(`✅ Reservation ${code} confirmed via n8n automation`)

    return NextResponse.json({
      success: true,
      message: `Reservation ${code} confirmed successfully`,
      reservation_id: reservation.id,
      reference_code: code,
      guest_name: reservation.guest_name,
      guest_email: reservation.guest_email,
      room_name: reservation.rooms?.name,
      check_in: reservation.start_date,
      check_out: reservation.end_date,
      total_amount: reservation.total_amount,
      amount_received: amount_received || null,
    })
  } catch (err) {
    console.error('Confirm reservation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
