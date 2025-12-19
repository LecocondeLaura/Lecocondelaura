import React, { useState, useEffect } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import API_BASE_URL from "../config/api.config.js";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import Calendar from "../Components/Dashboard/Calendar";
import AppointmentModal from "../Components/Dashboard/AppointmentModal";

function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          loadAppointments();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      });
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#8b6f6f] mb-2">
            Agenda
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Visualisez tous vos rendez-vous sur le calendrier
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement de l'agenda...</p>
          </div>
        ) : (
          <Calendar
            appointments={appointments}
            onAppointmentClick={setSelectedAppointment}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default Agenda;
