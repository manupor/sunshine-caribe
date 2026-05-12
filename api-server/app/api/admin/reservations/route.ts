export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${process.env.ADMIN_SECRET}`
}

/**
 * GET /api/admin/reservations
 * List all reservations for the admin dashboard.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const roomId = searchParams.get('room_id')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  let query = supabaseAdmin
    .from('reservations')
    .select(`
      *,
      rooms (id, name, capacity, price_per_night)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (roomId) query = query.eq('room_id', roomId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ reservations: data, total: data?.length ?? 0 })
}

/**
 * PATCH /api/admin/reservations
 * Update a reservation status (confirm payment, cancel, etc.)
 */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, status, notes } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }

  const validStatuses = ['pending_payment', 'confirmed', 'cancelled', 'blocked']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Use: ${validStatuses.join(', ')}` }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (notes) updateData.notes = notes
  if (status === 'confirmed') updateData.hold_until = null

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, reservation: data })
}
