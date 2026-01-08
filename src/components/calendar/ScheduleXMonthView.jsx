import React, { useEffect, useMemo, useState } from "react";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewMonthGrid, createViewWeek, createViewDay } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { Link } from "react-router-dom";

import "temporal-polyfill/global";
import { Temporal } from "temporal-polyfill";
import "@schedule-x/theme-default/dist/index.css";

// helpers
const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function monthRange(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth(); // 0-11
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1); // exclusivo
  return { startISO: toISODate(start), endISO: toISODate(end) };
}

// "YYYY-MM-DD" + "HH:mm" -> ZonedDateTime (Honduras)
function toZdt(dateISO, timeHHmm, tz = "America/Tegucigalpa") {
  return Temporal.ZonedDateTime.from(`${dateISO}T${timeHHmm}:00-06:00[${tz}]`);
}

function EventModal({ open, onClose, event }) {
  if (!open || !event) return null;

  const lines = String(event.description || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border">
          <div className="p-4 border-b flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                ID: <span className="font-mono">{event.id}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-2">
            {lines.length ? (
              <div className="space-y-2">
                {lines.map((l, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    {l}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Sin detalles.</p>
            )}
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleXMonthView() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // ✅ ESTOS HOOKS VAN AQUÍ (NO afuera)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [count, setCount] = useState(0);

  const eventsService = useMemo(() => createEventsServicePlugin(), []);

  // ✅ Mejor: usar callbacks onEventClick (más compatible)
  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    defaultView: "monthGrid",
    events: [], // ✅ evita "events.forEach is not a function"
    plugins: [eventsService],
    callbacks: {
      onEventClick: (evt) => {
        setSelectedEvent(evt);
        setIsModalOpen(true);
      },
    },
  });

  const { startISO, endISO } = useMemo(() => monthRange(cursorDate), [cursorDate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(
          `${API_BASE_URL}/bookings2/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "No pude cargar citas del rango");

        const bookings = Array.isArray(data.bookings) ? data.bookings : [];
        setCount(bookings.length);

        const events = bookings.map((b) => {
          const start = toZdt(b.dateISO, b.time_local);
          const end = start.add({ minutes: b.duration_min });

          return {
            id: b.id,
            title: `${b.time_local} • ${b.service_name} • ${b.customer_name}`,
            start,
            end,
            description: `Cliente: ${b.customer_name}
Servicio: ${b.service_name}
Hora: ${b.time_local} (${b.duration_min} min)
Tel: ${b.customer_phone || "N/A"}
Email: ${b.customer_email || "N/A"}
Técnico: ${b.staff_name || "N/A"}`,
          };
        });

        eventsService.set(events);
      } catch (e) {
        setErr(e?.message || String(e));
        setCount(0);
        eventsService.set([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_BASE_URL, startISO, endISO, eventsService]);

  const monthLabel = cursorDate.toLocaleDateString("es-HN", { month: "long", year: "numeric" });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
          >
            Volver a reservas
          </Link>

          <button
            onClick={() => setCursorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
            title="Mes anterior"
          >
            ←
          </button>

          <button
            onClick={() => setCursorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
            title="Mes siguiente"
          >
            →
          </button>

          <div className="ml-1">
            <div className="text-lg font-bold capitalize text-gray-900">{monthLabel}</div>
            <div className="text-xs text-gray-500">
              Rango: {startISO} → {endISO} (exclusivo) • {count} cita(s)
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {loading ? "Cargando citas..." : err ? <span className="text-red-600">{err}</span> : " "}
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm p-2">
        <div style={{ height: "85vh" }}>
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      </div>

      <EventModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
