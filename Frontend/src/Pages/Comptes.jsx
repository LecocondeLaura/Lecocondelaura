import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import { useToast } from "../contexts/ToastContext";

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const CATEGORIES = [
  "",
  "Loyer",
  "Matériel",
  "Produits",
  "Assurance",
  "URSSAF / Charges",
  "Marketing",
  "Autre",
];

const emptyForm = (date = new Date()) => ({
  nom: "",
  montant: "",
  date: toInputDate(date),
  categorie: "",
  notes: "",
});

function formatEuro(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDateShort(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toInputDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const inputClass =
  "w-full min-w-[6rem] px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none";

function Comptes() {
  const now = new Date();
  const { showSuccess, showError } = useToast();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState("month");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => emptyForm(now));
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm(now));

  const yearOptions = Array.from({ length: 8 }, (_, i) => now.getFullYear() - 3 + i);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ year: String(selectedYear) });
      if (viewMode === "month") {
        params.set("month", String(selectedMonth));
      }
      const response = await fetch(
        `${API_BASE_URL}/expenses/summary?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        showError(data.message || "Erreur de chargement");
      }
    } catch (error) {
      console.error(error);
      showError("Impossible de charger les comptes");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, viewMode]);

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
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      nom: expense.nom || "",
      montant: String(expense.montant ?? ""),
      date: toInputDate(expense.date),
      categorie: expense.categorie || "",
      notes: expense.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm(now));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.montant || !form.date) {
      showError("Nom, montant et date sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: form.nom.trim(),
          montant: Number(form.montant),
          date: form.date,
          categorie: form.categorie,
          notes: form.notes.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Dépense ajoutée");
        setForm(emptyForm(now));
        loadSummary();
      } else {
        showError(data.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error(error);
      showError("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.nom.trim() || !editForm.montant || !editForm.date) {
      showError("Nom, montant et date sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: editForm.nom.trim(),
          montant: Number(editForm.montant),
          date: editForm.date,
          categorie: editForm.categorie,
          notes: editForm.notes.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Dépense modifiée");
        setEditingId(null);
        loadSummary();
      } else {
        showError(data.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error(error);
      showError("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Supprimer cette dépense ?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Dépense supprimée");
        if (editingId === id) cancelEdit();
        loadSummary();
      } else {
        showError(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      showError("Erreur lors de la suppression");
    }
  };

  const periodTitle =
    viewMode === "month"
      ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
      : `Année ${selectedYear}`;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#8b6f6f] mb-1">
            Comptes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Suis ton chiffre d&apos;affaires et tes dépenses, mois par mois
          </p>
        </div>

        {/* Filtres */}
        <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Vue
              </label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                    viewMode === "month"
                      ? "bg-[#8b6f6f] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Par mois
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("year")}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                    viewMode === "year"
                      ? "bg-[#8b6f6f] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Par année
                </button>
              </div>
            </div>

            {viewMode === "month" && (
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Mois
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none"
                >
                  {MONTHS.map((label, idx) => (
                    <option key={label} value={idx + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode("month");
                setSelectedYear(now.getFullYear());
                setSelectedMonth(now.getMonth() + 1);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#f0cfcf]/50 text-[#8b6f6f] text-sm font-semibold hover:bg-[#f0cfcf] transition-colors"
            >
              Mois actuel
            </button>
          </div>
        </div>

        {/* Résumé */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white border border-[#f0cfcf]/50 animate-pulse"
              />
            ))}
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Résumé · {periodTitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                <div className="flex items-center gap-2 text-[#8b6f6f] mb-2">
                  <ArrowTrendingUpIcon className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Chiffre d&apos;affaires
                  </span>
                </div>
                <p className="text-2xl font-black text-[#8b6f6f]">
                  {formatEuro(summary.revenue?.total)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Massages {formatEuro(summary.revenue?.massages)} · Cartes{" "}
                  {formatEuro(summary.revenue?.giftCards)}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                <div className="flex items-center gap-2 text-rose-600 mb-2">
                  <ArrowTrendingDownIcon className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Dépenses
                  </span>
                </div>
                <p className="text-2xl font-black text-rose-700">
                  {formatEuro(summary.totalExpenses)}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm p-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <ScaleIcon className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reste
                  </span>
                </div>
                <p
                  className={`text-2xl font-black ${
                    (summary.balance || 0) >= 0
                      ? "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {formatEuro(summary.balance)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tableau */}
        <div className="rounded-2xl bg-white border border-[#f0cfcf]/60 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#8b6f6f]">
              Dépenses · {periodTitle}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Clique sur le crayon pour modifier une ligne
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="bg-[#faf6f4] text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Nom</th>
                  <th className="px-3 py-3 font-semibold">Catégorie</th>
                  <th className="px-3 py-3 font-semibold text-right">Montant</th>
                  <th className="px-3 py-3 font-semibold">Notes</th>
                  <th className="px-3 py-3 font-semibold text-center w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Chargement…
                    </td>
                  </tr>
                ) : summary?.expenses?.length ? (
                  summary.expenses.map((expense) => {
                    const isEditing = editingId === expense._id;
                    return (
                      <tr
                        key={expense._id}
                        className={`border-t border-gray-100 ${
                          isEditing ? "bg-[#f0cfcf]/20" : "hover:bg-gray-50/80"
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <td className="px-2 py-2">
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    date: e.target.value,
                                  })
                                }
                                className={inputClass}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={editForm.nom}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    nom: e.target.value,
                                  })
                                }
                                className={inputClass}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <select
                                value={editForm.categorie}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    categorie: e.target.value,
                                  })
                                }
                                className={inputClass}
                              >
                                {CATEGORIES.map((cat) => (
                                  <option key={cat || "none"} value={cat}>
                                    {cat || "—"}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.montant}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    montant: e.target.value,
                                  })
                                }
                                className={`${inputClass} text-right`}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={editForm.notes}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    notes: e.target.value,
                                  })
                                }
                                className={inputClass}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => handleSaveEdit(expense._id)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                                  title="Enregistrer"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                                  title="Annuler"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                              {formatDateShort(expense.date)}
                            </td>
                            <td className="px-3 py-3 font-medium text-gray-800">
                              {expense.nom}
                            </td>
                            <td className="px-3 py-3 text-gray-600">
                              {expense.categorie || "—"}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-rose-700 whitespace-nowrap">
                              {formatEuro(expense.montant)}
                            </td>
                            <td className="px-3 py-3 text-gray-500 max-w-[12rem] truncate">
                              {expense.notes || "—"}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(expense)}
                                  className="p-1.5 rounded-lg text-[#8b6f6f] hover:bg-[#f0cfcf]/40"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(expense._id)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Aucune dépense pour cette période.
                    </td>
                  </tr>
                )}

                {/* Ligne d'ajout */}
                <tr className="border-t-2 border-[#f0cfcf] bg-[#faf6f4]/80">
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) =>
                        setForm({ ...form, nom: e.target.value })
                      }
                      placeholder="Nom de la dépense"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={form.categorie}
                      onChange={(e) =>
                        setForm({ ...form, categorie: e.target.value })
                      }
                      className={inputClass}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat || "none"} value={cat}>
                          {cat || "—"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.montant}
                      onChange={(e) =>
                        setForm({ ...form, montant: e.target.value })
                      }
                      placeholder="0"
                      className={`${inputClass} text-right`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Notes"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleAdd}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8b6f6f] text-white text-xs font-semibold hover:bg-[#7a5f5f] disabled:opacity-60"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Comptes;
