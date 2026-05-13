/**
 * Sunshine Caribe – Reservation Widget
 * Opens a booking modal for direct reservations via bank transfer (BNCR).
 */

const SC_API = 'https://api-server-pied-phi.vercel.app';

const SC_ROOMS = {
  '1': { id: '8440c4e8-c4ba-4409-8cd2-297d39d1db4c', name: 'Habitación #1 – Familiar Doble A/C', capacity: 4, price: 85 },
  '2': { id: '537760f4-026d-4f2d-9644-fb582dd6a897', name: 'Habitación #2 – Familiar Doble A/C', capacity: 4, price: 85 },
  '3': { id: '07971ee9-32ee-4b67-b38f-3e48e5df23bb', name: 'Habitación #3 – Triple A/C',         capacity: 3, price: 70 },
  '4': { id: '0ab0581c-89b0-4985-a8c6-3d71a1bea3f7', name: 'Habitación #4 – Triple A/C',         capacity: 3, price: 70 },
  '5': { id: 'b1c03226-eae9-4f48-b2e3-3fca5f056411', name: 'Habitación #5 – Superior A/C',        capacity: 4, price: 85 },
  '6': { id: '4f08f23e-7ac3-4846-b237-d9d529c735a1', name: 'Habitación #6 – Triple A/C+Vent.',    capacity: 3, price: 55 },
  '7': { id: '6a60bb55-830c-4893-a59f-842ade50761c', name: 'Habitación #7 – Triple A/C+Vent.',    capacity: 3, price: 55 },
  '8': { id: '01ff3bc9-b631-4089-9d9f-e28b21f62621', name: 'Habitación #8 – Familiar A/C+Vent.',  capacity: 4, price: 55 },
  '9': { id: '77da67dc-8dce-4cd7-82a1-6af31d0cd785', name: 'Habitación #9 – Estándar Económica',  capacity: 2, price: 55 },
};

function scCreateModal() {
  if (document.getElementById('sc-res-modal')) return;

  const html = `
<div id="sc-res-modal" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);overflow-y:auto;padding:20px 0;">
  <div style="background:#fff;max-width:520px;margin:40px auto;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);font-family:'Lato',sans-serif;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#006d77,#004d57);padding:28px 32px;position:relative;">
      <h3 style="color:#fff;font-family:'Playfair Display',serif;margin:0 0 4px;font-size:1.5em;">Reservar Habitación</h3>
      <p style="color:rgba(255,255,255,0.75);margin:0;font-size:0.9em;">Reserva directa · Pago por transferencia BNCR</p>
      <button onclick="scCloseModal()" style="position:absolute;top:16px;right:20px;background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.1em;line-height:32px;">✕</button>
    </div>

    <!-- Form step -->
    <div id="sc-res-form-step" style="padding:28px 32px;">

      <div id="sc-res-room-display" style="background:#f0f9f9;border:1px solid #b2dfdb;border-radius:10px;padding:14px 18px;margin-bottom:22px;">
        <div style="font-size:0.75em;color:#006d77;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">HABITACIÓN SELECCIONADA</div>
        <div id="sc-res-room-name" style="font-weight:700;color:#004d57;font-size:1.05em;"></div>
        <div id="sc-res-room-price" style="color:#006d77;font-size:0.9em;margin-top:2px;"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:0.82em;font-weight:700;color:#555;margin-bottom:5px;">CHECK-IN *</label>
          <input type="date" id="sc-checkin" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.95em;box-sizing:border-box;" onchange="scUpdateTotal()">
        </div>
        <div>
          <label style="display:block;font-size:0.82em;font-weight:700;color:#555;margin-bottom:5px;">CHECK-OUT *</label>
          <input type="date" id="sc-checkout" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.95em;box-sizing:border-box;" onchange="scUpdateTotal()">
        </div>
      </div>

      <div id="sc-nights-display" style="display:none;background:#e8f5e9;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:0.9em;color:#2e7d32;">
        <strong id="sc-nights-text"></strong>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:0.82em;font-weight:700;color:#555;margin-bottom:5px;">NOMBRE COMPLETO *</label>
        <input type="text" id="sc-guest-name" placeholder="Tu nombre completo" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.95em;box-sizing:border-box;">
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:0.82em;font-weight:700;color:#555;margin-bottom:5px;">CORREO ELECTRÓNICO *</label>
        <input type="email" id="sc-guest-email" placeholder="tucorreo@email.com" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.95em;box-sizing:border-box;">
      </div>

      <div style="margin-bottom:22px;">
        <label style="display:block;font-size:0.82em;font-weight:700;color:#555;margin-bottom:5px;">NOTAS (opcional)</label>
        <textarea id="sc-notes" rows="2" placeholder="Hora de llegada, necesidades especiales..." style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.95em;box-sizing:border-box;resize:vertical;"></textarea>
      </div>

      <div id="sc-res-error" style="display:none;background:#fff3f3;border:1px solid #ffcdd2;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#c62828;font-size:0.9em;"></div>

      <button id="sc-submit-btn" onclick="scSubmitReservation()" style="width:100%;background:linear-gradient(135deg,#006d77,#004d57);color:#fff;border:none;padding:14px;border-radius:10px;font-size:1.05em;font-weight:700;cursor:pointer;letter-spacing:0.5px;">
        Confirmar Reserva
      </button>

      <p style="text-align:center;color:#999;font-size:0.78em;margin-top:12px;">Al reservar aceptas nuestras condiciones. Se enviará el código de pago a tu correo.</p>
    </div>

    <!-- Success step -->
    <div id="sc-res-success-step" style="display:none;padding:28px 32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:64px;height:64px;background:#e8f5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:2em;">✅</div>
        <h4 style="color:#006d77;font-family:'Playfair Display',serif;font-size:1.4em;margin:0 0 6px;">¡Reserva Registrada!</h4>
        <p style="color:#666;font-size:0.92em;margin:0;">Tu habitación está apartada por <strong>24 horas</strong>. Completa el pago para confirmar.</p>
      </div>

      <div style="background:#f0f9f9;border:2px solid #006d77;border-radius:12px;padding:20px;margin-bottom:20px;">
        <div style="font-size:0.75em;color:#006d77;font-weight:700;letter-spacing:1px;margin-bottom:12px;">CÓDIGO DE REFERENCIA</div>
        <div id="sc-ref-code" style="font-size:2em;font-weight:900;color:#006d77;letter-spacing:4px;text-align:center;padding:10px;background:#fff;border-radius:8px;border:2px dashed #006d77;"></div>
        <p style="font-size:0.82em;color:#e65100;font-weight:700;text-align:center;margin:10px 0 0;">⚠️ Escribe este código en la descripción de la transferencia</p>
      </div>

      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:18px;margin-bottom:20px;">
        <div style="font-size:0.75em;color:#e65100;font-weight:700;letter-spacing:1px;margin-bottom:12px;">DATOS DE TRANSFERENCIA BNCR</div>
        <table style="width:100%;font-size:0.88em;border-collapse:collapse;">
          <tr><td style="color:#666;padding:4px 0;width:40%;">Banco:</td><td style="font-weight:700;color:#333;">Banco Nacional de CR (BNCR)</td></tr>
          <tr><td style="color:#666;padding:4px 0;">Cuenta USD:</td><td style="font-weight:700;color:#333;">100-02-072-000092-8</td></tr>
          <tr><td style="color:#666;padding:4px 0;">Cuenta CRC:</td><td style="font-weight:700;color:#333;">100-01-072-000195-3</td></tr>
          <tr><td style="color:#666;padding:4px 0;">A nombre de:</td><td style="font-weight:700;color:#333;">Inversiones Joseph & Brooks S.A.</td></tr>
          <tr><td style="color:#666;padding:6px 0 0;">Monto:</td><td style="font-weight:900;color:#006d77;font-size:1.1em;padding-top:6px;" id="sc-total-amount"></td></tr>
        </table>
      </div>

      <div id="sc-booking-summary" style="background:#f9f9f9;border-radius:10px;padding:16px;margin-bottom:20px;font-size:0.88em;">
        <div style="font-size:0.75em;color:#006d77;font-weight:700;letter-spacing:1px;margin-bottom:10px;">RESUMEN DE TU RESERVA</div>
        <div id="sc-summary-content"></div>
      </div>

      <p style="background:#e3f2fd;border-radius:8px;padding:12px 14px;font-size:0.82em;color:#1565c0;margin:0 0 20px;">
        📧 Recibirás un correo de confirmación cuando el pago sea verificado.
      </p>

      <div style="display:flex;gap:12px;">
        <button onclick="scCloseModal()" style="flex:1;background:#f5f5f5;color:#555;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:700;">Cerrar</button>
        <a id="sc-whatsapp-btn" href="#" target="_blank" style="flex:1;background:#25d366;color:#fff;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:700;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;">
          <i class="fa fa-whatsapp"></i> Confirmar por WhatsApp
        </a>
      </div>
    </div>

  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('sc-res-modal').addEventListener('click', function(e) {
    if (e.target === this) scCloseModal();
  });
}

function openReservationModal(roomNum) {
  scCreateModal();
  const room = SC_ROOMS[String(roomNum)];
  if (!room) return;

  window._scSelectedRoom = room;

  document.getElementById('sc-res-room-name').textContent = room.name;
  document.getElementById('sc-res-room-price').textContent = '$' + room.price + ' USD por noche';
  document.getElementById('sc-res-form-step').style.display = 'block';
  document.getElementById('sc-res-success-step').style.display = 'none';
  document.getElementById('sc-res-error').style.display = 'none';
  document.getElementById('sc-nights-display').style.display = 'none';
  document.getElementById('sc-guest-name').value = '';
  document.getElementById('sc-guest-email').value = '';
  document.getElementById('sc-notes').value = '';

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  document.getElementById('sc-checkin').min = today.toISOString().split('T')[0];
  document.getElementById('sc-checkout').min = tomorrow.toISOString().split('T')[0];
  document.getElementById('sc-checkin').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('sc-checkout').value = dayAfter.toISOString().split('T')[0];

  document.getElementById('sc-res-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  scUpdateTotal();
}

function scCloseModal() {
  const modal = document.getElementById('sc-res-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function scUpdateTotal() {
  const checkin = document.getElementById('sc-checkin').value;
  const checkout = document.getElementById('sc-checkout').value;
  const room = window._scSelectedRoom;
  if (!checkin || !checkout || !room) return;

  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  const nights = Math.round((d2 - d1) / 86400000);

  const display = document.getElementById('sc-nights-display');
  if (nights > 0) {
    const total = nights * room.price;
    document.getElementById('sc-nights-text').textContent =
      nights + (nights === 1 ? ' noche' : ' noches') + ' · Total estimado: $' + total + ' USD';
    display.style.display = 'block';
  } else {
    display.style.display = 'none';
  }
}

async function scSubmitReservation() {
  const room = window._scSelectedRoom;
  const checkin = document.getElementById('sc-checkin').value;
  const checkout = document.getElementById('sc-checkout').value;
  const guestName = document.getElementById('sc-guest-name').value.trim();
  const guestEmail = document.getElementById('sc-guest-email').value.trim();
  const notes = document.getElementById('sc-notes').value.trim();
  const errorBox = document.getElementById('sc-res-error');

  errorBox.style.display = 'none';

  if (!checkin || !checkout || !guestName || !guestEmail) {
    errorBox.textContent = 'Por favor completa todos los campos requeridos.';
    errorBox.style.display = 'block';
    return;
  }

  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  if (d2 <= d1) {
    errorBox.textContent = 'La fecha de check-out debe ser después del check-in.';
    errorBox.style.display = 'block';
    return;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(guestEmail)) {
    errorBox.textContent = 'Por favor ingresa un correo electrónico válido.';
    errorBox.style.display = 'block';
    return;
  }

  const btn = document.getElementById('sc-submit-btn');
  btn.textContent = 'Procesando...';
  btn.disabled = true;

  try {
    const res = await fetch(SC_API + '/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: room.id,
        check_in: checkin,
        check_out: checkout,
        guest_name: guestName,
        guest_email: guestEmail,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al procesar la reserva');
    }

    const nights = Math.round((d2 - d1) / 86400000);
    const formattedCheckin = d1.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });
    const formattedCheckout = d2.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });

    document.getElementById('sc-ref-code').textContent = data.reference_code;
    document.getElementById('sc-total-amount').textContent = '$' + data.total_amount + ' USD';

    document.getElementById('sc-summary-content').innerHTML = `
      <div style="display:grid;gap:6px;">
        <div style="display:flex;justify-content:space-between;"><span style="color:#666;">Habitación:</span><span style="font-weight:700;">${room.name}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#666;">Check-in:</span><span style="font-weight:700;">${formattedCheckin}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#666;">Check-out:</span><span style="font-weight:700;">${formattedCheckout}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#666;">Noches:</span><span style="font-weight:700;">${nights}</span></div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:8px;margin-top:4px;"><span style="color:#666;">Huésped:</span><span style="font-weight:700;">${guestName}</span></div>
      </div>
    `;

    const waMsg = encodeURIComponent(
      `Hola! Hice una reserva en el sitio web con código *${data.reference_code}*.\n` +
      `Habitación: ${room.name}\n` +
      `Check-in: ${formattedCheckin}\n` +
      `Check-out: ${formattedCheckout}\n` +
      `Total: $${data.total_amount} USD\n\n` +
      `Voy a hacer la transferencia al BNCR. ¿Me confirman la reserva?`
    );
    document.getElementById('sc-whatsapp-btn').href = `https://wa.me/50688932987?text=${waMsg}`;

    document.getElementById('sc-res-form-step').style.display = 'none';
    document.getElementById('sc-res-success-step').style.display = 'block';

  } catch (err) {
    errorBox.textContent = err.message || 'Error al conectar con el servidor. Inténtalo de nuevo.';
    errorBox.style.display = 'block';
  } finally {
    btn.textContent = 'Confirmar Reserva';
    btn.disabled = false;
  }
}
