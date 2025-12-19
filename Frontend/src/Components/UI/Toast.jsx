import React, { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const colors = {
    success: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-300",
      iconBg: "bg-gradient-to-br from-green-400 to-emerald-500",
      icon: "text-white",
      text: "text-green-800",
      button: "text-green-400 hover:text-green-600",
      shadow: "shadow-green-200/50",
    },
    error: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50",
      border: "border-red-300",
      iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
      icon: "text-white",
      text: "text-red-800",
      button: "text-red-400 hover:text-red-600",
      shadow: "shadow-red-200/50",
    },
    warning: {
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      border: "border-yellow-300",
      iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
      icon: "text-white",
      text: "text-yellow-800",
      button: "text-yellow-400 hover:text-yellow-600",
      shadow: "shadow-yellow-200/50",
    },
    info: {
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      border: "border-blue-300",
      iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
      icon: "text-white",
      text: "text-blue-800",
      button: "text-blue-400 hover:text-blue-600",
      shadow: "shadow-blue-200/50",
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 animate-toast-in max-w-md w-full sm:w-auto px-4 sm:px-0`}
    >
      <div
        className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-2xl shadow-xl ${colorScheme.shadow} p-5 flex items-start gap-4 backdrop-blur-sm`}
      >
        <div
          className={`flex-shrink-0 ${colorScheme.iconBg} rounded-full p-2.5 shadow-lg`}
        >
          <Icon className={`w-6 h-6 ${colorScheme.icon}`} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className={`${colorScheme.text} font-bold text-base leading-relaxed`}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${colorScheme.button} transition-colors p-1 rounded-lg hover:bg-white/50`}
          aria-label="Fermer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
