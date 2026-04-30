# Sunshine Caribe — Configuración del Sistema de Reservas

## Arquitectura

```
Visitante → Formulario → Google Apps Script → Google Calendar
                                           → Email al hotel
                                           → Email al cliente
Flatpickr  ← Google Calendar API ← Fechas ocupadas (deshabilita en picker)
```

---

## Paso 1: Crear un Google Calendar para las reservas

1. Ve a [calendar.google.com](https://calendar.google.com)
2. En el panel izquierdo, haz click en **"+"** junto a "Otros calendarios"
3. Selecciona **"Crear calendario"**
4. Nómbralo: `Reservas Sunshine Caribe`
5. Una vez creado, haz click en los 3 puntos del calendario → **"Configuración y uso compartido"**
6. Baja a **"Compartir con personas o grupos"** → activa **"Poner a disposición del público"** (solo lectura)
7. Baja a **"Integrar el calendario"** → copia el **ID del calendario** (parece: `abc123@group.calendar.google.com`)

---

## Paso 2: Crear una API Key de Google Cloud (para leer el calendario)

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto nuevo o usa uno existente
3. Ve a **"APIs y servicios"** → **"Habilitar APIs"** → busca y habilita **"Google Calendar API"**
4. Ve a **"APIs y servicios"** → **"Credenciales"** → **"Crear credenciales"** → **"Clave de API"**
5. Copia la API Key generada
6. (Opcional pero recomendado) Haz click en "Editar API key" → en "Restricciones de aplicación" selecciona **"Sitios web HTTP"** y agrega tu dominio

---

## Paso 3: Crear el Google Apps Script (para crear eventos)

1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto → nómbralo `Sunshine Caribe Booking`
3. Borra el contenido por defecto y pega el contenido completo de **`booking.gs`**
4. En `booking.gs`, cambia:
   - `CALENDAR_ID` → el ID copiado en el Paso 1
   - `HOTEL_EMAIL` → tu correo de notificaciones (ej: `reservaciones@sunshinecaribe.com`)
5. Guarda el proyecto (Ctrl+S)
6. Click en **"Implementar"** → **"Nueva implementación"**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
7. Click en **"Implementar"** → copia la **URL de la aplicación web**

---

## Paso 4: Configurar index.html

Abre `index.html` y busca el bloque `SC_CONFIG` (línea ~596):

```javascript
var SC_CONFIG = {
    GOOGLE_API_KEY:  'TU_API_KEY_AQUI',      // ← Pega la API Key del Paso 2
    CALENDAR_ID:     'TU_CALENDAR_ID_AQUI',   // ← Pega el Calendar ID del Paso 1
    APPS_SCRIPT_URL: 'TU_APPS_SCRIPT_URL_AQUI', // ← Pega la URL del Paso 3
    WHATSAPP_FALLBACK: 'https://wa.me/50688932987'
};
```

---

## Cómo funciona el sistema

### Cuando alguien llena el formulario:
1. Selecciona fechas en el calendario (las fechas ocupadas aparecen deshabilitadas en gris)
2. Llena nombre, email y tipo de habitación
3. Al hacer click en "CONSULTAR DISPONIBILIDAD":
   - Se crea un evento en Google Calendar con los datos de la reserva
   - El hotel recibe un email con los detalles
   - El cliente recibe un email de confirmación

### Para deshabilitar fechas manualmente:
- Simplemente crea un evento en tu Google Calendar `Reservas Sunshine Caribe`
- La próxima vez que alguien abra el formulario, esas fechas aparecerán deshabilitadas automáticamente

### Modo fallback (sin configurar):
- Si `APPS_SCRIPT_URL` no está configurado, el botón abre WhatsApp con los datos pre-llenados

---

## Archivos modificados
- `index.html` — formulario actualizado + integración Flatpickr + Google Calendar
- `booking.gs` — código del Google Apps Script (copiar en script.google.com)
- `booking-setup.md` — estas instrucciones
