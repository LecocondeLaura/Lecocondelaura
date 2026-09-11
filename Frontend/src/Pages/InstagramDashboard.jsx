import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CameraIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import { useToast } from "../contexts/ToastContext";
import { INSTAGRAM_PROFILE_URL } from "../Data/instagram.js";

const PER_PAGE = 6;

function formatPostDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function excerptOf(text, max = 80) {
  const t = (text || "").trim();
  if (!t) return "Sans description";
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function InstagramDashboard() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [postedAt, setPostedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("date");
  const [page, setPage] = useState(1);
  const { showSuccess, showError } = useToast();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/instagram/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setPosts(data.data || []);
      else showError(data.message || "Erreur de chargement");
    } catch {
      showError("Impossible de charger les posts");
    } finally {
      setIsLoading(false);
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
        } else loadPosts();
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [loadPosts]);

  const filteredSorted = useMemo(() => {
    let list = [...posts];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const hay = `${p.title || ""} ${p.url || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (sortMode === "alpha") {
      list.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", "fr", {
          sensitivity: "base",
        })
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.postedAt || b.createdAt) -
          new Date(a.postedAt || a.createdAt)
      );
    }
    return list;
  }, [posts, searchQuery, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortMode]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagePosts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredSorted.slice(start, start + PER_PAGE);
  }, [filteredSorted, page]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      showError("Colle l’URL du post Instagram");
      return;
    }
    if (!title.trim()) {
      showError("Indique le début de la description");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/instagram`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          postedAt: postedAt || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Post ajouté (image récupérée si disponible)");
        setUrl("");
        setTitle("");
        setPostedAt("");
        await loadPosts();
      } else showError(data.message || "Erreur");
    } catch {
      showError("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const refreshImages = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/instagram/refresh-images`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess(data.message || "Miniatures mises à jour");
        await loadPosts();
      } else showError(data.message || "Erreur");
    } catch {
      showError("Impossible de rafraîchir les images");
    } finally {
      setRefreshing(false);
    }
  };

  const togglePublished = async (post) => {
    try {
      const response = await fetch(`${API_BASE_URL}/instagram/${post._id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ published: !post.published }),
      });
      const data = await response.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? data.data : p))
        );
        showSuccess(
          data.data.published ? "Post visible sur le site" : "Post masqué"
        );
      } else showError(data.message || "Erreur");
    } catch {
      showError("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Retirer ce post de la page Instagram ?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/instagram/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Post retiré");
        setPosts((prev) => prev.filter((p) => p._id !== id));
      } else showError(data.message || "Erreur");
    } catch {
      showError("Erreur lors de la suppression");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#8b6f6f] mb-1 flex items-center gap-3">
              <CameraIcon className="w-8 h-8" />
              Instagram
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              URL + début de description + date. L’image du post est récupérée
              automatiquement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshImages}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Charger les images
            </button>
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#8b6f6f] hover:underline self-center"
            >
              Profil →
            </a>
          </div>
        </div>

        <form
          onSubmit={handleAdd}
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-bold text-[#47403B]">Ajouter un post</h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL du post Instagram"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#f0cfcf] outline-none lg:col-span-2"
              required
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Début de la description *"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#f0cfcf] outline-none"
              required
            />
            <input
              type="date"
              value={postedAt}
              onChange={(e) => setPostedAt(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#f0cfcf] outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8b6f6f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7a5f5f] disabled:opacity-60"
          >
            <PlusIcon className="w-5 h-5" />
            {saving ? "Ajout…" : "Ajouter"}
          </button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full sm:max-w-xs rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#f0cfcf]"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSortMode("date")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                sortMode === "date"
                  ? "bg-[#8b6f6f] text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              Par date
            </button>
            <button
              type="button"
              onClick={() => setSortMode("alpha")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                sortMode === "alpha"
                  ? "bg-[#8b6f6f] text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              A → Z
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-500 py-8 text-center">Chargement…</p>
        ) : filteredSorted.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center text-gray-500">
            Aucun post.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagePosts.map((post) => (
                <article
                  key={post._id}
                  className="flex gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-3"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f0cfcf]/40 flex items-center justify-center">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-400 px-1 text-center">
                        Pas d’image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b6f6f]">
                      {formatPostDate(post.postedAt || post.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-[#47403B] leading-snug line-clamp-2">
                      {excerptOf(post.title)}
                    </p>
                    <div className="mt-auto pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublished(post)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium"
                      >
                        {post.published ? (
                          <EyeIcon className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <EyeSlashIcon className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        {post.published ? "Visible" : "Masqué"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post._id)}
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Préc.
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  Suiv.
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default InstagramDashboard;
