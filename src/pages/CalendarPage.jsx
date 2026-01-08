import React from "react";
import ScheduleXMonthView from "../components/calendar/ScheduleXMonthView";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ScheduleXMonthView />
      </div>
    </div>
  );
}
