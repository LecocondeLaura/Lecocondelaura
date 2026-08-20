import express from "express";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET - Récupérer les compteurs de notifications
router.get("/counts", authenticateToken, async (req, res) => {
  try {
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
      carteCadeaux: false,
    });

    const pendingGiftCards = await Appointment.countDocuments({
      carteCadeaux: true,
      carteCadeauEnvoyee: false,
    });

    res.json({
      success: true,
      data: {
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
