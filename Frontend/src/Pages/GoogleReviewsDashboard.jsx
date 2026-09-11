import React, { useCallback, useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import { useToast } from "../contexts/ToastContext";

function GoogleReviewsDashboard() {
  const [rating, setRating] = useState("5");
  const [reviewCount, setReviewCount] = useState("0");
  const [mapsUrl, setMapsUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/google-reviews/settings`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRating(String(data.data.rating ?? 5));
        setReviewCount(String(data.data.reviewCount ?? 0));
        setMapsUrl(data.data.mapsUrl || "");
        setEnabled(data.data.enabled !== false);
        setUpdatedAt(data.data.updatedAt || null);
      } else {
        showError(data.message || "Impossible de charger");
      }
    } catch {
      showError("Impossible de charger les réglages");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          window.location.href = "/login";
        } else load();
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/google-reviews/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          rating: Number(rating),
          reviewCount: Number(reviewCount),
          mapsUrl: mapsUrl.trim(),
          enabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Pastille avis mise à jour sur le site");
        if (data.data) {
          setRating(String(data.data.rating));
          setReviewCount(String(data.data.reviewCount));
          setMapsUrl(data.data.mapsUrl);
          setEnabled(data.data.enabled);
          setUpdatedAt(data.data.updatedAt);
        }
      } else {
        showError(data.message || "Erreur d’enregistrement");
      }
    } catch {
      showError("Impossible d’enregistrer");
    } finally {
      setSaving(false);
    }
  };

  const previewRating = Number(rating) || 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#8b6f6f]">Avis Google</h1>
          <p className="mt-1 text-sm text-gray-500">
            Affiche la note sur la page d’accueil. Un clic ouvre ta fiche Google
            Business.
          </p>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">Chargement…</p>
        ) : (
          <form
            onSubmit={handleSave}
            className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <label className="flex items-center justify-between gap-4 rounded-xl bg-[#faf6f4] px-4 py-3">
              <span className="text-sm font-semibold text-[#47403B]">
                Afficher la pastille sur l’accueil
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[#8b6f6f] focus:ring-[#8b6f6f]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#47403B]">
                  Note Google (1 à 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8b6f6f] focus:ring-2 focus:ring-[#f0cfcf]"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">
                  Ex. 5 ou 4,9 — comme sur Google Maps
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#47403B]">
                  Nombre d’avis
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8b6f6f] focus:ring-2 focus:ring-[#f0cfcf]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#47403B]">
                Lien vers ta page Google Business
              </label>
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8b6f6f] focus:ring-2 focus:ring-[#f0cfcf]"
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Sur Google Maps → Partager → Copier le lien
              </p>
            </div>

            {/* Aperçu */}
            <div className="rounded-xl border border-dashed border-[#e8a8b2]/60 bg-[#fdf8f6] px-4 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#c97886]">
                Aperçu (accueil)
              </p>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#e8a8b2]/45 bg-white/80 px-5 py-2.5">
                <span className="inline-flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(previewRating)
                          ? "text-[#c97886]"
                          : "text-[#e8a8b2]/40"
                      }`}
                    />
                  ))}
                </span>
                <span className="text-sm font-medium text-[#6e5656]">
                  {previewRating.toFixed(1).replace(".", ",")}
                </span>
                <span className="h-1 w-1 rounded-full bg-[#e8a8b2]" />
                <span className="text-sm text-[#6e5656]/65">
                  {reviewCount || 0} avis Google
                </span>
              </div>
            </div>

            {updatedAt && (
              <p className="text-xs text-gray-400">
                Dernière mise à jour :{" "}
                {new Date(updatedAt).toLocaleString("fr-FR")}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#8b6f6f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7a5f5f] disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#8b6f6f] transition hover:bg-[#faf6f4]"
                >
                  Ouvrir Google Business
                </a>
              )}
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default GoogleReviewsDashboard;
