import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const ALL_CAL_SLOTS = ["09:00", "11:00", "14:00", "16:00", "18:00"];
const CAL_MORNING = ["09:00", "11:00"];
const CAL_AFTERNOON = ["14:00", "16:00", "18:00"];

function toLocalDateKey(dateValue) {
  const d = new Date(dateValue);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getClosuresForCalendarDay(year, month, day, closuresList) {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  return closuresList.filter(
    (c) => dateStr >= c.startDate && dateStr <= c.endDate
  );
}

function getBlockedSlotsForCalendarDay(year, month, day, closuresList) {
  const dayClosures = getClosuresForCalendarDay(
    year,
    month,
    day,
    closuresList
  );
  const blocked = new Set();
  dayClosures.forEach((c) => {
    const scope = c.timeScope || "full";
    if (scope === "morning")
      CAL_MORNING.forEach((t) => blocked.add(t));
    else if (scope === "afternoon")
      CAL_AFTERNOON.forEach((t) => blocked.add(t));
    else if (scope === "custom" && Array.isArray(c.blockedSlots))
      c.blockedSlots
        .filter((t) => ALL_CAL_SLOTS.includes(t))
        .forEach((t) => blocked.add(t));
    else if (scope === "full")
      ALL_CAL_SLOTS.forEach((t) => blocked.add(t));
  });
  return blocked;
}

function Calendar({ appointments = [], closures = [], onAppointmentClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtenir le premier jour du mois et le nombre de jours
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Formater les rendez-vous par date
  const appointmentsByDate = {};
  appointments.forEach((apt) => {
    if (apt.date && !apt.carteCadeaux) {
      const dateKey = toLocalDateKey(apt.date);
      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = [];
      }
      appointmentsByDate[dateKey].push(apt);
    }
  });

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Noms des mois et jours
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Vérifier si une date est aujourd'hui
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Obtenir les rendez-vous pour une date
  const getAppointmentsForDate = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return appointmentsByDate[dateKey] || [];
  };

  // Générer les jours du mois
  const days = [];
  // Jours vides au début
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Nombre de rendez-vous dans le mois affiché (exclut cartes cadeaux)
  const appointmentsThisMonthCount = appointments.filter((apt) => {
    if (!apt.date || apt.carteCadeaux) return false;
    const [aptYear, aptMonth] = toLocalDateKey(apt.date)
      .slice(0, 7)
      .split("-")
      .map(Number);
    return aptYear === year && aptMonth === month + 1;
  }).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* En-tête du calendrier */}
      <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Mois précédent"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">
              {monthNames[month]} {year}
            </h2>
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Mois suivant"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-colors text-sm"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className="p-4">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-32"></div>;
            }

            const dayAppointments = getAppointmentsForDate(day);
            const today = isToday(day);
            const dayClosures = getClosuresForCalendarDay(
              year,
              month,
              day,
              closures
            );
            const hsmClosures = dayClosures.filter(
              (c) => c.kind === "head_spa_mobile"
            );
            const otherClosures = dayClosures.filter(
              (c) => c.kind !== "head_spa_mobile"
            );
            const blockedSlots = getBlockedSlotsForCalendarDay(
              year,
              month,
              day,
              closures
            );
            const allDayBlocked = ALL_CAL_SLOTS.every((t) =>
              blockedSlots.has(t)
            );
            const partialBlocked =
              blockedSlots.size > 0 && !allDayBlocked;
            const isHsmDay = hsmClosures.length > 0;
            const isOtherClosureDay = otherClosures.length > 0 && !isHsmDay;

            let closureBadge = null;
            if (isHsmDay) closureBadge = "Mobile";
            else if (allDayBlocked) closureBadge = "Fermé";
            else if (partialBlocked) {
              const mTaken = CAL_MORNING.every((t) => blockedSlots.has(t));
              const aTaken = CAL_AFTERNOON.every((t) =>
                blockedSlots.has(t)
              );
              if (mTaken && !aTaken) closureBadge = "Matin";
              else if (aTaken && !mTaken) closureBadge = "Ap.-midi";
              else closureBadge = "Partiel";
            }

            return (
              <div
                key={day}
                className={`min-h-32 p-2 rounded-lg border-2 transition-all ${
                  isHsmDay
                    ? "bg-[#2a9d8f]/15 border-[#2a9d8f]/50"
                    : isOtherClosureDay && allDayBlocked
                    ? "bg-gray-200 border-gray-300 opacity-80"
                    : partialBlocked && !isHsmDay
                    ? "bg-amber-50/80 border-amber-200"
                    : today
                    ? "bg-[#f0cfcf]/20 border-[#8b6f6f]"
                    : "bg-gray-50 border-gray-200 hover:border-[#f0cfcf]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-bold ${
                      isHsmDay
                        ? "text-[#1d6f64]"
                        : allDayBlocked || partialBlocked
                        ? "text-gray-600"
                        : today
                        ? "text-[#8b6f6f]"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                  {closureBadge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isHsmDay
                          ? "text-white bg-[#2a9d8f]"
                          : allDayBlocked
                          ? "text-gray-600 bg-gray-300"
                          : "text-amber-900 bg-amber-200"
                      }`}
                    >
                      {closureBadge}
                    </span>
                  )}
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {hsmClosures.map((c) => (
                    <div
                      key={c._id || `${c.startDate}-${c.label}`}
                      className="bg-[#2a9d8f] text-white text-xs p-1.5 rounded"
                      title={c.label || "Head Spa Mobile"}
                    >
                      <div className="font-semibold leading-snug line-clamp-3">
                        {c.label || "Head Spa Mobile"}
                      </div>
                    </div>
                  ))}
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      className={`text-white text-xs p-1.5 rounded cursor-pointer transition-colors relative ${
                        apt.status === "cancelled"
                          ? "bg-gray-500 hover:bg-gray-600 opacity-90"
                          : "bg-[#8b6f6f] hover:bg-[#7a5f5f]"
                      }`}
                      title={`${apt.prenom} ${apt.nom} - ${apt.heure} - ${apt.service}${
                        apt.status === "completed"
                          ? " - Effectué"
                          : apt.status === "cancelled"
                          ? " - Annulé"
                          : ""
                      }`}
                      onClick={() =>
                        onAppointmentClick && onAppointmentClick(apt)
                      }
                    >
                      <div className="font-semibold truncate flex items-center gap-1">
                        {apt.heure} - {apt.prenom}
                        {apt.status === "completed" && (
                          <CheckCircleIcon className="w-3.5 h-3.5 text-green-300 flex-shrink-0" title="Séance effectuée" />
                        )}
                        {apt.status === "cancelled" && (
                          <XCircleIcon className="w-3.5 h-3.5 text-rose-200 flex-shrink-0" title="Rendez-vous annulé" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nombre de rendez-vous du mois affiché */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b6f6f]"></div>
            <span className="text-gray-600 font-medium">
              {appointmentsThisMonthCount} rendez-vous salon
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2a9d8f]"></div>
            <span className="text-gray-600 font-medium">Head Spa Mobile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
