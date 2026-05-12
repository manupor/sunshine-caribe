export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { syncAllBookingIcalFeeds } from '@/lib/ical-sync'

/**
 * POST /api/admin/sync-booking
 * Manually trigger Booking.com iCal sync.
 * Also called by cron job every 5-10 minutes.
 * 
 * Cron usage (Vercel): set Authorization: Bearer CRON_SECRET
 * Manual admin usage: set Authorization: Bearer ADMIN_SECRET
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const validTokens = [
    `Bearer ${process.env.ADMIN_SECRET}`,
    `Bearer ${process.env.CRON_SECRET}`,
  ]

  if (!validTokens.includes(auth ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('📅 Starting Booking.com iCal sync...')
  const startTime = Date.now()

  const result = await syncAllBookingIcalFeeds()

  const duration = Date.now() - startTime
  console.log(`✅ Sync complete in ${duration}ms: ${result.synced} rooms synced`)

  return NextResponse.json({
    success: true,
    synced_rooms: result.synced,
    errors: result.errors,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
  })
}
