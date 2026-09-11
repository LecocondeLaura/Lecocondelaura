import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  TruckIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../contexts/NotificationContext";

const TYPE_LABELS = {
  entreprise: "Entreprise",
  hotel_spa: "Hôtel & Spa",
  ephad: "EHPAD",
};

const PAYMENT_OPTIONS = [
  { value: "", label: "Pas encore soldé" },
  { value: "especes", label: "Espèces" },
  { value: "cheque", label: "Chèque" },
  { value: "virement", label: "Virement" },
  { value: "carte_cadeaux", label: "Carte cadeau" },
];

const fieldClass =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none";

function entrepriseOf(q) {
  return (q.entreprise || q.nom || "Établissement").trim();
}

function contactOf(q) {
  return (
    q.contactNom ||
    `${q.prenom || ""} ${q.nom || ""}`.trim() ||
    "—"
  ).trim();
}

function typeOf(q) {
  return TYPE_LABELS[q.typeEtablissement] || q.typeEtablissement || "—";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInputDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatEuro(value) {
  if (value == null || value === "") return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function acompte30(montant) {
  const n = Number(montant);
  if (!n || Number.isNaN(n)) return "";
  return String(Math.round(n * 0.3 * 100) / 100);
}

function buildMailto(quote) {
  const subject = `Devis Head Spa Mobile — ${entrepriseOf(quote)}`;
  const body = `Bonjour ${contactOf(quote)},\n\nSuite à votre demande de devis Head Spa Mobile pour « ${entrepriseOf(quote)} » (${quote.lieu || ""}), voici ma proposition.\n\n[Joindre / coller ton devis ici]\n\nÀ très bientôt,\nLaura — Le Cocon de Laura\n07 87 98 43 41`;
  return `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Ouvre Gmail (web) pour composer le devis */
function buildGmailComposeUrl(quote) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: quote.email || "",
    su: `Devis Head Spa Mobile — ${entrepriseOf(quote)}`,
    body: `Bonjour ${contactOf(quote)},\n\nSuite à votre demande de devis Head Spa Mobile pour « ${entrepriseOf(quote)} » (${quote.lieu || ""}), voici ma proposition.\n\n[Joindre / coller ton devis ici]\n\nÀ très bientôt,\nLaura — Le Cocon de Laura\n07 87 98 43 41`,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function StepDot({ done, current, label }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-emerald-500 text-white"
            : current
              ? "bg-[#8b6f6f] text-white"
              : "bg-gray-200 text-gray-500"
        }`}
      >
        {done ? <CheckIcon className="w-4 h-4" /> : null}
        {!done && current ? "•" : null}
        {!done && !current ? "" : null}
      </div>
      <span
        className={`text-[10px] sm:text-xs text-center leading-tight ${
          done || current ? "text-[#47403B] font-semibold" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function HeadSpaMobileDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [panelTab, setPanelTab] = useState("suivi");
  const [filterBucket, setFilterBucket] = useState("all"); // all | attente | cours | termine
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAlpha, setSortAlpha] = useState(true);
  const [missionForm, setMissionForm] = useState({
    montant: "",
    montantAcompte: "",
    moyenPaiement: "",
    joursIntervention: [],
    notesInternes: "",
    dayToAdd: "",
  });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const pendingMailtoId = useRef(null);
  const mailtoConfirmPending = useRef(false);
  const { showSuccess, showError } = useToast();
  const { refreshNotifications } = useNotifications();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const loadQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/mobile-quotes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setQuotes(data.data || []);
      else showError(data.message || "Erreur de chargement");
    } catch {
      showError("Impossible de charger les demandes");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyQuoteUpdate = (updated) => {
    setQuotes((prev) =>
      prev.map((q) => (q._id === updated._id ? updated : q))
    );
    setSelected((prev) => (prev && prev._id === updated._id ? updated : prev));
  };

  const markDevisEnvoye = useCallback(
    async (quoteId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/mobile-quotes/${quoteId}/devis-envoye`,
          { method: "POST", headers: authHeaders() }
        );
        const data = await response.json();
        if (data.success) {
          applyQuoteUpdate(data.data);
          showSuccess(`Devis envoyé · ${formatTime(data.data.devisEnvoyeAt)}`);
          refreshNotifications();
          return true;
        }
        showError(data.message || "Erreur");
      } catch {
        showError("Impossible de marquer le devis comme envoyé");
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshNotifications, showError, showSuccess]
  );

  useEffect(() => {
    const onReturn = () => {
      const id = pendingMailtoId.current;
      if (!id || mailtoConfirmPending.current) return;
      mailtoConfirmPending.current = true;
      setTimeout(() => {
        const still = pendingMailtoId.current;
        pendingMailtoId.current = null;
        mailtoConfirmPending.current = false;
        if (!still) return;
        const ok = window.confirm(
          "As-tu bien envoyé le devis ?\n\nOK = marquer comme envoyé avec l’heure actuelle."
        );
        if (ok) markDevisEnvoye(still);
      }, 600);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onReturn();
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [markDevisEnvoye]);

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
        } else loadQuotes();
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [loadQuotes]);

  const openQuote = (quote) => {
    const jours = (quote.joursIntervention || [])
      .map((d) => toInputDate(d))
      .filter(Boolean);
    setSelected(quote);
    setPanelTab("suivi");
    setMissionForm({
      montant: quote.montant != null ? String(quote.montant) : "",
      montantAcompte:
        quote.montantAcompte != null
          ? String(quote.montantAcompte)
          : quote.montant != null
            ? acompte30(quote.montant)
            : "",
      moyenPaiement: quote.moyenPaiement || "",
      joursIntervention: jours,
      notesInternes: quote.notesInternes || "",
      dayToAdd: "",
    });
  };

  const handleTarifChange = (value) => {
    setMissionForm((prev) => ({
      ...prev,
      montant: value,
      montantAcompte: selected?.acompteRecuAt
        ? prev.montantAcompte
        : acompte30(value),
    }));
  };

  const addDay = () => {
    const day = missionForm.dayToAdd;
    if (!day) return;
    if (missionForm.joursIntervention.includes(day)) {
      showError("Ce jour est déjà ajouté");
      return;
    }
    setMissionForm((prev) => ({
      ...prev,
      joursIntervention: [...prev.joursIntervention, day].sort(),
      dayToAdd: "",
    }));
  };

  const removeDay = (day) => {
    setMissionForm((prev) => ({
      ...prev,
      joursIntervention: prev.joursIntervention.filter((d) => d !== day),
    }));
  };

  const handleSendDevis = (quote, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!quote?.email) {
      showError("Pas d’email sur cette fiche");
      return;
    }
    if (!quote.devisEnvoyeAt) pendingMailtoId.current = quote._id;

    const gmailUrl = buildGmailComposeUrl(quote);
    const opened = window.open(gmailUrl, "_blank", "noopener,noreferrer");

    // Fallback si le navigateur bloque la popup → mailto
    if (!opened) {
      const a = document.createElement("a");
      a.href = buildMailto(quote);
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleSaveMission = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const response = await fetch(
        `${API_BASE_URL}/mobile-quotes/${selected._id}/mission`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({
            montant:
              missionForm.montant === "" ? null : Number(missionForm.montant),
            montantAcompte:
              missionForm.montantAcompte === ""
                ? null
                : Number(missionForm.montantAcompte),
            moyenPaiement: missionForm.moyenPaiement || null,
            joursIntervention: missionForm.joursIntervention,
            notesInternes: missionForm.notesInternes,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        showSuccess(
          missionForm.joursIntervention.length
            ? "Enregistré — jours bloqués sur l’agenda & le site"
            : "Enregistré"
        );
        applyQuoteUpdate(data.data);
        refreshNotifications();
      } else showError(data.message || "Erreur");
    } catch {
      showError("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const postAction = async (path, body, loadingKey) => {
    if (!selected) return;
    try {
      setActionLoading(loadingKey);
      const response = await fetch(
        `${API_BASE_URL}/mobile-quotes/${selected._id}/${path}`,
        {
          method: "POST",
          headers: authHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        }
      );
      const data = await response.json();
      if (data.success) {
        applyQuoteUpdate(data.data);
        showSuccess(data.message || "OK");
        refreshNotifications();
      } else showError(data.message || "Erreur");
    } catch {
      showError("Action impossible");
    } finally {
      setActionLoading("");
    }
  };

  const handleDevisSigne = async () => {
    await handleSaveMission();
    await postAction("devis-signe", null, "signe");
  };

  const handleAcompteRecu = async () => {
    const amount =
      missionForm.montantAcompte !== ""
        ? Number(missionForm.montantAcompte)
        : selected?.montantAcompte;
    if (amount == null || Number.isNaN(amount) || amount <= 0) {
      showError("Indique d’abord le tarif (l’acompte se calcule à 30 %)");
      return;
    }
    await handleSaveMission();
    await postAction("acompte-recu", { montantAcompte: amount }, "acompte");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/mobile-quotes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Demande supprimée");
        setQuotes((prev) => prev.filter((q) => q._id !== id));
        if (selected?._id === id) setSelected(null);
        refreshNotifications();
      } else showError(data.message || "Erreur");
    } catch {
      showError("Erreur lors de la suppression");
    }
  };

  const quoteBucket = (q) => {
    // Terminé = solde payé
    if (q.paiementEffectue) return "termine";
    // En cours = devis signé + acompte reçu
    if (q.devisSigneAt && q.acompteRecuAt) return "cours";
    // Sinon encore en attente (demande, devis envoyé, etc.)
    return "attente";
  };

  const filteredQuotes = (() => {
    let list = [...quotes];
    if (filterBucket !== "all") {
      list = list.filter((q) => quoteBucket(q) === filterBucket);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const hay = [
          entrepriseOf(item),
          contactOf(item),
          item.lieu,
          item.email,
          typeOf(item),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (sortAlpha) {
      list.sort((a, b) =>
        entrepriseOf(a).localeCompare(entrepriseOf(b), "fr", {
          sensitivity: "base",
        })
      );
    }
    return list;
  })();

  const countAttente = quotes.filter((q) => quoteBucket(q) === "attente").length;
  const countCours = quotes.filter((q) => quoteBucket(q) === "cours").length;
  const countTermine = quotes.filter((q) => quoteBucket(q) === "termine").length;

  const pendingCount = countAttente;

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#8b6f6f] mb-1 flex items-center gap-3">
              <TruckIcon className="w-8 h-8" />
              Head Spa Mobile
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Entreprises, hôtels &amp; spa, EHPAD — devis, acomptes et jours
              d’intervention.
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
              {pendingCount} en attente
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Toutes", count: quotes.length },
              { id: "attente", label: "En attente", count: countAttente },
              { id: "cours", label: "En cours", count: countCours },
              { id: "termine", label: "Terminées", count: countTermine },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterBucket(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filterBucket === f.id
                    ? "bg-[#2a9d8f] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#2a9d8f]/40"
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-80">({f.count})</span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (entreprise, ville…)"
              className="w-full sm:max-w-xs rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2a9d8f]/30"
            />
            <button
              type="button"
              onClick={() => setSortAlpha((v) => !v)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                sortAlpha
                  ? "border-[#2a9d8f] bg-[#2a9d8f]/10 text-[#1d6f64]"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              A → Z {sortAlpha ? "✓" : ""}
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-500 py-12 text-center">Chargement…</p>
        ) : filteredQuotes.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-16 text-center">
            <TruckIcon className="w-12 h-12 text-[#f0cfcf] mx-auto mb-3" />
            <p className="text-gray-600">
              {quotes.length === 0
                ? "Aucune demande pour le moment"
                : "Aucune fiche pour ce filtre / cette recherche"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredQuotes.map((quote) => (
              <div
                key={quote._id}
                role="button"
                tabIndex={0}
                onClick={() => openQuote(quote)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openQuote(quote);
                }}
                className="text-left rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#2a9d8f]/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-lg font-black text-[#47403B]">
                    {entrepriseOf(quote)}
                  </h2>
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                    {typeOf(quote)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Contact : {contactOf(quote)}
                </p>

                <a
                  href={buildMailto(quote)}
                  onClick={(e) => handleSendDevis(quote, e)}
                  className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#8b6f6f] hover:underline"
                >
                  <EnvelopeIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{quote.email}</span>
                </a>

                <p className="flex items-start gap-2 text-sm text-gray-700 mb-3">
                  <MapPinIcon className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                  {quote.lieu}
                </p>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  {quote.devisEnvoyeAt && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800 font-medium">
                      Devis envoyé
                    </span>
                  )}
                  {quote.devisSigneAt && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 font-medium">
                      Signé
                    </span>
                  )}
                  {quote.acompteRecuAt && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900 font-medium">
                      Acompte {formatEuro(quote.montantAcompte)}
                    </span>
                  )}
                  {quote.paiementEffectue && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-900 font-medium">
                      Soldé
                    </span>
                  )}
                  {(quote.joursIntervention || []).length > 0 && (
                    <span className="rounded-full bg-[#2a9d8f]/15 px-2 py-0.5 text-[#1d6f64] font-medium">
                      {(quote.joursIntervention || []).length} jour
                      {(quote.joursIntervention || []).length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer"
            onClick={() => setSelected(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="shrink-0 border-b border-gray-100 px-5 pt-5 sm:px-8 sm:pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2a9d8f]">
                    {typeOf(selected)} · {selected.lieu}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#47403B]">
                    {entrepriseOf(selected)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Demandeur : {contactOf(selected)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Parcours simple */}
              <div className="flex items-start gap-1 sm:gap-2 pb-4">
                <StepDot
                  done={!!selected.devisEnvoyeAt}
                  current={!selected.devisEnvoyeAt}
                  label="Devis envoyé"
                />
                <div className="h-0.5 flex-1 bg-gray-200 mt-4" />
                <StepDot
                  done={!!selected.devisSigneAt}
                  current={!!selected.devisEnvoyeAt && !selected.devisSigneAt}
                  label="Signé"
                />
                <div className="h-0.5 flex-1 bg-gray-200 mt-4" />
                <StepDot
                  done={!!selected.acompteRecuAt}
                  current={!!selected.devisSigneAt && !selected.acompteRecuAt}
                  label="Acompte 30%"
                />
                <div className="h-0.5 flex-1 bg-gray-200 mt-4" />
                <StepDot
                  done={!!selected.paiementEffectue}
                  current={
                    !!selected.acompteRecuAt && !selected.paiementEffectue
                  }
                  label="Soldé"
                />
              </div>

              <div className="flex gap-2">
                {[
                  { id: "suivi", label: "Suivi" },
                  { id: "historique", label: "Historique" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPanelTab(tab.id)}
                    className={`px-5 py-3 text-sm font-semibold border-b-2 ${
                      panelTab === tab.id
                        ? "border-[#2a9d8f] text-[#2a9d8f]"
                        : "border-transparent text-gray-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={buildMailto(selected)}
                  onClick={(e) => handleSendDevis(selected, e)}
                  className="flex items-center gap-2.5 font-semibold text-[#8b6f6f] rounded-xl bg-[#faf6f4] px-4 py-3 hover:underline"
                >
                  <EnvelopeIcon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{selected.email}</span>
                </a>
                <a
                  href={`tel:${selected.telephone}`}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-4 py-3"
                >
                  <PhoneIcon className="w-5 h-5 text-[#8b6f6f]" />
                  {selected.telephone}
                </a>
              </div>

              {selected.message && (
                <p className="italic text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                  « {selected.message} »
                </p>
              )}

              {panelTab === "historique" ? (
                <div className="space-y-3">
                  {(selected.history || []).length === 0 ? (
                    <p className="text-gray-500">Aucun événement.</p>
                  ) : (
                    <ul className="space-y-3">
                      {[...(selected.history || [])]
                        .sort((a, b) => new Date(b.at) - new Date(a.at))
                        .map((h, i) => (
                          <li
                            key={h._id || i}
                            className="rounded-xl bg-gray-50 px-5 py-4"
                          >
                            <p className="font-semibold text-[#47403B]">
                              {h.label}
                            </p>
                            {h.detail && (
                              <p className="text-sm text-gray-600 mt-1">
                                {h.detail}
                              </p>
                            )}
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(h.at)}
                            </p>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Actions principales */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleSendDevis(selected, e)}
                      className="rounded-xl bg-[#8b6f6f] py-3.5 text-sm font-semibold text-white hover:bg-[#7a5f5f]"
                    >
                      {selected.devisEnvoyeAt
                        ? "Renvoyer le devis (Gmail)"
                        : "1. Envoyer le devis (Gmail)"}
                    </button>
                    <button
                      type="button"
                      disabled={
                        !!selected.devisSigneAt || actionLoading === "signe"
                      }
                      onClick={handleDevisSigne}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-semibold text-emerald-800 disabled:opacity-50"
                    >
                      {selected.devisSigneAt
                        ? `Signé · ${formatTime(selected.devisSigneAt)}`
                        : "2. Devis signé"}
                    </button>
                    <button
                      type="button"
                      disabled={
                        !!selected.acompteRecuAt || actionLoading === "acompte"
                      }
                      onClick={handleAcompteRecu}
                      className="rounded-xl border border-amber-200 bg-amber-50 py-3.5 text-sm font-semibold text-amber-900 disabled:opacity-50"
                    >
                      {selected.acompteRecuAt
                        ? `Acompte · ${formatEuro(selected.montantAcompte)}`
                        : "3. Acompte reçu"}
                    </button>
                  </div>

                  {/* Tarif */}
                  <div className="rounded-2xl border border-gray-100 bg-[#fafafa] p-4 sm:p-5 space-y-4">
                    <h3 className="font-bold text-[#47403B]">Tarif & acompte</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
                          Tarif total (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={missionForm.montant}
                          onChange={(e) => handleTarifChange(e.target.value)}
                          placeholder="Ex : 800"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
                          Acompte 30 % (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={missionForm.montantAcompte}
                          readOnly={!!selected.acompteRecuAt}
                          onChange={(e) =>
                            setMissionForm({
                              ...missionForm,
                              montantAcompte: e.target.value,
                            })
                          }
                          className={`${fieldClass} ${selected.acompteRecuAt ? "bg-gray-100" : "bg-amber-50/50"}`}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Calculé auto à 30 % du tarif
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
                        Paiement du solde
                      </label>
                      <select
                        value={missionForm.moyenPaiement}
                        onChange={(e) =>
                          setMissionForm({
                            ...missionForm,
                            moyenPaiement: e.target.value,
                          })
                        }
                        className={fieldClass}
                      >
                        {PAYMENT_OPTIONS.map((p) => (
                          <option key={p.value || "none"} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Jours d'intervention */}
                  <div className="rounded-2xl border border-[#2a9d8f]/25 bg-[#2a9d8f]/5 p-4 sm:p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-[#1d6f64]">
                        Jours d’intervention
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ajoute chaque jour où tu te déplaces — ils apparaissent
                        en vert sur l’agenda et bloquent le formulaire RDV du
                        site.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="date"
                        value={missionForm.dayToAdd}
                        onChange={(e) =>
                          setMissionForm({
                            ...missionForm,
                            dayToAdd: e.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                      <button
                        type="button"
                        onClick={addDay}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2a9d8f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#238b7e]"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                    {missionForm.joursIntervention.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Aucun jour sélectionné.
                      </p>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {missionForm.joursIntervention.map((day) => (
                          <li
                            key={day}
                            className="inline-flex items-center gap-2 rounded-full bg-white border border-[#2a9d8f]/30 px-3 py-1.5 text-sm font-medium text-[#1d6f64]"
                          >
                            {formatDay(day)}
                            <button
                              type="button"
                              onClick={() => removeDay(day)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label="Retirer"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={missionForm.notesInternes}
                      onChange={(e) =>
                        setMissionForm({
                          ...missionForm,
                          notesInternes: e.target.value,
                        })
                      }
                      className={`${fieldClass} resize-none`}
                      placeholder="Infos pour toi…"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveMission}
                      className="rounded-xl bg-[#2a9d8f] py-3.5 text-base font-semibold text-white hover:bg-[#238b7e] disabled:opacity-60"
                    >
                      {saving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selected._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 text-base font-semibold text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default HeadSpaMobileDashboard;
