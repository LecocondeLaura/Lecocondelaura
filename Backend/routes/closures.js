import express from "express";
import Closure from "../models/Closure.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const ALLOWED_SLOTS = ["09:00", "11:00", "14:00", "16:00", "18:00"];
const allowedSet = new Set(ALLOWED_SLOTS);

const normalizeClosurePayload = (body) => {
  const { startDate, endDate, label, visibleToClients, timeScope, blockedSlots } =
    body;

  if (!startDate) return { error: "La date de début est requise" };

  const start = new Date(startDate + "T12:00:00.000Z");
  const end = endDate ? new Date(endDate + "T12:00:00.000Z") : new Date(start);

  if (isNaN(start.getTime())) return { error: "Date de début invalide" };
  if (end < start) return { error: "La date de fin doit être après la date de début" };

  let scope = "full";
  let cleanedBlocked = [];
  if (timeScope === "morning" || timeScope === "afternoon") {
    scope = timeScope;
  } else if (timeScope === "custom") {
    scope = "custom";
    const raw = Array.isArray(blockedSlots) ? blockedSlots : [];
    cleanedBlocked = [
      ...new Set(raw.filter((t) => typeof t === "string" && allowedSet.has(t))),
    ];
    if (cleanedBlocked.length === 0) {
      return { error: "Sélectionnez au moins un créneau horaire." };
    }
  }

  return {
    startDate: start,
    endDate: end,
    label: label || "",
    visibleToClients: visibleToClients === false ? false : true,
    timeScope: scope,
    blockedSlots: scope === "custom" ? cleanedBlocked : [],
  };
};

// GET - Prochaines fermetures (public, pour la bannière du formulaire de contact)
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const closures = await Closure.find({
      endDate: { $gte: today },
      visibleToClients: { $ne: false },
    })
      .sort({ startDate: 1 })
      .select("startDate endDate label timeScope blockedSlots")
      .lean();

    const formatted = closures.map((c) => {
      const startDate = new Date(c.startDate).toISOString().split("T")[0];
      const endDate = new Date(c.endDate).toISOString().split("T")[0];
      const row = {
        startDate,
        endDate,
        label: c.label || "",
      };
      const scope = c.timeScope || "full";
      if (scope === "morning" || scope === "afternoon") {
        row.timeScope = scope;
      } else if (scope === "custom" && c.blockedSlots?.length) {
        row.timeScope = "custom";
        row.blockedSlots = c.blockedSlots;
      }
      return row;
    });

    // Ne garder que celles dont la fin est >= aujourd'hui (déjà filtré par $gte)
    const upcoming = formatted.filter((c) => c.endDate >= todayStr);

    res.json({ success: true, data: upcoming });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des fermetures",
      error: error.message,
    });
  }
});

// GET - Liste des périodes de congés/fermetures (protégé)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const closures = await Closure.find({})
      .sort({ startDate: 1 })
      .select("-__v")
      .lean();

    // Formater les dates en YYYY-MM-DD pour le frontend
    const formatted = closures.map((c) => ({
      ...c,
      startDate: new Date(c.startDate).toISOString().split("T")[0],
      endDate: new Date(c.endDate).toISOString().split("T")[0],
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des congés",
      error: error.message,
    });
  }
});

// POST - Créer une période de congés/fermeture (protégé)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const payload = normalizeClosurePayload(req.body);
    if (payload.error) {
      return res.status(400).json({
        success: false,
        message: payload.error,
      });
    }

    const closure = new Closure(payload);

    const saved = await closure.save();

    res.status(201).json({
      success: true,
      message: "Période de fermeture enregistrée",
      data: {
        ...saved.toObject(),
        startDate: new Date(saved.startDate).toISOString().split("T")[0],
        endDate: new Date(saved.endDate).toISOString().split("T")[0],
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création",
      error: error.message,
    });
  }
});

// PATCH - Modifier une période de congés/fermeture (protégé)
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const payload = normalizeClosurePayload(req.body);
    if (payload.error) {
      return res.status(400).json({
        success: false,
        message: payload.error,
      });
    }

    const closure = await Closure.findById(req.params.id);
    if (!closure) {
      return res.status(404).json({
        success: false,
        message: "Période non trouvée",
      });
    }

    closure.startDate = payload.startDate;
    closure.endDate = payload.endDate;
    closure.label = payload.label;
    closure.visibleToClients = payload.visibleToClients;
    closure.timeScope = payload.timeScope;
    closure.blockedSlots = payload.blockedSlots;

    const saved = await closure.save();
    res.json({
      success: true,
      message: "Période mise à jour",
      data: {
        ...saved.toObject(),
        startDate: new Date(saved.startDate).toISOString().split("T")[0],
        endDate: new Date(saved.endDate).toISOString().split("T")[0],
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification",
      error: error.message,
    });
  }
});

// DELETE - Supprimer une période (protégé)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const closure = await Closure.findByIdAndDelete(req.params.id);
    if (!closure) {
      return res.status(404).json({
        success: false,
        message: "Période non trouvée",
      });
    }
    res.json({
      success: true,
      message: "Période supprimée",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
});

export default router;
