import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  GiftIcon,
  CalendarIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Sidebar({ onLogout, onClose }) {
  const location = useLocation();

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
    },
    {
      name: "Avis clients",
      path: "/dashboard",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: "Cartes cadeaux",
      path: "/dashboard/cartes-cadeaux",
      icon: GiftIcon,
    },
    {
      name: "Suivi clients",
      path: "/dashboard/clients",
      icon: UserGroupIcon,
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
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-lg md:shadow-none">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
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
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive(item.path)
                  ? "bg-[#8b6f6f] text-white shadow-lg"
                  : "text-gray-700 hover:bg-[#f0cfcf]/30 hover:text-[#8b6f6f]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
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
