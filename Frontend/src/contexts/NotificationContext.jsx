import React, { createContext, useContext, useState, useEffect } from "react";
import API_BASE_URL from "../config/api.config.js";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    reviews: 0,
    appointments: 0,
    giftCards: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications({ reviews: 0, appointments: 0, giftCards: 0 });
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/counts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotifications({
          reviews: data.data.reviews || 0,
          appointments: data.data.appointments || 0,
          giftCards: data.data.giftCards || 0,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshNotifications = () => {
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, isLoading, refreshNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

