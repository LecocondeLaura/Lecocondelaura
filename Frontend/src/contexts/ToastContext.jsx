import React, { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const toast = useRef(null);

  const showToast = (severity, summary, detail, life = 3000) => {
    toast.current.show({ severity, summary, detail, life });
  };

  const showSuccess = (message, summary = "Succès") => {
    showToast("success", summary, message);
  };

  const showError = (message, summary = "Erreur") => {
    showToast("error", summary, message);
  };

  const showInfo = (message, summary = "Information") => {
    showToast("info", summary, message);
  };

  const showWarn = (message, summary = "Attention") => {
    showToast("warn", summary, message);
  };

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, showWarn }}
    >
      {children}
      <Toast ref={toast} position="top-center" />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
