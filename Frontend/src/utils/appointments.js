// Service pour gérer les rendez-vous via l'API

import API_BASE_URL from "../config/api.config";

// Récupérer tous les rendez-vous
export const getAppointments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Erreur lors de la récupération");
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    return [];
  }
};

// Ajouter un nouveau rendez-vous
export const addAppointment = async (appointment) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointment),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la création");
    }

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Erreur lors de la création");
  } catch (error) {
    console.error("Erreur lors de l'ajout du rendez-vous:", error);
    throw error;
  }
};

// Obtenir les horaires disponibles pour une date donnée
export const getAvailableTimesForDate = async (date, allTimes) => {
  try {
    const dateStr = new Date(date).toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/appointments/available/${dateStr}`
    );
    const data = await response.json();

    if (data.success) {
      return {
        availableTimes: data.data.availableTimes || [],
        reservedAppointments: data.data.reservedAppointments || [],
        isClosed: data.data.isClosed === true,
      };
    }

    // En cas d'erreur API, retourner tous les horaires (fallback)
    console.warn("Erreur API, utilisation de tous les horaires par défaut");
    return {
      availableTimes: allTimes,
      reservedAppointments: [],
      isClosed: false,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    return {
      availableTimes: allTimes,
      reservedAppointments: [],
      isClosed: false,
    };
  }
};
