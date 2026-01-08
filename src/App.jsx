import React from "react";
import { Routes, Route } from "react-router-dom";

import BookingPage from "./pages/BookingPage";
import CalendarPage from "./pages/CalendarPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookingPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  );
}
