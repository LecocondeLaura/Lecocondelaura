import express from "express";
import Review from "../models/Review.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET - Récupérer tous les avis approuvés
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .select("-__v -status")
      .lean();

    // Formater les dates pour l'affichage
    const formattedReviews = reviews.map((review) => {
      const date = new Date(review.date);
      const months = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];
      const formattedDate = `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;

      return {
        id: review._id.toString(),
        text: review.message,
        initials: review.initials,
        date: formattedDate,
      };
    });

    res.json({ success: true, data: formattedReviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des avis",
      error: error.message,
    });
  }
});

// GET - Récupérer tous les avis (pour l'administration) - PROTÉGÉ
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).select("-__v");
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des avis",
      error: error.message,
    });
  }
});

// POST - Créer un nouvel avis
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, message, date } = req.body;

    // Vérifier que tous les champs requis sont présents
    if (!firstName || !lastName || !message || !date) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis",
      });
    }

    // Vérifier la longueur du message
    if (message.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Le message ne peut pas dépasser 300 caractères",
      });
    }

    // Générer les initiales
    const firstInitial = firstName.trim().charAt(0).toUpperCase();
    const lastInitial = lastName.trim().charAt(0).toUpperCase();
    const initials = `${firstInitial}.${lastInitial}`;

    // Créer l'avis
    const review = new Review({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      message: message.trim(),
      date: new Date(date),
      initials,
      status: "pending", // Par défaut, l'avis est en attente de modération
    });

    const savedReview = await review.save();

    res.status(201).json({
      success: true,
      message: "Avis soumis avec succès. Il sera publié après modération.",
      data: {
        id: savedReview._id,
        initials: savedReview.initials,
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
      message: "Erreur lors de la création de l'avis",
      error: error.message,
    });
  }
});

// PATCH - Mettre à jour le statut d'un avis (pour l'administration) - PROTÉGÉ
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Statut mis à jour avec succès",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error.message,
    });
  }
});

// DELETE - Supprimer un avis (pour l'administration) - PROTÉGÉ
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Avis supprimé avec succès",
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
