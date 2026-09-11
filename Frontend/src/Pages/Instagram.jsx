import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import API_BASE_URL from "../config/api.config.js";
import {
  INSTAGRAM_USERNAME,
  INSTAGRAM_PROFILE_URL,
} from "../Data/instagram.js";

const PER_PAGE = 8;

function formatPostDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerptOf(text, max = 56) {
  const t = (text || "").trim();
  if (!t) return "Voir sur Instagram";
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function Instagram() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/instagram`);
        const data = await res.json();
        if (!cancelled) {
          if (data.success) setPosts(data.data || []);
          else setError(data.message || "Impossible de charger les posts");
        }
      } catch {
        if (!cancelled) setError("Impossible de charger les publications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagePosts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return posts.slice(start, start + PER_PAGE);
  }, [posts, page]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf6f4] pt-28 pb-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 15% 20%, rgba(240,207,207,0.55) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 90% 70%, rgba(232,168,178,0.28) 0%, transparent 50%),
            linear-gradient(180deg, #fdf8f6 0%, #faf6f4 100%)
          `,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center md:mb-12">
          <p className="mb-3 font-display text-sm tracking-[0.25em] text-[#c97886] uppercase">
            Réseaux
          </p>
          <h1 className="font-display text-4xl font-medium text-[#6e5656] sm:text-5xl">
            Instagram
          </h1>
          <div className="mx-auto mt-5 h-px w-16 bg-[#e8a8b2]/70" />
          <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-[#6e5656]/65">
            Bienfaits du Head Spa, coulisses et actus —{" "}
            <span className="font-medium text-[#6e5656]">
              @{INSTAGRAM_USERNAME}
            </span>
          </p>
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex rounded-full bg-[#6e5656] px-7 py-3 font-body text-sm font-semibold tracking-wide text-white transition hover:bg-[#5a4343]"
          >
            Voir le profil Instagram
          </a>
        </header>

        {loading ? (
          <p className="py-16 text-center font-body text-[#6e5656]/55">
            Chargement…
          </p>
        ) : error ? (
          <p className="py-16 text-center font-body text-red-600">{error}</p>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center font-body text-[#6e5656]/55">
            Aucune publication pour le moment.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {pagePosts.map((post) => (
                <a
                  key={post._id || post.url}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#f0cfcf]/90 bg-white/90 shadow-[0_10px_28px_-18px_rgba(110,86,86,0.4)] transition duration-300 hover:-translate-y-0.5 hover:border-[#e8a8b2] hover:shadow-[0_14px_32px_-16px_rgba(201,120,134,0.4)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#fdf6f5] to-[#f0cfcf]/70">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain p-1.5 transition duration-500 group-hover:scale-[1.02] sm:p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-xs tracking-wide text-[#6e5656]/35">
                        @{INSTAGRAM_USERNAME}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col px-2.5 py-2.5 sm:px-3 sm:py-3">
                    <p className="line-clamp-2 min-h-[2.25rem] font-body text-[12px] leading-snug text-[#6e5656] sm:text-[13px]">
                      {excerptOf(post.title)}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-1 pt-2">
                      <time className="font-body text-[10px] text-[#6e5656]/45 sm:text-[11px]">
                        {formatPostDate(post.postedAt || post.createdAt)}
                      </time>
                      <span className="font-body text-[10px] font-semibold text-[#c97886] sm:text-[11px]">
                        Voir →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-[#f0cfcf] bg-white px-4 py-2 text-sm font-medium text-[#6e5656] disabled:opacity-40"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Préc.
                </button>
                <span className="font-body text-sm text-[#6e5656]/70">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-[#f0cfcf] bg-white px-4 py-2 text-sm font-medium text-[#6e5656] disabled:opacity-40"
                >
                  Suiv.
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Instagram;
