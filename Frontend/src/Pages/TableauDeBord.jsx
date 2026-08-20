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
  FunnelIcon,
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

const MONTHS = [
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

function formatEuro(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
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

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return [d.getFullYear(), weekNo];
}

function TableauDeBord() {
  const now = new Date();
  const [currentYear, currentWeek] = getISOWeek(now);
  const [selectedMonthYear, setSelectedMonthYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [revenueFilter, setRevenueFilter] = useState("total");

  const [revenue, setRevenue] = useState({ week: null, month: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      weekYear: String(currentYear),
      week: String(currentWeek),
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
  }, [currentYear, currentWeek, selectedMonthYear, selectedMonth]);

  const goToCurrentMonth = () => {
    setSelectedMonthYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  const massageMonthRevenue = revenue.massageMonth ?? revenue.month ?? 0;
  const giftCardsMonthRevenue = revenue.giftCardsMonth ?? 0;
  const totalMonthRevenue = massageMonthRevenue + giftCardsMonthRevenue;

  const displayedMonthRevenue =
    revenueFilter === "massages"
      ? massageMonthRevenue
      : revenueFilter === "giftcards"
        ? giftCardsMonthRevenue
        : totalMonthRevenue;

  const filterLabel =
    revenueFilter === "massages"
      ? "Massages"
      : revenueFilter === "giftcards"
        ? "Cartes cadeaux"
        : "Total";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <p className="text-lg md:text-xl text-[#8b6f6f] font-semibold capitalize">
            {getGreeting()} Laura
          </p>
          <p className="text-sm text-gray-500">{getFormattedDate()}</p>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#8b6f6f]">
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">Vue d&apos;ensemble de ton activité</p>
        </div>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-[#8b6f6f] flex items-center gap-2">
              <CurrencyEuroIcon className="w-5 h-5" />
              Chiffre d&apos;affaires
            </h2>
          </div>

          {/* Filtres période */}
          <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8b6f6f] mb-3">
              <FunnelIcon className="w-4 h-4" />
              Filtres
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Mois
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none"
                >
                  {MONTHS.map((label, idx) => (
                    <option key={label} value={idx + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Année
                </label>
                <select
                  value={selectedMonthYear}
                  onChange={(e) => setSelectedMonthYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Type de CA
                </label>
                <select
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none"
                >
                  <option value="total">Total (massages + cartes)</option>
                  <option value="massages">Massages uniquement</option>
                  <option value="giftcards">Cartes cadeaux uniquement</option>
                </select>
              </div>
              <button
                type="button"
                onClick={goToCurrentMonth}
                className="px-4 py-2.5 rounded-xl bg-[#f0cfcf]/50 text-[#8b6f6f] text-sm font-semibold hover:bg-[#f0cfcf] transition-colors"
              >
                Mois actuel
              </button>
            </div>
          </div>

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
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f0cfcf]/40 text-[#8b6f6f]">
                      <CalendarIcon className="w-5 h-5" />
                    </span>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Cette semaine
                    </p>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-[#8b6f6f]">
                    {formatEuro(revenue.week)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f0cfcf]/40 text-[#8b6f6f]">
                      <CalendarDaysIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Mois sélectionné
                      </p>
                      <p className="text-sm font-medium text-[#8b6f6f] capitalize">
                        {MONTHS[selectedMonth - 1]} {selectedMonthYear} · {filterLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-[#8b6f6f]">
                    {formatEuro(displayedMonthRevenue)}
                  </p>
                </div>
              </div>

              {revenueFilter === "total" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                    <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                      Massages
                    </p>
                    <p className="text-xl font-black text-[#8b6f6f] mt-2">
                      {formatEuro(massageMonthRevenue)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                    <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                      Cartes cadeaux
                    </p>
                    <p className="text-xl font-black text-[#8b6f6f] mt-2">
                      {formatEuro(giftCardsMonthRevenue)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#8b6f6f] mb-4">Accès rapides</h2>
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
