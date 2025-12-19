import React, { useState, useEffect } from "react";
import {
  GiftIcon,
  CreditCardIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../config/api.config.js";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import Toast from "../Components/UI/Toast";

function GiftCards() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const markPaymentAsDone = async (appointmentId) => {
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
        }
      );

      const data = await response.json();
      if (data.success) {
        loadAppointments();
        showToast("Paiement marqué comme effectué", "success");
      } else {
        showToast("Erreur: " + data.message, "error");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error);
      showToast("Erreur lors de la mise à jour du paiement", "error");
    }
  };

  const sendGiftCard = async (appointmentId) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir envoyer la carte cadeau au client ?"
    );
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/envoyer-carte-cadeau`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        loadAppointments();
        showToast("Carte cadeau envoyée avec succès !", "success");
      } else {
        showToast("Erreur: " + data.message, "error");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la carte cadeau:", error);
      showToast("Erreur lors de l'envoi de la carte cadeau", "error");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Obtenir les années et mois disponibles
  const getAvailableYearsAndMonths = () => {
    const giftCards = appointments.filter((apt) => apt.carteCadeaux);
    const dates = giftCards.map((gc) => new Date(gc.createdAt));
    const years = [...new Set(dates.map((d) => d.getFullYear()))].sort(
      (a, b) => b - a
    );
    const months = [
      { value: "01", label: "Janvier" },
      { value: "02", label: "Février" },
      { value: "03", label: "Mars" },
      { value: "04", label: "Avril" },
      { value: "05", label: "Mai" },
      { value: "06", label: "Juin" },
      { value: "07", label: "Juillet" },
      { value: "08", label: "Août" },
      { value: "09", label: "Septembre" },
      { value: "10", label: "Octobre" },
      { value: "11", label: "Novembre" },
      { value: "12", label: "Décembre" },
    ];
    return { years, months };
  };

  const { years, months } = getAvailableYearsAndMonths();

  // Filtrer les cartes cadeaux
  let giftCards = appointments.filter((apt) => apt.carteCadeaux);

  // Appliquer le filtre par mois/année
  if (selectedMonth || selectedYear) {
    giftCards = giftCards.filter((gc) => {
      const date = new Date(gc.createdAt);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear().toString();

      const monthMatch = !selectedMonth || month === selectedMonth;
      const yearMatch = !selectedYear || year === selectedYear;

      return monthMatch && yearMatch;
    });
  }

  return (
    <DashboardLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#8b6f6f] mb-2">
              Cartes cadeaux
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gérez les demandes de cartes cadeaux
            </p>
          </div>

          {/* Filtres par mois/année */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Mois :
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#8b6f6f] focus:outline-none text-sm"
              >
                <option value="">Tous les mois</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Année :
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#8b6f6f] focus:outline-none text-sm"
              >
                <option value="">Toutes les années</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {(selectedMonth || selectedYear) && (
              <button
                onClick={() => {
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                className="px-4 py-2 text-sm font-semibold text-[#8b6f6f] hover:text-[#7a5f5f] transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-black text-[#8b6f6f]">
                {giftCards.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-black text-yellow-600">
                {giftCards.filter((gc) => !gc.paiementEffectue).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Payées</p>
              <p className="text-2xl font-black text-green-600">
                {
                  giftCards.filter(
                    (gc) => gc.paiementEffectue && !gc.carteCadeauEnvoyee
                  ).length
                }
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Envoyées</p>
              <p className="text-2xl font-black text-blue-600">
                {giftCards.filter((gc) => gc.carteCadeauEnvoyee).length}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des cartes cadeaux...</p>
          </div>
        ) : giftCards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600">Aucune carte cadeau pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {giftCards.map((giftCard) => (
              <div
                key={giftCard._id}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f0cfcf] rounded-full flex items-center justify-center flex-shrink-0">
                          <GiftIcon className="w-6 h-6 text-[#8b6f6f]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#47403B] text-sm sm:text-base">
                            {giftCard.prenom} {giftCard.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {giftCard.email} • {giftCard.telephone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!giftCard.paiementEffectue && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-200">
                            Paiement en attente
                          </span>
                        )}
                        {giftCard.paiementEffectue &&
                          !giftCard.carteCadeauEnvoyee && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
                              Paiement effectué
                            </span>
                          )}
                        {giftCard.carteCadeauEnvoyee && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200">
                            Carte envoyée
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold text-[#8b6f6f]">
                          Service :
                        </span>{" "}
                        {giftCard.service}
                      </p>
                      {giftCard.codeCarteCadeau && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Code :</span>{" "}
                          {giftCard.codeCarteCadeau}
                        </p>
                      )}
                    </div>
                    {giftCard.message && (
                      <p className="text-sm text-gray-600 italic mb-2">
                        "{giftCard.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Demandée le {formatDate(giftCard.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    {!giftCard.paiementEffectue && (
                      <button
                        onClick={() => markPaymentAsDone(giftCard._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-300 text-sm sm:text-base"
                        title="Marquer le paiement comme effectué"
                      >
                        <CreditCardIcon className="w-5 h-5" />
                        <span className="sm:inline">Paiement effectué</span>
                      </button>
                    )}
                    {giftCard.paiementEffectue &&
                      !giftCard.carteCadeauEnvoyee && (
                        <button
                          onClick={() => sendGiftCard(giftCard._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all duration-300 text-sm sm:text-base"
                          title="Envoyer la carte cadeau"
                        >
                          <PaperAirplaneIcon className="w-5 h-5" />
                          <span className="sm:inline">
                            Envoyer la carte cadeau
                          </span>
                        </button>
                      )}
                    {giftCard.carteCadeauEnvoyee && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm sm:text-base">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span>Carte cadeau envoyée</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default GiftCards;
