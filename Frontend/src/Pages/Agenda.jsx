import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api.config.js";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import Calendar from "../Components/Dashboard/Calendar";
import AppointmentModal from "../Components/Dashboard/AppointmentModal";
import CreateAppointmentModal from "../Components/Dashboard/CreateAppointmentModal";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../contexts/NotificationContext";
import { PlusIcon } from "@heroicons/react/24/outline";

function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [closures, setClosures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const { refreshNotifications } = useNotifications();

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
          loadClosures();
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
      showError("Erreur lors du chargement des rendez-vous");
    } finally {
      setIsLoading(false);
    }
  };

  const loadClosures = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/closures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setClosures(data.data || []);
    } catch (err) {
      console.error("Erreur chargement congés:", err);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        showSuccess(
          "Rendez-vous supprimé avec succès. Le client a reçu un email d'annulation."
        );
        setSelectedAppointment(null);
        loadAppointments();
        refreshNotifications();
      } else {
        showError(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showError("Erreur lors de la suppression du rendez-vous");
    }
  };

  const handleSendFollowUp = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/send-followup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        showSuccess("Email de suivi envoyé avec succès au client");
        setSelectedAppointment(null);
        loadAppointments();
        refreshNotifications();
      } else {
        showError(data.message || "Erreur lors de l'envoi de l'email de suivi");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de suivi:", error);
      showError("Erreur lors de l'envoi de l'email de suivi");
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        const statusMessages = {
          confirmed: "Rendez-vous confirmé avec succès",
          cancelled: "Rendez-vous annulé",
          pending: "Statut remis en attente",
        };
        showSuccess(statusMessages[newStatus] || "Statut mis à jour");
        loadAppointments();
        refreshNotifications();
        // Mettre à jour le rendez-vous sélectionné avec le nouveau statut
        if (selectedAppointment && selectedAppointment._id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus });
        }
      } else {
        showError(data.message || "Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      showError("Erreur lors de la mise à jour du statut");
    }
  };

  const handleUpdateMoyenPaiement = async (appointmentId, moyenPaiement) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/paiement`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moyenPaiement: moyenPaiement || null,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showSuccess("Moyen de paiement mis à jour");
        if (selectedAppointment && selectedAppointment._id === appointmentId) {
          setSelectedAppointment({
            ...selectedAppointment,
            moyenPaiement: data.data.moyenPaiement ?? null,
            paiementEffectue: data.data.paiementEffectue,
          });
        }
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  moyenPaiement: data.data.moyenPaiement ?? null,
                  paiementEffectue: data.data.paiementEffectue,
                }
              : apt
          )
        );
      } else {
        showError(data.message || "Erreur lors de la mise à jour du paiement");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error);
      showError("Erreur lors de la mise à jour du paiement");
    }
  };

  const handleCreateSuccess = () => {
    showSuccess("Rendez-vous créé avec succès !");
    loadAppointments();
    refreshNotifications();
  };

  return (
    <DashboardLayout>
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onDelete={handleDeleteAppointment}
          onSendFollowUp={handleSendFollowUp}
          onUpdateStatus={handleUpdateStatus}
          onUpdateMoyenPaiement={handleUpdateMoyenPaiement}
        />
      )}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#8b6f6f] mb-2">
              Agenda
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Visualisez tous vos rendez-vous sur le calendrier
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] transition-colors shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Nouveau rendez-vous</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement de l'agenda...</p>
          </div>
        ) : (
          <Calendar
            appointments={appointments}
            closures={closures}
            onAppointmentClick={setSelectedAppointment}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default Agenda;
