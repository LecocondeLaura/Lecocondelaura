import React, { useState, useEffect } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../config/api.config.js";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import { useToast } from "../contexts/ToastContext";

const PICKABLE_SLOTS = [
  { value: "09:00", label: "9h00" },
  { value: "11:00", label: "11h00" },
  { value: "14:00", label: "14h00" },
  { value: "16:00", label: "16h00" },
  { value: "18:00", label: "18h00" },
];

function Conges() {
  const [closures, setClosures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClosureId, setEditingClosureId] = useState(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    label: "",
    visibleToClients: true,
    timeScope: "full",
    blockedSlots: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const resetForm = () => {
    setFormData({
      startDate: "",
      endDate: "",
      label: "",
      visibleToClients: true,
      timeScope: "full",
      blockedSlots: [],
    });
    setEditingClosureId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          loadClosures();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  const loadClosures = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/closures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setClosures(data.data || []);
      } else {
        showError(data.message || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Erreur chargement congés:", error);
      showError("Erreur lors du chargement des congés");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate) {
      showError("Choisissez au moins la date de début");
      return;
    }
    const end = formData.endDate || formData.startDate;
    if (end < formData.startDate) {
      showError("La date de fin doit être après la date de début");
      return;
    }
    if (
      formData.timeScope === "custom" &&
      (!formData.blockedSlots || formData.blockedSlots.length === 0)
    ) {
      showError("Cochez au moins un créneau à retirer du formulaire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(editingClosureId);
      const response = await fetch(
        isEdit
          ? `${API_BASE_URL}/closures/${editingClosureId}`
          : `${API_BASE_URL}/closures`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startDate: formData.startDate,
            endDate: end,
            label: formData.label.trim(),
            visibleToClients: formData.visibleToClients,
            timeScope: formData.timeScope,
            blockedSlots:
              formData.timeScope === "custom"
                ? formData.blockedSlots
                : undefined,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        showSuccess(
          isEdit
            ? "Période modifiée avec succès."
            : formData.visibleToClients
            ? "Période enregistrée : message aux clients sur la page contact et créneaux bloqués."
            : "Indisponibilité enregistrée : créneaux retirés du formulaire, sans affichage congés pour les clients."
        );
        resetForm();
        setIsFormOpen(false);
        loadClosures();
      } else {
        showError(data.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur création congé:", error);
      showError("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (closure) => {
    setEditingClosureId(closure._id);
    setFormData({
      startDate: closure.startDate || "",
      endDate: closure.endDate || closure.startDate || "",
      label: closure.label || "",
      visibleToClients: closure.visibleToClients !== false,
      timeScope: closure.timeScope || "full",
      blockedSlots:
        closure.timeScope === "custom" ? closure.blockedSlots || [] : [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette période de fermeture ?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/closures/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Période supprimée");
        loadClosures();
      } else {
        showError(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      showError("Erreur lors de la suppression");
    }
  };

  const formatDate = (str) => {
    if (!str) return "";
    const d = new Date(str + "T12:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRange = (start, end) => {
    if (start === end) return formatDate(start);
    return `${formatDate(start)} → ${formatDate(end)}`;
  };

  const getDaysCount = (start, end) => {
    const a = new Date(start + "T12:00:00");
    const b = new Date(end + "T12:00:00");
    return Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1;
  };

  const scopeLabel = (scope, slots = []) => {
    if (scope === "morning") return "Matinée";
    if (scope === "afternoon") return "Après-midi";
    if (scope === "custom" && slots.length) {
      const order = PICKABLE_SLOTS.map((s) => s.value);
      const sorted = [...slots].sort(
        (a, b) => order.indexOf(a) - order.indexOf(b)
      );
      const labels = sorted.map(
        (v) => PICKABLE_SLOTS.find((s) => s.value === v)?.label || v
      );
      return `Créneaux : ${labels.join(", ")}`;
    }
    if (scope === "custom") return "Créneaux au choix";
    return "Journée entière";
  };

  const toggleBlockedSlot = (value) => {
    setFormData((prev) => {
      const has = prev.blockedSlots.includes(value);
      const blockedSlots = has
        ? prev.blockedSlots.filter((x) => x !== value)
        : [...prev.blockedSlots, value];
      return { ...prev, blockedSlots };
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-[#8b6f6f] via-[#9a7a7a] to-[#7a5f5f] rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-10 mb-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
                  <span className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CalendarDaysIcon className="w-8 h-8" />
                  </span>
                  Congés & fermetures
                </h1>
                <p className="mt-3 text-white/90 text-lg max-w-2xl">
                  Congés annoncés aux clients (bannière + créneaux fermés), ou
                  indisponibilités discrètes (créneaux retirés sans message de
                  fermeture). Journée, matinée, après-midi ou créneaux précis
                  (ex. autre RDV) — les mêmes heures s&apos;appliquent à chaque
                  jour de la plage.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#8b6f6f] rounded-xl font-bold hover:bg-white/95 shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
              >
                <PlusIcon className="w-5 h-5" />
                Ajouter une période
              </button>
            </div>
          </div>
        </div>

        {/* Modal formulaire */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] p-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-[#8b6f6f] flex items-center gap-2">
                  <SunIcon className="w-6 h-6" />
                  {editingClosureId ? "Modifier la période" : "Nouvelle période"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="p-2 rounded-xl bg-white/30 hover:bg-white/50 text-[#8b6f6f] transition-colors"
                  aria-label="Fermer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <fieldset className="space-y-3 border-0 p-0 m-0">
                  <legend className="block text-sm font-bold text-gray-700 mb-2">
                    Type
                  </legend>
                  <label
                    className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                      formData.visibleToClients
                        ? "border-[#f0cfcf] bg-[#fef5f5]"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="closureKind"
                      className="mt-1"
                      checked={formData.visibleToClients}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibleToClients: true,
                        }))
                      }
                    />
                    <span>
                      <span className="font-semibold text-gray-800 block">
                        Congés / fermeture (affiché aux clients)
                      </span>
                      <span className="text-sm text-gray-600">
                        Bannière sur la page contact et créneaux non réservables.
                      </span>
                    </span>
                  </label>
                  <label
                    className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                      !formData.visibleToClients
                        ? "border-[#f0cfcf] bg-[#fef5f5]"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="closureKind"
                      className="mt-1"
                      checked={!formData.visibleToClients}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibleToClients: false,
                        }))
                      }
                    />
                    <span>
                      <span className="font-semibold text-gray-800 block">
                        Indisponibilité interne
                      </span>
                      <span className="text-sm text-gray-600">
                        Créneaux retirés du formulaire, sans message de congés.
                      </span>
                    </span>
                  </label>
                </fieldset>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Horaires (chaque jour de la plage)
                  </label>
                  <select
                    value={formData.timeScope}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        timeScope: v,
                        blockedSlots: v === "custom" ? prev.blockedSlots : [],
                      }));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all bg-white"
                  >
                    <option value="full">Journée entière</option>
                    <option value="morning">
                      Matinée uniquement (9h00, 11h00)
                    </option>
                    <option value="afternoon">
                      Après-midi uniquement (14h00, 16h00, 18h00)
                    </option>
                    <option value="custom">
                      Créneaux précis (choisir les heures)
                    </option>
                  </select>
                  {formData.timeScope === "custom" && (
                    <div className="mt-3 p-4 rounded-xl bg-[#fef5f5] border border-[#f0cfcf]">
                      <p className="text-sm font-semibold text-gray-800 mb-3">
                        À retirer du formulaire chaque jour concerné (ex. déjà
                        pris par d&apos;autres rendez-vous) :
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {PICKABLE_SLOTS.map(({ value, label }) => (
                          <label
                            key={value}
                            className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                              formData.blockedSlots.includes(value)
                                ? "border-[#8b6f6f] bg-white text-[#8b6f6f]"
                                : "border-gray-200 bg-white text-gray-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-[#8b6f6f] focus:ring-[#f0cfcf]"
                              checked={formData.blockedSlots.includes(value)}
                              onChange={() => toggleBlockedSlot(value)}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                          endDate: prev.endDate || e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      min={formData.startDate}
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laisser vide = un seul jour
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Libellé (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="Ex : Vacances, Fermeture exceptionnelle"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-5 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting
                      ? "Enregistrement…"
                      : editingClosureId
                      ? "Mettre à jour"
                      : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des périodes */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#f0cfcf] border-t-[#8b6f6f] rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Chargement des périodes…</p>
            </div>
          ) : closures.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm p-12 sm:p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f0cfcf]/30 text-[#8b6f6f] mb-6">
                <CalendarDaysIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucune période enregistrée
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Ajoutez des congés, des demi-journées ou des créneaux précis
                retirés du formulaire.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Ajouter une période
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {closures.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 leading-snug">
                          {formatRange(c.startDate, c.endDate)}
                        </p>
                        {c.label && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {c.label}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              c.visibleToClients !== false
                                ? "bg-amber-100 text-amber-900"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {c.visibleToClients !== false
                              ? "Annoncé aux clients"
                              : "Interne"}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f0cfcf]/80 text-[#5c4a4a]">
                            {scopeLabel(
                              c.timeScope || "full",
                              c.blockedSlots || []
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-[#8b6f6f] font-medium mt-2">
                          {getDaysCount(c.startDate, c.endDate)} jour
                          {getDaysCount(c.startDate, c.endDate) > 1 ? "s" : ""}{" "}
                          concerné
                          {getDaysCount(c.startDate, c.endDate) > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          className="p-2.5 text-gray-400 hover:text-[#8b6f6f] hover:bg-[#fef5f5] rounded-xl transition-colors"
                          aria-label="Modifier"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c._id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          aria-label="Supprimer"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Conges;
