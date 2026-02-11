import express from "express";
import Closure from "../models/Closure.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Vérifie si une date (YYYY-MM-DD ou Date) tombe dans une période de fermeture.
 * Utilisé par les routes appointments pour bloquer les réservations.
 */
export const isDateClosed = async (dateInput) => {
  const dateStr =
    typeof dateInput === "string"
      ? dateInput
      : new Date(dateInput).toISOString().split("T")[0];
  const d = new Date(dateStr + "T12:00:00.000Z");
  const dStr = d.toISOString().split("T")[0];

  const closures = await Closure.find({});
  return closures.some((c) => {
    const startStr = new Date(c.startDate).toISOString().split("T")[0];
    const endStr = new Date(c.endDate).toISOString().split("T")[0];
    return dStr >= startStr && dStr <= endStr;
  });
};

// GET - Prochaines fermetures (public, pour la bannière du formulaire de contact)
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const closures = await Closure.find({
      endDate: { $gte: today },
    })
      .sort({ startDate: 1 })
      .select("startDate endDate label")
      .lean();

    const formatted = closures.map((c) => ({
      startDate: new Date(c.startDate).toISOString().split("T")[0],
      endDate: new Date(c.endDate).toISOString().split("T")[0],
      label: c.label || "",
    }));

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
    const { startDate, endDate, label } = req.body;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "La date de début est requise",
      });
    }

    const start = new Date(startDate + "T12:00:00.000Z");
    const end = endDate
      ? new Date(endDate + "T12:00:00.000Z")
      : new Date(start);

    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Date de début invalide",
      });
    }
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "La date de fin doit être après la date de début",
      });
    }

    const closure = new Closure({
      startDate: start,
      endDate: end,
      label: label || "",
    });

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
