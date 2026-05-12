'use client'

import { useState, useEffect, useCallback } from 'react'

type Reservation = {
  id: string
  room_id: string
  start_date: string
  end_date: string
  source: string
  status: string
  guest_name: string | null
  guest_email: string | null
  total_amount: number | null
  hold_until: string | null
  notes: string | null
  created_at: string
  rooms?: { name: string }
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending_payment: 'bg-yellow-100 text-yellow-800',
  temporary_hold: 'bg-orange-100 text-orange-800',
  booking_com: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  blocked: 'bg-gray-100 text-gray-800',
}

const SOURCE_ICONS: Record<string, string> = {
  website: '🌐',
  booking: '🏨',
  admin: '👤',
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    const url = filter === 'all'
      ? '/api/admin/reservations?limit=100'
      : `/api/admin/reservations?status=${filter}&limit=100`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${password}` },
    })
    const data = await res.json()
    if (res.ok) {
      setReservations(data.reservations || [])
    } else {
      setMessage('❌ Error fetching reservations')
    }
    setLoading(false)
  }, [filter, password])

  useEffect(() => {
    if (authed) fetchReservations()
  }, [authed, filter, fetchReservations])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password.trim()) {
      setAuthed(true)
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch('/api/admin/reservations', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({ id, status }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(`✅ Updated to "${status}"`)
      fetchReservations()
    } else {
      setMessage(`❌ ${data.error}`)
    }
    setTimeout(() => setMessage(''), 3000)
  }

  async function syncBooking() {
    setSyncing(true)
    setMessage('🔄 Syncing Booking.com...')
    const res = await fetch('/api/admin/sync-booking', {
      method: 'POST',
      headers: { Authorization: `Bearer ${password}` },
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(`✅ Synced ${data.synced_rooms} rooms in ${data.duration_ms}ms`)
      fetchReservations()
    } else {
      setMessage(`❌ Sync failed: ${data.error}`)
    }
    setSyncing(false)
    setTimeout(() => setMessage(''), 5000)
  }

  const counts = {
    all: reservations.length,
    pending_payment: reservations.filter(r => r.status === 'pending_payment').length,
    temporary_hold: reservations.filter(r => r.status === 'temporary_hold').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    booking_com: reservations.filter(r => r.status === 'booking_com').length,
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🌴</div>
            <h1 className="text-2xl font-bold text-gray-800">Sunshine Caribe</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg mb-4 focus:outline-none focus:border-green-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white font-bold py-3 rounded-xl text-lg hover:bg-green-600 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌴</span>
          <div>
            <h1 className="font-bold text-xl leading-tight">Sunshine Caribe</h1>
            <p className="text-green-200 text-xs">Panel de Reservaciones</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{message}</span>
          )}
          <button
            onClick={syncBooking}
            disabled={syncing}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {syncing ? '🔄 Sincronizando...' : '🔄 Sync Booking.com'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { key: 'all', label: 'Total', color: 'bg-gray-700', emoji: '📋' },
            { key: 'pending_payment', label: 'Pendiente Pago', color: 'bg-yellow-600', emoji: '💳' },
            { key: 'temporary_hold', label: 'En Espera', color: 'bg-orange-600', emoji: '⏳' },
            { key: 'confirmed', label: 'Confirmadas', color: 'bg-green-700', emoji: '✅' },
            { key: 'booking_com', label: 'Booking.com', color: 'bg-blue-700', emoji: '🏨' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`${stat.color} text-white rounded-xl p-4 text-left transition hover:opacity-80 ${filter === stat.key ? 'ring-4 ring-white/50 scale-105' : ''}`}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-2xl font-bold">{counts[stat.key as keyof typeof counts] ?? 0}</div>
              <div className="text-xs opacity-80">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Reservations Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-lg">Cargando reservaciones...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏖️</div>
            <p className="text-lg">No hay reservaciones para mostrar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left: guest info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900">{r.guest_name || 'Sin nombre'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {SOURCE_ICONS[r.source]} {r.source}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      📧 {r.guest_email || '—'} &nbsp;|&nbsp;
                      🛏️ {r.rooms?.name || r.room_id}
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      📅 {r.start_date} → {r.end_date}
                      {r.total_amount && <span className="ml-3 text-green-700 font-bold">${r.total_amount} USD</span>}
                    </div>
                    {r.hold_until && r.status === 'temporary_hold' && (
                      <div className="text-xs text-orange-600 mt-1">
                        ⏳ Expira: {new Date(r.hold_until).toLocaleString('es-CR')}
                      </div>
                    )}
                    {r.notes && (
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-md">📝 {r.notes}</div>
                    )}
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {(r.status === 'pending_payment' || r.status === 'temporary_hold') && (
                      <button
                        onClick={() => updateStatus(r.id, 'confirmed')}
                        className="bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-green-500 transition"
                      >
                        ✅ Confirmar Pago
                      </button>
                    )}
                    {r.status !== 'cancelled' && r.status !== 'booking_com' && (
                      <button
                        onClick={() => updateStatus(r.id, 'cancelled')}
                        className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-red-200 transition"
                      >
                        ✕ Cancelar
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(r.id, 'blocked')}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                      >
                        🔒 Bloquear
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-300 mt-2">
                  ID: {r.id.substring(0, 8)}... · Creado: {new Date(r.created_at).toLocaleString('es-CR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
