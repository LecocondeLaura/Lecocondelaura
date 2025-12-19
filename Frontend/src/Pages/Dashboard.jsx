import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../config/api.config.js";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import Toast from "../Components/UI/Toast";

function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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
          loadReviews();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      });
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reviews/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des avis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const updateReviewStatus = async (reviewId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/reviews/${reviewId}/status`,
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
        loadReviews();
        const statusMessages = {
          approved: "Avis approuvé avec succès",
          rejected: "Avis rejeté",
        };
        showToast(statusMessages[newStatus] || "Statut mis à jour", "success");
      } else {
        showToast("Erreur lors de la mise à jour: " + data.message, "error");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  const deleteReview = async (reviewId) => {
    // Afficher un toast de confirmation au lieu d'un confirm
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet avis ?"
    );
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        loadReviews();
        showToast("Avis supprimé avec succès", "success");
      } else {
        showToast("Erreur lors de la suppression: " + data.message, "error");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showToast("Erreur lors de la suppression", "error");
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    const labels = {
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Obtenir les années et mois disponibles
  const getAvailableYearsAndMonths = () => {
    const dates = reviews.map((r) => new Date(r.createdAt));
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

  // Filtrer par statut
  let filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((review) => review.status === filter);

  // Appliquer le filtre par mois/année
  if (selectedMonth || selectedYear) {
    filteredReviews = filteredReviews.filter((review) => {
      const date = new Date(review.createdAt);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear().toString();

      const monthMatch = !selectedMonth || month === selectedMonth;
      const yearMatch = !selectedYear || year === selectedYear;

      return monthMatch && yearMatch;
    });
  }

  const stats = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

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
              Avis clients
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gérez les avis clients de votre site
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-black text-[#8b6f6f]">{stats.all}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-black text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Approuvés</p>
              <p className="text-2xl font-black text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Rejetés</p>
              <p className="text-2xl font-black text-red-600">
                {stats.rejected}
              </p>
            </div>
          </div>

          {/* Filtres par statut */}
          <div className="flex gap-2 flex-wrap mb-4">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-xl font-semibold transition-all duration-300 ${
                  filter === status
                    ? "bg-[#8b6f6f] text-white"
                    : "bg-white text-[#8b6f6f] border border-[#8b6f6f] hover:bg-[#f0cfcf]"
                }`}
              >
                {status === "all"
                  ? "Tous"
                  : status === "pending"
                  ? "En attente"
                  : status === "approved"
                  ? "Approuvés"
                  : "Rejetés"}
              </button>
            ))}
          </div>

          {/* Filtres par mois/année */}
          <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
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
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des avis...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600">
              {filter === "all"
                ? "Aucun avis pour le moment"
                : `Aucun avis ${
                    filter === "pending"
                      ? "en attente"
                      : filter === "approved"
                      ? "approuvé"
                      : "rejeté"
                  }`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8b6f6f]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-[#8b6f6f]">
                            {review.initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#47403B] text-sm sm:text-base truncate">
                            {review.firstName} {review.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Séance du {formatDate(review.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 sm:ml-auto">
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-2 break-words">
                      "{review.message}"
                    </p>
                    <p className="text-xs text-gray-500">
                      Soumis le {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    {review.status !== "approved" && (
                      <button
                        onClick={() =>
                          updateReviewStatus(review._id, "approved")
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-300 text-sm sm:text-base"
                        title="Approuver"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="sm:inline">Approuver</span>
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button
                        onClick={() =>
                          updateReviewStatus(review._id, "rejected")
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-300 text-sm sm:text-base"
                        title="Rejeter"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        <span className="sm:inline">Rejeter</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-5 h-5" />
                      <span className="sm:inline">Supprimer</span>
                    </button>
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

export default Dashboard;
