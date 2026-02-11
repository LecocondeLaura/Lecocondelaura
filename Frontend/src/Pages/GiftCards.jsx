import React, { useState, useEffect } from "react";
import {
  GiftIcon,
  CreditCardIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PlusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../config/api.config.js";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import CreateGiftCardModal from "../Components/Dashboard/CreateGiftCardModal";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../contexts/NotificationContext";

function GiftCards() {
  const [appointments, setAppointments] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const { refreshNotifications } = useNotifications();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("status");

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
          loadExpiringSoon();
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

  const loadExpiringSoon = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/gift-cards/expiring-soon`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setExpiringSoon(data.data || []);
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des cartes expirant bientôt:",
        error
      );
    }
  };

  const sendReminder = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/send-reminder`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        showSuccess("Email de relance envoyé avec succès");
        loadAppointments();
        loadExpiringSoon();
        refreshNotifications();
      } else {
        showError(data.message || "Erreur lors de l'envoi de la relance");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la relance:", error);
      showError("Erreur lors de l'envoi de la relance");
    }
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
          body: JSON.stringify({ paiementEffectue: true }),
        }
      );

      const data = await response.json();
      if (data.success) {
        loadAppointments();
        showSuccess("Paiement marqué comme effectué");
        refreshNotifications();
      } else {
        showError("Erreur: " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error);
      showError("Erreur lors de la mise à jour du paiement");
    }
  };

  const markCarteUtilisee = async (appointmentId) => {
    const confirmed = window.confirm(
      "Marquer cette carte cadeau comme utilisée ? (Le client a utilisé sa carte au salon.)"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/carte-utilisee`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        loadAppointments();
        showSuccess("Carte cadeau marquée comme utilisée");
      } else {
        showError(data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur lors de la mise à jour");
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
        showSuccess("Carte cadeau envoyée avec succès !");
        refreshNotifications();
      } else {
        showError("Erreur: " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la carte cadeau:", error);
      showError("Erreur lors de l'envoi de la carte cadeau");
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

  // Filtre par statut
  if (filterStatus) {
    giftCards = giftCards.filter((gc) => {
      if (filterStatus === "pending") return !gc.paiementEffectue;
      if (filterStatus === "paid")
        return gc.paiementEffectue && !gc.carteCadeauEnvoyee;
      if (filterStatus === "sent")
        return gc.carteCadeauEnvoyee && !gc.carteCadeauUtilisee;
      if (filterStatus === "used") return gc.carteCadeauUtilisee;
      return true;
    });
  }

  // Tri
  const statusOrder = (gc) => {
    if (!gc.paiementEffectue) return 0;
    if (!gc.carteCadeauEnvoyee) return 1;
    if (!gc.carteCadeauUtilisee) return 2;
    return 3;
  };

  giftCards = [...giftCards].sort((a, b) => {
    if (sortBy === "status") {
      const diff = statusOrder(a) - statusOrder(b);
      if (diff !== 0) return diff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "date-desc")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "date-asc")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "name-asc") {
      const nameA = `${a.prenom} ${a.nom}`.toLowerCase();
      const nameB = `${b.prenom} ${b.nom}`.toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (sortBy === "name-desc") {
      const nameA = `${a.prenom} ${a.nom}`.toLowerCase();
      const nameB = `${b.prenom} ${b.nom}`.toLowerCase();
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  const handleCreateSuccess = () => {
    showSuccess("Carte cadeau créée avec succès ! Un email a été envoyé au client.");
    loadAppointments();
    loadExpiringSoon();
    refreshNotifications();
  };

  return (
    <DashboardLayout>
      <CreateGiftCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#8b6f6f] mb-2">
                  Cartes cadeaux
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gérez les demandes de cartes cadeaux
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] transition-colors shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Nouvelle carte cadeau</span>
                <span className="sm:hidden">Nouvelle</span>
              </button>
            </div>
          </div>

          {/* Filtres et tri */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 sm:p-5 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <FunnelIcon className="w-5 h-5 text-[#8b6f6f] shrink-0" />
              <span className="text-sm font-bold text-gray-700 shrink-0">
                Filtres :
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#8b6f6f] focus:ring-1 focus:ring-[#f0cfcf] focus:outline-none text-sm font-medium"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente de paiement</option>
                <option value="paid">Payées (à envoyer)</option>
                <option value="sent">Envoyées (non utilisées)</option>
                <option value="used">Utilisées</option>
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#8b6f6f] focus:ring-1 focus:ring-[#f0cfcf] focus:outline-none text-sm"
                aria-label="Filtrer par mois"
              >
                <option value="">Tous les mois</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#8b6f6f] focus:ring-1 focus:ring-[#f0cfcf] focus:outline-none text-sm"
                aria-label="Filtrer par année"
              >
                <option value="">Toutes les années</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
              <ArrowsUpDownIcon className="w-5 h-5 text-[#8b6f6f] shrink-0" />
              <span className="text-sm font-bold text-gray-700 shrink-0">
                Trier :
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#8b6f6f] focus:ring-1 focus:ring-[#f0cfcf] focus:outline-none text-sm font-medium"
                aria-label="Trier par"
              >
                <option value="status">Par statut (à traiter → utilisées)</option>
                <option value="date-desc">Plus récentes d'abord</option>
                <option value="date-asc">Plus anciennes d'abord</option>
                <option value="name-asc">Nom A → Z</option>
                <option value="name-desc">Nom Z → A</option>
              </select>
            </div>
            {(filterStatus || selectedMonth || selectedYear || sortBy !== "status") && (
              <button
                type="button"
                onClick={() => {
                  setFilterStatus("");
                  setSelectedMonth("");
                  setSelectedYear("");
                  setSortBy("status");
                }}
                className="px-4 py-2 text-sm font-semibold text-[#8b6f6f] hover:bg-[#f0cfcf]/30 rounded-lg transition-colors"
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

          {/* Section des cartes expirant bientôt */}
          {expiringSoon.length > 0 && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-black text-yellow-800">
                  Cartes cadeaux expirant bientôt ({expiringSoon.length})
                </h2>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                Ces cartes cadeaux expirent dans moins de 3 mois. Envoyez une
                relance pour rappeler aux clients de les utiliser.
              </p>
              <div className="space-y-3">
                {expiringSoon.map((card) => {
                  const expirationDate = new Date(card.expirationDate);
                  const expirationFormatted = expirationDate.toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  );

                  return (
                    <div
                      key={card._id}
                      className="bg-white rounded-lg p-4 border border-yellow-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {card.prenom} {card.nom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {card.service} • Code: {card.codeCarteCadeau}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            ⏰ Expire le {expirationFormatted} (
                            {card.daysUntilExpiration} jour
                            {card.daysUntilExpiration > 1 ? "s" : ""} restant
                            {card.daysUntilExpiration > 1 ? "s" : ""})
                          </p>
                          {card.relanceEnvoyee && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Relance envoyée le{" "}
                              {new Date(card.dateRelance).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          )}
                        </div>
                        {!card.relanceEnvoyee && (
                          <button
                            onClick={() => sendReminder(card._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm whitespace-nowrap"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                            Envoyer relance
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                        {giftCard.carteCadeauUtilisee && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-800 border-emerald-200">
                            Carte utilisée
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
                    {giftCard.carteCadeauEnvoyee && !giftCard.carteCadeauUtilisee && (
                      <button
                        onClick={() => markCarteUtilisee(giftCard._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all duration-300 text-sm sm:text-base"
                        title="Le client a utilisé sa carte au salon"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="sm:inline">Carte utilisée</span>
                      </button>
                    )}
                    {giftCard.carteCadeauEnvoyee && giftCard.carteCadeauUtilisee && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-sm sm:text-base font-medium">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Carte utilisée</span>
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
