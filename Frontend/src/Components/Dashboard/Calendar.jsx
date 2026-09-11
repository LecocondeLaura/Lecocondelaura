import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const ALL_CAL_SLOTS = ["09:00", "11:00", "14:00", "16:00", "18:00"];
const CAL_MORNING = ["09:00", "11:00"];
const CAL_AFTERNOON = ["14:00", "16:00", "18:00"];

const MONTH_NAMES = [
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

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toLocalDateKey(dateValue) {
  const d = new Date(dateValue);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function dateKeyFromParts(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getClosuresForCalendarDay(year, month, day, closuresList) {
  const dateStr = dateKeyFromParts(year, month, day);
  return closuresList.filter(
    (c) => dateStr >= c.startDate && dateStr <= c.endDate,
  );
}

function getBlockedSlotsForCalendarDay(year, month, day, closuresList) {
  const dayClosures = getClosuresForCalendarDay(year, month, day, closuresList);
  const blocked = new Set();
  dayClosures.forEach((c) => {
    const scope = c.timeScope || "full";
    if (scope === "morning") CAL_MORNING.forEach((t) => blocked.add(t));
    else if (scope === "afternoon") CAL_AFTERNOON.forEach((t) => blocked.add(t));
    else if (scope === "custom" && Array.isArray(c.blockedSlots))
      c.blockedSlots
        .filter((t) => ALL_CAL_SLOTS.includes(t))
        .forEach((t) => blocked.add(t));
    else if (scope === "full") ALL_CAL_SLOTS.forEach((t) => blocked.add(t));
  });
  return blocked;
}

function buildDayMeta(year, month, day, appointmentsByDate, closures) {
  const dateKey = dateKeyFromParts(year, month, day);
  const dayAppointments = [...(appointmentsByDate[dateKey] || [])].sort((a, b) =>
    (a.heure || "").localeCompare(b.heure || ""),
  );
  const dayClosures = getClosuresForCalendarDay(year, month, day, closures);
  const hsmClosures = dayClosures.filter((c) => c.kind === "head_spa_mobile");
  const otherClosures = dayClosures.filter((c) => c.kind !== "head_spa_mobile");
  const blockedSlots = getBlockedSlotsForCalendarDay(year, month, day, closures);
  const allDayBlocked = ALL_CAL_SLOTS.every((t) => blockedSlots.has(t));
  const partialBlocked = blockedSlots.size > 0 && !allDayBlocked;
  const isHsmDay = hsmClosures.length > 0;
  const isOtherClosureDay = otherClosures.length > 0 && !isHsmDay;

  let closureBadge = null;
  if (isHsmDay) closureBadge = "Mobile";
  else if (allDayBlocked) closureBadge = "Fermé";
  else if (partialBlocked) {
    const mTaken = CAL_MORNING.every((t) => blockedSlots.has(t));
    const aTaken = CAL_AFTERNOON.every((t) => blockedSlots.has(t));
    if (mTaken && !aTaken) closureBadge = "Matin";
    else if (aTaken && !mTaken) closureBadge = "Ap.-midi";
    else closureBadge = "Partiel";
  }

  return {
    dateKey,
    dayAppointments,
    hsmClosures,
    allDayBlocked,
    partialBlocked,
    isHsmDay,
    isOtherClosureDay,
    closureBadge,
  };
}

function cellTone({
  isHsmDay,
  isOtherClosureDay,
  allDayBlocked,
  partialBlocked,
  today,
}) {
  if (isHsmDay) return "border-[#2a9d8f]/50 bg-[#2a9d8f]/15";
  if (isOtherClosureDay && allDayBlocked)
    return "border-gray-300 bg-gray-200 opacity-80";
  if (partialBlocked && !isHsmDay) return "border-amber-200 bg-amber-50/80";
  if (today) return "border-[#8b6f6f] bg-[#f0cfcf]/20";
  return "border-gray-200 bg-gray-50 hover:border-[#f0cfcf]";
}

function AppointmentCard({ apt, onAppointmentClick, spacious = false }) {
  const cancelled = apt.status === "cancelled";
  const completed = apt.status === "completed";

  return (
    <button
      type="button"
      onClick={() => onAppointmentClick && onAppointmentClick(apt)}
      className={`w-full rounded-xl text-left text-white transition-colors ${
        spacious ? "px-4 py-3.5" : "px-2.5 py-2"
      } ${
        cancelled
          ? "bg-gray-500 hover:bg-gray-600"
          : "bg-[#8b6f6f] hover:bg-[#7a5f5f]"
      }`}
      aria-label={`${apt.heure}, ${apt.prenom} ${apt.nom}${
        apt.service ? `, ${apt.service}` : ""
      }${completed ? ", effectué" : ""}${cancelled ? ", annulé" : ""}`}
    >
      <div
        className={`flex items-center gap-1.5 font-bold ${
          spacious ? "text-base" : "text-xs"
        }`}
      >
        <ClockIcon className={spacious ? "h-4 w-4" : "h-3.5 w-3.5"} />
        <span>{apt.heure}</span>
        {completed && (
          <CheckCircleIcon
            className="h-4 w-4 flex-shrink-0 text-green-300"
            aria-hidden
          />
        )}
        {cancelled && (
          <XCircleIcon
            className="h-4 w-4 flex-shrink-0 text-rose-200"
            aria-hidden
          />
        )}
      </div>
      <div
        className={`mt-1 font-medium leading-snug ${
          spacious ? "text-sm" : "truncate text-xs"
        }`}
      >
        {apt.prenom} {apt.nom}
      </div>
      {apt.service && (
        <div
          className={`mt-0.5 leading-snug text-white/80 ${
            spacious ? "text-sm" : "truncate text-[11px]"
          }`}
        >
          {apt.service}
        </div>
      )}
    </button>
  );
}

function Calendar({ appointments = [], closures = [], onAppointmentClick }) {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
  const safeSelectedDay = Math.min(selectedDay, daysInMonth);

  const appointmentsByDate = {};
  appointments.forEach((apt) => {
    if (apt.date && !apt.carteCadeaux) {
      const dateKey = toLocalDateKey(apt.date);
      if (!appointmentsByDate[dateKey]) appointmentsByDate[dateKey] = [];
      appointmentsByDate[dateKey].push(apt);
    }
  });

  const selectMonth = (next) => {
    setCurrentDate(next);
    const isCurrentMonth =
      next.getMonth() === now.getMonth() &&
      next.getFullYear() === now.getFullYear();
    setSelectedDay(isCurrentMonth ? now.getDate() : 1);
  };

  const goToPreviousMonth = () => selectMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => selectMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  const isToday = (day) =>
    day === now.getDate() &&
    month === now.getMonth() &&
    year === now.getFullYear();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const appointmentsThisMonthCount = appointments.filter((apt) => {
    if (!apt.date || apt.carteCadeaux) return false;
    const [aptYear, aptMonth] = toLocalDateKey(apt.date)
      .slice(0, 7)
      .split("-")
      .map(Number);
    return aptYear === year && aptMonth === month + 1;
  }).length;

  const selectedMeta = buildDayMeta(
    year,
    month,
    safeSelectedDay,
    appointmentsByDate,
    closures,
  );
  const selectedLabel = new Date(year, month, safeSelectedDay).toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const goToAdjacentDay = (delta) => {
    const next = new Date(year, month, safeSelectedDay + delta);
    setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
    setSelectedDay(next.getDate());
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
      <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
            aria-label="Mois précédent"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black text-white sm:text-2xl">
              {MONTH_NAMES[month]} {year}
            </h2>
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
            aria-label="Mois suivant"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="w-full rounded-lg bg-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/30"
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* Mobile / tablette : mois compact + détail du jour */}
      <div className="p-4 lg:hidden">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-[11px] font-bold uppercase tracking-wide text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-7 gap-1"
          aria-label={`Calendrier ${MONTH_NAMES[month]} ${year}`}
        >
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-11" />;
            }

            const meta = buildDayMeta(
              year,
              month,
              day,
              appointmentsByDate,
              closures,
            );
            const selected = day === safeSelectedDay;
            const today = isToday(day);
            const count = meta.dayAppointments.length;

            return (
              <button
                key={day}
                type="button"
                aria-pressed={selected}
                aria-current={today ? "date" : undefined}
                aria-label={`${day} ${MONTH_NAMES[month]}${
                  count ? `, ${count} rendez-vous` : ""
                }${meta.closureBadge ? `, ${meta.closureBadge}` : ""}`}
                onClick={() => setSelectedDay(day)}
                className={`flex min-h-11 flex-col items-center justify-center rounded-xl border text-sm font-bold ${
                  selected
                    ? "border-[#8b6f6f] bg-[#8b6f6f] text-white"
                    : today
                      ? "border-[#8b6f6f] bg-[#f0cfcf]/40 text-[#8b6f6f]"
                      : meta.isHsmDay
                        ? "border-[#2a9d8f]/40 bg-[#2a9d8f]/15 text-[#1d6f64]"
                        : "border-transparent text-gray-700"
                }`}
              >
                {day}
                {count > 0 && (
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                      selected ? "bg-white" : "bg-[#8b6f6f]"
                    }`}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => goToAdjacentDay(-1)}
              className="rounded-lg p-2 text-[#8b6f6f] hover:bg-[#f0cfcf]/40"
              aria-label="Jour précédent"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-center text-base font-bold capitalize text-[#8b6f6f]">
              {selectedLabel}
            </h3>
            <button
              type="button"
              onClick={() => goToAdjacentDay(1)}
              className="rounded-lg p-2 text-[#8b6f6f] hover:bg-[#f0cfcf]/40"
              aria-label="Jour suivant"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {selectedMeta.closureBadge && (
            <p
              className={`mb-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                selectedMeta.isHsmDay
                  ? "bg-[#2a9d8f]/15 text-[#1d6f64]"
                  : selectedMeta.allDayBlocked
                    ? "bg-gray-200 text-gray-600"
                    : "bg-amber-100 text-amber-900"
              }`}
            >
              {selectedMeta.isHsmDay
                ? selectedMeta.hsmClosures[0]?.label || "Head Spa Mobile"
                : selectedMeta.closureBadge}
            </p>
          )}

          {selectedMeta.dayAppointments.length === 0 ? (
            <p className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Aucun rendez-vous ce jour-là.
            </p>
          ) : (
            <ul className="space-y-3">
              {selectedMeta.dayAppointments.map((apt) => (
                <li key={apt._id}>
                  <AppointmentCard
                    apt={apt}
                    onAppointmentClick={onAppointmentClick}
                    spacious
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ordinateur : mois complet */}
      <div className="hidden overflow-x-auto p-4 sm:p-6 lg:block">
        <div className="min-w-[64rem]">
          <div className="mb-3 grid grid-cols-7 gap-3">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-bold tracking-wide text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[10.5rem] rounded-xl bg-gray-50/60"
                  />
                );
              }

              const meta = buildDayMeta(
                year,
                month,
                day,
                appointmentsByDate,
                closures,
              );
              const today = isToday(day);

              return (
                <div
                  key={day}
                  className={`flex min-h-[10.5rem] flex-col rounded-xl border-2 p-3 transition-all ${cellTone(
                    { ...meta, today },
                  )}`}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className={`text-base font-bold ${
                        meta.isHsmDay
                          ? "text-[#1d6f64]"
                          : meta.allDayBlocked || meta.partialBlocked
                            ? "text-gray-600"
                            : today
                              ? "text-[#8b6f6f]"
                              : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                    {meta.closureBadge && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          meta.isHsmDay
                            ? "bg-[#2a9d8f] text-white"
                            : meta.allDayBlocked
                              ? "bg-gray-300 text-gray-600"
                              : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        {meta.closureBadge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    {meta.hsmClosures.map((c) => (
                      <div
                        key={c._id || `${c.startDate}-${c.label}`}
                        className="rounded-lg bg-[#2a9d8f] px-2.5 py-2 text-xs font-semibold text-white"
                      >
                        {c.label || "Head Spa Mobile"}
                      </div>
                    ))}
                    {meta.dayAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt._id}
                        apt={apt}
                        onAppointmentClick={onAppointmentClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8b6f6f]" />
            <span className="font-medium text-gray-600">
              {appointmentsThisMonthCount} rendez-vous salon
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2a9d8f]" />
            <span className="font-medium text-gray-600">Head Spa Mobile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
