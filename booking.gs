/**
 * SUNSHINE CARIBE — Google Apps Script
 * ======================================
 * Este script actúa como backend para el formulario de reserva.
 * Recibe los datos del formulario y crea un evento en Google Calendar.
 *
 * INSTRUCCIONES DE DEPLOY:
 * 1. Ve a https://script.google.com y crea un nuevo proyecto
 * 2. Pega este código completo
 * 3. Cambia CALENDAR_ID por tu ID de calendario
 * 4. Cambia HOTEL_EMAIL por tu correo de notificaciones
 * 5. Click en "Implementar" → "Nueva implementación"
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier persona
 * 6. Copia la URL generada y pégala en SC_CONFIG.APPS_SCRIPT_URL en index.html
 */

var CALENDAR_ID = 'TU_CALENDAR_ID_AQUI'; // ej: abc123xyz@group.calendar.google.com
var HOTEL_EMAIL = 'reservaciones@sunshinecaribe.com';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var nombre    = data.nombre    || '';
    var email     = data.email     || '';
    var habitacion = data.habitacion || '';
    var llegada   = new Date(data.llegada + 'T14:00:00');
    var salida    = new Date(data.salida  + 'T11:00:00');

    // Crear evento en Google Calendar
    var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    var title = '🏨 Reserva: ' + nombre + ' — ' + habitacion;
    var desc = 'Nombre: ' + nombre
             + '\nEmail: ' + email
             + '\nHabitación: ' + habitacion
             + '\nLlegada: ' + data.llegada
             + '\nSalida: '  + data.salida;

    calendar.createEvent(title, llegada, salida, {
      description: desc,
      sendInvites: false
    });

    // Enviar email de notificación al hotel
    MailApp.sendEmail({
      to: HOTEL_EMAIL,
      subject: '📩 Nueva solicitud de reserva — ' + nombre,
      body: desc + '\n\nEnviado desde sunshinecaribe.com'
    });

    // Enviar confirmación al cliente
    MailApp.sendEmail({
      to: email,
      subject: '✅ Confirmamos tu solicitud — Sunshine Caribe',
      body: 'Hola ' + nombre + ',\n\n'
          + 'Recibimos tu solicitud de reserva:\n\n'
          + '  Habitación: ' + habitacion + '\n'
          + '  Llegada:    ' + data.llegada + '\n'
          + '  Salida:     ' + data.salida  + '\n\n'
          + 'Nos comunicaremos contigo pronto para confirmar disponibilidad y darte los datos de pago.\n\n'
          + 'Hotel Sunshine Caribe\n'
          + 'Puerto Viejo de Talamanca, Costa Rica\n'
          + 'WhatsApp: https://wa.link/ji8wue\n'
          + 'Email: ' + HOTEL_EMAIL
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Necesario para CORS (llamadas desde el navegador)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'Sunshine Caribe Booking' }))
    .setMimeType(ContentService.MimeType.JSON);
}
