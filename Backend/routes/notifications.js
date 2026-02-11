import express from "express";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET - Récupérer les compteurs de notifications
router.get("/counts", authenticateToken, async (req, res) => {
  try {
    // Compter les avis en attente
    const pendingReviews = await Review.countDocuments({
      status: "pending",
    });

    // Compter les rendez-vous en attente (non confirmés et non annulés)
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
      carteCadeaux: false,
    });

    // Compter les cartes cadeaux non envoyées (carteCadeaux: true et carteCadeauEnvoyee: false)
    const pendingGiftCards = await Appointment.countDocuments({
      carteCadeaux: true,
      carteCadeauEnvoyee: false,
    });

    res.json({
      success: true,
      data: {
        reviews: pendingReviews,
        appointments: pendingAppointments,
        giftCards: pendingGiftCards,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des notifications",
      error: error.message,
    });
  }
});

export default router;

