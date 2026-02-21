import React, { useState, useEffect } from "react";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import {
  CurrencyEuroIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ClockIcon,
  PaintBrushIcon,
  CameraIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const QUICK_LINKS = [
  {
    name: "URSSAF",
    href: "https://www.urssaf.fr",
    icon: BanknotesIcon,
    color: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-200/60",
    hoverBg: "hover:bg-amber-50",
  },
  {
    name: "INPI",
    href: "https://www.inpi.fr",
    icon: DocumentTextIcon,
    color: "from-slate-50 to-slate-100/50",
    borderColor: "border-slate-200/60",
    hoverBg: "hover:bg-slate-50",
  },
  {
    name: "Tiime",
    href: "https://www.tiime.fr",
    icon: ClockIcon,
    color: "from-emerald-50 to-emerald-100/50",
    borderColor: "border-emerald-200/60",
    hoverBg: "hover:bg-emerald-50",
  },
  {
    name: "Canva",
    href: "https://www.canva.com",
    icon: PaintBrushIcon,
    color: "from-violet-50 to-violet-100/50",
    borderColor: "border-violet-200/60",
    hoverBg: "hover:bg-violet-50",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com",
    icon: CameraIcon,
    color: "from-pink-50 to-rose-100/50",
    borderColor: "border-pink-200/60",
    hoverBg: "hover:bg-pink-50",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com",
    icon: HeartIcon,
    color: "from-blue-50 to-blue-100/50",
    borderColor: "border-blue-200/60",
    hoverBg: "hover:bg-blue-50",
  },
];

function formatEuro(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bonjour";
  if (hour >= 12 && hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Semaine ISO (année, numéro 1-53)
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return [d.getFullYear(), weekNo];
}

function formatWeekLabel(weekStart, weekEnd) {
  const fmt = (d) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return `Semaine du ${fmt(weekStart)} au ${fmt(weekEnd)}`;
}

function formatMonthLabel(year, month) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function getWeekRange(weekYear, week) {
  const jan4 = new Date(weekYear, 0, 4);
  const dayOfJan4 = jan4.getDay();
  const mondayOffset = dayOfJan4 === 0 ? -6 : 1 - dayOfJan4;
  const mondayOfWeek1 = new Date(weekYear, 0, 4 + mondayOffset);
  const monday = new Date(mondayOfWeek1);
  monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [monday, sunday];
}

function TableauDeBord() {
  const now = new Date();
  const [currentYear, currentWeek] = getISOWeek(now);
  const [selectedWeekYear, setSelectedWeekYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedMonthYear, setSelectedMonthYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [revenue, setRevenue] = useState({ week: null, month: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      weekYear: String(selectedWeekYear),
      week: String(selectedWeek),
      year: String(selectedMonthYear),
      month: String(selectedMonth),
    });
    fetch(`${API_BASE_URL}/appointments/stats/revenue?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRevenue(data.data);
        } else {
          setError(data.message || "Erreur chargement CA");
        }
      })
      .catch(() => setError("Impossible de charger le chiffre d'affaires"))
      .finally(() => setLoading(false));
  }, [selectedWeekYear, selectedWeek, selectedMonthYear, selectedMonth]);

  const goPrevWeek = () => {
    if (selectedWeek <= 1) {
      setSelectedWeek(53);
      setSelectedWeekYear(selectedWeekYear - 1);
    } else {
      setSelectedWeek(selectedWeek - 1);
    }
  };
  const goNextWeek = () => {
    if (selectedWeek >= 53) {
      setSelectedWeek(1);
      setSelectedWeekYear(selectedWeekYear + 1);
    } else {
      setSelectedWeek(selectedWeek + 1);
    }
  };
  const goPrevMonth = () => {
    if (selectedMonth <= 1) {
      setSelectedMonth(12);
      setSelectedMonthYear(selectedMonthYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  const goNextMonth = () => {
    if (selectedMonth >= 12) {
      setSelectedMonth(1);
      setSelectedMonthYear(selectedMonthYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const [weekStart, weekEnd] = getWeekRange(selectedWeekYear, selectedWeek);
  const weekLabel = formatWeekLabel(weekStart, weekEnd);
  const monthLabel = formatMonthLabel(selectedMonthYear, selectedMonth);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Message d'accueil */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <p className="text-lg md:text-xl text-[#8b6f6f] font-semibold capitalize">
            {getGreeting()} Laura
          </p>
          <p className="text-sm text-gray-500">
            {getFormattedDate()}
          </p>
        </div>

        {/* En-tête */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#8b6f6f]">
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">
            Vue d'ensemble de ton activité
          </p>
        </div>

        {/* Chiffre d'affaires */}
        <section>
          <h2 className="text-lg font-bold text-[#8b6f6f] mb-4 flex items-center gap-2">
            <CurrencyEuroIcon className="w-5 h-5" />
            Chiffre d'affaires
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-32 rounded-2xl bg-white border border-[#f0cfcf]/50 shadow-sm animate-pulse" />
              <div className="h-32 rounded-2xl bg-white border border-[#f0cfcf]/50 shadow-sm animate-pulse" />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-6 py-4">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CA Semaine */}
              <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:border-[#f0cfcf]">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f0cfcf]/40 text-[#8b6f6f] flex-shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </span>
                  <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                    <button
                      type="button"
                      onClick={goPrevWeek}
                      className="p-1.5 rounded-lg text-[#8b6f6f] hover:bg-[#f0cfcf]/30 transition-colors"
                      aria-label="Semaine précédente"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextWeek}
                      className="p-1.5 rounded-lg text-[#8b6f6f] hover:bg-[#f0cfcf]/30 transition-colors"
                      aria-label="Semaine suivante"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate" title={weekLabel}>
                  {weekLabel}
                </p>
                <p className="text-2xl md:text-3xl font-black text-[#8b6f6f] mt-1">
                  {formatEuro(revenue.week)}
                </p>
              </div>
              {/* CA Mois */}
              <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:border-[#f0cfcf]">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f0cfcf]/40 text-[#8b6f6f] flex-shrink-0">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </span>
                  <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                    <button
                      type="button"
                      onClick={goPrevMonth}
                      className="p-1.5 rounded-lg text-[#8b6f6f] hover:bg-[#f0cfcf]/30 transition-colors"
                      aria-label="Mois précédent"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextMonth}
                      className="p-1.5 rounded-lg text-[#8b6f6f] hover:bg-[#f0cfcf]/30 transition-colors"
                      aria-label="Mois suivant"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-500 tracking-wide capitalize">
                  {monthLabel}
                </p>
                <p className="text-2xl md:text-3xl font-black text-[#8b6f6f] mt-1">
                  {formatEuro(revenue.month)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Liens utiles */}
        <section>
          <h2 className="text-lg font-bold text-[#8b6f6f] mb-4">
            Accès rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 rounded-2xl bg-white border ${link.borderColor} shadow-sm p-5 transition-all duration-300 ${link.hoverBg} hover:shadow-md group`}
                >
                  <span
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="font-semibold text-gray-800 flex-1">
                    {link.name}
                  </span>
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-[#8b6f6f] transition-colors" />
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default TableauDeBord;
