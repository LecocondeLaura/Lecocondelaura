import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  GiftIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  BanknotesIcon,
  TruckIcon,
  CameraIcon,
  StarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../../contexts/NotificationContext";

const MENU_SECTIONS = [
  {
    title: null,
    items: [
      {
        name: "Tableau de bord",
        path: "/dashboard",
        icon: HomeIcon,
        notificationKey: null,
      },
    ],
  },
  {
    title: "Salon",
    items: [
      {
        name: "Agenda",
        path: "/dashboard/agenda",
        icon: CalendarIcon,
        notificationKey: "appointments",
      },
      {
        name: "Congés",
        path: "/dashboard/conges",
        icon: CalendarDaysIcon,
        notificationKey: null,
      },
      {
        name: "Suivi clients",
        path: "/dashboard/clients",
        icon: UserGroupIcon,
        notificationKey: null,
      },
    ],
  },
  {
    title: "Commercial",
    items: [
      {
        name: "Cartes cadeaux",
        path: "/dashboard/cartes-cadeaux",
        icon: GiftIcon,
        notificationKey: "giftCards",
      },
      {
        name: "Head Spa Mobile",
        path: "/dashboard/head-spa-mobile",
        icon: TruckIcon,
        notificationKey: "mobileQuotes",
      },
      {
        name: "Message clientes",
        path: "/dashboard/promotions",
        icon: TagIcon,
        notificationKey: null,
      },
      {
        name: "Comptes",
        path: "/dashboard/comptes",
        icon: BanknotesIcon,
        notificationKey: null,
      },
    ],
  },
  {
    title: "Site web",
    items: [
      {
        name: "Instagram",
        path: "/dashboard/instagram",
        icon: CameraIcon,
        notificationKey: null,
      },
      {
        name: "Avis Google",
        path: "/dashboard/avis-google",
        icon: StarIcon,
        notificationKey: null,
      },
    ],
  },
];

function Sidebar({ onLogout, onClose }) {
  const location = useLocation();
  const { notifications } = useNotifications();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-64 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-lg md:shadow-none">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-black text-[#8b6f6f]">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Le Cocon de Laura</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Fermer le menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <div key={section.title || `section-${sectionIndex}`}>
            {section.title && (
              <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const notificationCount =
                  item.notificationKey && notifications[item.notificationKey]
                    ? notifications[item.notificationKey]
                    : 0;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                      active
                        ? "bg-[#8b6f6f] text-white shadow-lg"
                        : "text-gray-700 hover:bg-[#f0cfcf]/30 hover:text-[#8b6f6f]"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 font-semibold">{item.name}</span>
                    {notificationCount > 0 && (
                      <span
                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                          active
                            ? "bg-white text-[#8b6f6f]"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
