import { timeToStartMinHourOnly } from "../utils/time";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function createBooking2(input: {
  service_id: string;
  booking_date: string; // "YYYY-MM-DD"
  time_local: string;   // "09:00"
  start_min?: number;   // ✅ nuevo (opcional)
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}) {
  const payload = {
    service_id: input.service_id,
    booking_date: input.booking_date,
    start_min: typeof input.start_min === "number"
      ? input.start_min
      : timeToStartMinHourOnly(input.time_local),
    customer: {
      full_name: input.clientName,
      email: input.clientEmail || undefined,
      phone: input.clientPhone || undefined,
    },
    notes: "Reserva desde web",
  };

  const res = await fetch(`${API_BASE_URL}/bookings2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.log("BOOKING2 ERROR RESPONSE:", data); // 👈 agrega esto
    throw new Error(data?.error || data?.message || JSON.stringify(data) || "Error al reservar");
  }

  return data;
}
