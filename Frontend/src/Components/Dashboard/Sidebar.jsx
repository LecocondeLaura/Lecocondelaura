import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  GiftIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../../contexts/NotificationContext";

function Sidebar({ onLogout, onClose }) {
  const location = useLocation();
  const { notifications } = useNotifications();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const menuItems = [
    {
      name: "Agenda",
      path: "/dashboard/agenda",
      icon: CalendarIcon,
      notificationKey: "appointments",
    },
    {
      name: "Avis clients",
      path: "/dashboard",
      icon: ChatBubbleLeftRightIcon,
      notificationKey: "reviews",
    },
    {
      name: "Cartes cadeaux",
      path: "/dashboard/cartes-cadeaux",
      icon: GiftIcon,
      notificationKey: "giftCards",
    },
    {
      name: "Suivi clients",
      path: "/dashboard/clients",
      icon: UserGroupIcon,
      notificationKey: null,
    },
    {
      name: "Congés",
      path: "/dashboard/conges",
      icon: CalendarDaysIcon,
      notificationKey: null,
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path === "/dashboard/agenda") {
      return location.pathname === "/dashboard/agenda";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-lg md:shadow-none overflow-hidden">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#8b6f6f]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Le Cocon de Laura</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const notificationCount =
            item.notificationKey && notifications[item.notificationKey]
              ? notifications[item.notificationKey]
              : 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                isActive(item.path)
                  ? "bg-[#8b6f6f] text-white shadow-lg"
                  : "text-gray-700 hover:bg-[#f0cfcf]/30 hover:text-[#8b6f6f]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold flex-1">{item.name}</span>
              {notificationCount > 0 && (
                <span
                  className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    isActive(item.path)
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
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-semibold"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
