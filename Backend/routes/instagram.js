import express from "express";
import InstagramPost from "../models/InstagramPost.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

export const normalizeInstagramUrl = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const match = trimmed.match(
    /instagram\.com\/((?:p|reel|tv)\/[A-Za-z0-9_-]+)/i
  );
  if (!match) return null;
  return `https://www.instagram.com/${match[1]}/`;
};

const parsePostedAt = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Récupère la miniature via microlink (aperçu OG) */
const preferFullImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  try {
    const u = new URL(url);
    // Évite les crops Instagram type stp=c288.0.864…
    if (u.searchParams.has("stp")) {
      u.searchParams.set("stp", "dst-jpg_e35_s1080x1080");
    }
    return u.toString();
  } catch {
    return url;
  }
};

export const fetchInstagramImage = async (postUrl) => {
  try {
    const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(
      postUrl
    )}&palette=false&audio=false&video=false`;
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return "";
    const json = await res.json();
    if (json?.status !== "success") return "";
    const image = json?.data?.image;
    if (!image) return "";
    const raw = typeof image === "string" ? image : image.url || "";
    return preferFullImageUrl(raw);
  } catch (err) {
    console.warn("⚠️ Miniature Instagram:", err.message);
    return "";
  }
};

const DEFAULT_POSTS = [
  {
    url: "https://www.instagram.com/p/DdJzYzaIwnP/",
    title: "Nouveauté Head Spa Mobile — hôtels, entreprises, EHPAD",
    postedAt: "2026-09-11",
  },
  {
    url: "https://www.instagram.com/p/DZpB0T8IpUP/",
    title: "Publication Head Spa",
    postedAt: "2026-06-16",
  },
  {
    url: "https://www.instagram.com/p/DX4w_3tiKfB/",
    title: "Publication Head Spa",
    postedAt: "2026-05-03",
  },
  {
    url: "https://www.instagram.com/p/DWBnDvUCJLM/",
    title: "Publication Head Spa",
    postedAt: "2026-03-18",
  },
  {
    url: "https://www.instagram.com/p/DVPFqtpiDCO/",
    title: "Publication Head Spa",
    postedAt: "2026-02-26",
  },
  {
    url: "https://www.instagram.com/p/DVRVJJ9CEJA/",
    title: "Publication Head Spa",
    postedAt: "2026-02-27",
  },
  {
    url: "https://www.instagram.com/reel/DU_M9oFiCwm/",
    title: "Reel Head Spa",
    postedAt: "2026-02-20",
  },
  {
    url: "https://www.instagram.com/p/DU_MDt2iEq1/",
    title: "Publication Head Spa",
    postedAt: "2026-02-20",
  },
  {
    url: "https://www.instagram.com/reel/DTlpd_SiDAI/",
    title: "Reel Head Spa",
    postedAt: "2026-01-16",
  },
];

const seedIfEmpty = async () => {
  const count = await InstagramPost.countDocuments();
  if (count > 0) {
    await InstagramPost.updateMany(
      { $or: [{ postedAt: null }, { postedAt: { $exists: false } }] },
      [{ $set: { postedAt: "$createdAt" } }]
    );
    return;
  }
  await InstagramPost.insertMany(
    DEFAULT_POSTS.map((p, i) => ({
      url: normalizeInstagramUrl(p.url),
      title: p.title || "",
      postedAt: new Date(`${p.postedAt}T12:00:00.000Z`),
      published: true,
      order: i,
      imageUrl: "",
    }))
  );
};

/** Complète les miniatures manquantes (max N) */
const backfillImages = async (limit = 4) => {
  const missing = await InstagramPost.find({
    $or: [{ imageUrl: "" }, { imageUrl: null }, { imageUrl: { $exists: false } }],
  })
    .sort({ postedAt: -1 })
    .limit(limit);

  for (const post of missing) {
    const imageUrl = await fetchInstagramImage(post.url);
    if (imageUrl) {
      post.imageUrl = imageUrl;
      await post.save();
    }
  }
};

// GET public
router.get("/", async (req, res) => {
  try {
    await seedIfEmpty();
    // Ne pas bloquer la réponse trop longtemps
    backfillImages(3).catch(() => {});

    const posts = await InstagramPost.find({ published: true })
      .sort({ postedAt: -1, createdAt: -1 })
      .select("url title imageUrl postedAt createdAt");
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des posts",
      error: error.message,
    });
  }
});

// GET all (dashboard)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    await seedIfEmpty();
    backfillImages(4).catch(() => {});
    const posts = await InstagramPost.find().sort({
      postedAt: -1,
      createdAt: -1,
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

// POST créer (+ miniature auto)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const url = normalizeInstagramUrl(req.body.url);
    if (!url) {
      return res.status(400).json({
        success: false,
        message:
          "URL invalide. Colle un lien de post Instagram (…/p/… ou …/reel/…).",
      });
    }

    const existing = await InstagramPost.findOne({ url });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Ce post est déjà dans la liste",
      });
    }

    const postedAt = parsePostedAt(req.body.postedAt) || new Date();
    const maxOrder = await InstagramPost.findOne()
      .sort({ order: -1 })
      .select("order");

    let imageUrl = req.body.imageUrl
      ? String(req.body.imageUrl).trim()
      : "";
    if (!imageUrl) {
      imageUrl = await fetchInstagramImage(url);
    }

    const post = await InstagramPost.create({
      url,
      title: req.body.title ? String(req.body.title).trim() : "",
      imageUrl,
      postedAt,
      published: req.body.published !== false,
      order: (maxOrder?.order ?? -1) + 1,
    });

    res.status(201).json({
      success: true,
      message: "Post ajouté",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout",
      error: error.message,
    });
  }
});

// POST refresh images (toutes)
router.post("/refresh-images", authenticateToken, async (req, res) => {
  try {
    const posts = await InstagramPost.find().sort({ postedAt: -1 });
    let updated = 0;
    for (const post of posts) {
      const imageUrl = await fetchInstagramImage(post.url);
      if (imageUrl) {
        post.imageUrl = imageUrl;
        await post.save();
        updated += 1;
      } else if (post.imageUrl) {
        const fixed = preferFullImageUrl(post.imageUrl);
        if (fixed !== post.imageUrl) {
          post.imageUrl = fixed;
          await post.save();
          updated += 1;
        }
      }
    }

    res.json({
      success: true,
      message: `${updated} image(s) mise(s) à jour`,
      data: { updated, total: posts.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

// PATCH
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const post = await InstagramPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post non trouvé",
      });
    }

    if (req.body.url !== undefined) {
      const url = normalizeInstagramUrl(req.body.url);
      if (!url) {
        return res.status(400).json({
          success: false,
          message: "URL Instagram invalide",
        });
      }
      post.url = url;
      if (!req.body.imageUrl) {
        const imageUrl = await fetchInstagramImage(url);
        if (imageUrl) post.imageUrl = imageUrl;
      }
    }
    if (req.body.title !== undefined) {
      post.title = String(req.body.title).trim();
    }
    if (req.body.imageUrl !== undefined) {
      post.imageUrl = String(req.body.imageUrl).trim();
    }
    if (req.body.postedAt !== undefined) {
      const d = parsePostedAt(req.body.postedAt);
      if (d) post.postedAt = d;
    }
    if (req.body.published !== undefined) {
      post.published = Boolean(req.body.published);
    }
    if (req.body.order !== undefined) {
      const order = Number(req.body.order);
      if (!Number.isNaN(order)) post.order = order;
    }

    await post.save();
    res.json({ success: true, message: "Post mis à jour", data: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

// DELETE
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const post = await InstagramPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post non trouvé",
      });
    }
    res.json({ success: true, message: "Post supprimé" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

export default router;
