import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

function Calendar({ appointments = [], closures = [], onAppointmentClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtenir le premier jour du mois et le nombre de jours
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Vérifier si un jour est en période de fermeture (congés)
  const isDayClosed = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return closures.some((c) => {
      const start = c.startDate;
      const end = c.endDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  // Formater les rendez-vous par date
  const appointmentsByDate = {};
  appointments.forEach((apt) => {
    if (apt.date && !apt.carteCadeaux) {
      // Normaliser la date pour éviter les problèmes de fuseau horaire
      const aptDate = new Date(apt.date);
      const dateKey = `${aptDate.getFullYear()}-${String(
        aptDate.getMonth() + 1
      ).padStart(2, "0")}-${String(aptDate.getDate()).padStart(2, "0")}`;
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
    const aptDate = new Date(apt.date);
    return aptDate.getFullYear() === year && aptDate.getMonth() === month;
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
            const closed = isDayClosed(day);

            return (
              <div
                key={day}
                className={`min-h-32 p-2 rounded-lg border-2 transition-all ${
                  closed
                    ? "bg-gray-200 border-gray-300 opacity-80"
                    : today
                    ? "bg-[#f0cfcf]/20 border-[#8b6f6f]"
                    : "bg-gray-50 border-gray-200 hover:border-[#f0cfcf]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-bold ${
                      closed ? "text-gray-500" : today ? "text-[#8b6f6f]" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                  {closed && (
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-300 px-1.5 py-0.5 rounded">
                      Fermé
                    </span>
                  )}
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="bg-[#8b6f6f] text-white text-xs p-1.5 rounded cursor-pointer hover:bg-[#7a5f5f] transition-colors relative"
                      title={`${apt.prenom} ${apt.nom} - ${apt.heure} - ${apt.service}${apt.status === "completed" ? " - Effectué" : ""}`}
                      onClick={() =>
                        onAppointmentClick && onAppointmentClick(apt)
                      }
                    >
                      <div className="font-semibold truncate flex items-center gap-1">
                        {apt.heure} - {apt.prenom}
                        {apt.status === "completed" && (
                          <CheckCircleIcon className="w-3.5 h-3.5 text-green-300 flex-shrink-0" title="Séance effectuée" />
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
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b6f6f]"></div>
            <span className="text-gray-600 font-medium">
              {appointmentsThisMonthCount} rendez-vous en {monthNames[month].toLowerCase()} {year}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
