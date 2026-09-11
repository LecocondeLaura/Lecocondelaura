import express from "express";
import GoogleReviewSettings from "../models/GoogleReviewSettings.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

let cache = {
  at: 0,
  data: null,
};

const CACHE_MS = 1000 * 60 * 5; // 5 min (dashboard peut invalider)

const DEFAULT_MAPS_URL =
  (process.env.GOOGLE_MAPS_URL || "").trim() ||
  "https://maps.app.goo.gl/fjQKdWRihyL9nJN39";

function clearCache() {
  cache = { at: 0, data: null };
}

async function getOrCreateSettings() {
  let doc = await GoogleReviewSettings.findOne({ key: "default" });
  if (doc) return doc;

  const rating = Number(process.env.GOOGLE_RATING);
  const reviewCount = Number(process.env.GOOGLE_REVIEW_COUNT);

  doc = await GoogleReviewSettings.create({
    key: "default",
    rating: Number.isFinite(rating) && rating > 0 ? rating : 5,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    mapsUrl: DEFAULT_MAPS_URL,
    enabled: true,
  });
  return doc;
}

function toPublicPayload(doc) {
  if (!doc || !doc.enabled) return null;
  const rating = Number(doc.rating);
  if (!Number.isFinite(rating) || rating <= 0) return null;
  return {
    rating,
    reviewCount: Number(doc.reviewCount) || 0,
    name: "Le Cocon de Laura",
    mapsUrl: (doc.mapsUrl || DEFAULT_MAPS_URL).trim(),
    source: "dashboard",
  };
}

/**
 * GET public — note affichée sur la landing (+ lien Google Business).
 */
router.get("/", async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data !== undefined && cache.data !== null && now - cache.at < CACHE_MS) {
      return res.json({ success: true, data: cache.data, cached: true });
    }
    // cache.data peut être null volontairement (pastille masquée)
    if (cache.at && now - cache.at < CACHE_MS && cache.data === null) {
      return res.json({ success: true, data: null, cached: true });
    }

    const doc = await getOrCreateSettings();
    const data = toPublicPayload(doc);
    cache = { at: now, data };
    return res.json({ success: true, data, cached: false });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur avis Google",
      error: error.message,
    });
  }
});

/**
 * GET admin — formulaire dashboard.
 */
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const doc = await getOrCreateSettings();
    res.json({
      success: true,
      data: {
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        mapsUrl: doc.mapsUrl,
        enabled: doc.enabled,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur chargement réglages",
      error: error.message,
    });
  }
});

/**
 * PUT admin — Laura met à jour note, nombre d'avis, lien Google Business.
 */
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const { rating, reviewCount, mapsUrl, enabled } = req.body;
    const doc = await getOrCreateSettings();

    if (rating !== undefined && rating !== "") {
      const r = Number(rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return res.status(400).json({
          success: false,
          message: "La note doit être entre 1 et 5",
        });
      }
      doc.rating = Math.round(r * 10) / 10;
    }

    if (reviewCount !== undefined && reviewCount !== "") {
      const c = Number(reviewCount);
      if (!Number.isFinite(c) || c < 0) {
        return res.status(400).json({
          success: false,
          message: "Le nombre d’avis doit être ≥ 0",
        });
      }
      doc.reviewCount = Math.floor(c);
    }

    if (typeof mapsUrl === "string" && mapsUrl.trim()) {
      const url = mapsUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        return res.status(400).json({
          success: false,
          message: "Le lien Google doit commencer par https://",
        });
      }
      doc.mapsUrl = url;
    }

    if (typeof enabled === "boolean") {
      doc.enabled = enabled;
    }

    await doc.save();
    clearCache();

    res.json({
      success: true,
      message: "Avis Google mis à jour",
      data: {
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        mapsUrl: doc.mapsUrl,
        enabled: doc.enabled,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur enregistrement",
      error: error.message,
    });
  }
});

export default router;
