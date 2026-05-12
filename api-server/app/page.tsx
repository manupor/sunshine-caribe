export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900">
      <div className="text-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">🌴 Sunshine Caribe API</h1>
        <p className="text-xl mb-8 opacity-80">Hotel Reservation System — Puerto Viejo, Costa Rica</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <h2 className="font-bold text-lg mb-2">📡 API Endpoints</h2>
            <ul className="text-sm space-y-1 opacity-80 font-mono">
              <li>GET /api/availability</li>
              <li>POST /api/reservations</li>
              <li>GET /api/ical/[roomId]</li>
              <li>PATCH /api/admin/reservations</li>
              <li>POST /api/admin/sync-booking</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <h2 className="font-bold text-lg mb-2">🔑 Admin</h2>
            <p className="text-sm opacity-80 mb-2">Dashboard for managing reservations</p>
            <a
              href="/admin"
              className="inline-block bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition"
            >
              Go to Admin Dashboard →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
