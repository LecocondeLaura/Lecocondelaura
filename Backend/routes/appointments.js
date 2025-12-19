import express from "express";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  sendAppointmentNotification,
  sendClientConfirmationEmail,
  sendGiftCardRequestEmail,
  sendGiftCardEmail,
} from "../services/emailService.js";
import { generateGiftCardPDF } from "../services/giftCardService.js";

const router = express.Router();

// GET - Récupérer tous les rendez-vous (protégé)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: 1, heure: 1 })
      .select("-__v");
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rendez-vous",
      error: error.message,
    });
  }
});

// GET - Récupérer les horaires disponibles pour une date
router.get("/available/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const allTimes = [
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    // Récupérer les rendez-vous pour cette date
    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const reservedAppointments = await Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ["pending", "confirmed"] },
    }).select("heure");

    const reservedTimes = reservedAppointments.map((apt) => apt.heure);
    const availableTimes = allTimes.filter(
      (time) => !reservedTimes.includes(time)
    );

    res.json({
      success: true,
      data: {
        date: date,
        availableTimes: availableTimes,
        reservedTimes: reservedTimes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des horaires disponibles",
      error: error.message,
    });
  }
});

// POST - Créer un nouveau rendez-vous
router.post("/", async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      service,
      date,
      heure,
      message,
      carteCadeaux,
    } = req.body;

    // Vérifier que tous les champs requis sont présents
    if (!nom || !prenom || !email || !telephone || !service) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs nom, prénom, email, téléphone et service sont requis",
      });
    }

    // Si ce n'est pas une carte cadeaux, date et heure sont requis
    if (!carteCadeaux && (!date || !heure)) {
      return res.status(400).json({
        success: false,
        message: "La date et l'heure sont requises pour un rendez-vous",
      });
    }

    // Vérifier que ce n'est pas un dimanche (seulement pour les rendez-vous)
    if (!carteCadeaux && date) {
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay(); // 0 = dimanche
      if (dayOfWeek === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Le dimanche n'est pas disponible. Veuillez choisir un autre jour.",
        });
      }

      // Vérifier si le créneau est disponible
      const isAvailable = await Appointment.isTimeSlotAvailable(date, heure);
      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: "Ce créneau n'est plus disponible",
        });
      }
    }

    // Créer le rendez-vous/carte cadeaux
    const appointmentData = {
      nom,
      prenom,
      email,
      telephone,
      service,
      message: message || "",
      status: "pending",
      carteCadeaux: carteCadeaux || false,
    };

    // Ajouter date et heure seulement si ce n'est pas une carte cadeaux
    if (!carteCadeaux) {
      appointmentData.date = new Date(date);
      appointmentData.heure = heure;
    }

    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    // Envoyer les emails appropriés
    if (carteCadeaux) {
      // Envoyer l'email avec le RIB (sans PDF)
      sendGiftCardRequestEmail(savedAppointment).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de l'email de demande de carte cadeau (non bloquant):",
          error
        );
      });

      // Envoyer une notification au propriétaire du salon
      sendAppointmentNotification(savedAppointment).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de l'email de notification (non bloquant):",
          error
        );
      });
    } else {
      // Envoyer un email de confirmation au client
      sendClientConfirmationEmail(savedAppointment).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de l'email de confirmation (non bloquant):",
          error
        );
      });

      // Envoyer une notification au propriétaire du salon
      sendAppointmentNotification(savedAppointment).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de l'email de notification (non bloquant):",
          error
        );
      });
    }

    res.status(201).json({
      success: true,
      message: carteCadeaux
        ? "Demande de carte cadeaux créée avec succès"
        : "Rendez-vous créé avec succès",
      data: savedAppointment,
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

// GET - Récupérer un rendez-vous par ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).select(
      "-__v"
    );
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé",
      });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du rendez-vous",
      error: error.message,
    });
  }
});

// PATCH - Mettre à jour le statut d'un rendez-vous
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Statut mis à jour avec succès",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error.message,
    });
  }
});

// PATCH - Marquer le paiement comme effectué pour une carte cadeau (protégé)
router.patch("/:id/paiement", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé",
      });
    }

    if (!appointment.carteCadeaux) {
      return res.status(400).json({
        success: false,
        message: "Ce rendez-vous n'est pas une carte cadeau",
      });
    }

    appointment.paiementEffectue = true;
    const updatedAppointment = await appointment.save();

    res.json({
      success: true,
      message: "Paiement marqué comme effectué",
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du paiement",
      error: error.message,
    });
  }
});

// POST - Envoyer la carte cadeau au client (protégé)
router.post(
  "/:id/envoyer-carte-cadeau",
  authenticateToken,
  async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Rendez-vous non trouvé",
        });
      }

      if (!appointment.carteCadeaux) {
        return res.status(400).json({
          success: false,
          message: "Ce rendez-vous n'est pas une carte cadeau",
        });
      }

      if (!appointment.paiementEffectue) {
        return res.status(400).json({
          success: false,
          message:
            "Le paiement doit être effectué avant d'envoyer la carte cadeau",
        });
      }

      if (appointment.carteCadeauEnvoyee) {
        return res.status(400).json({
          success: false,
          message: "La carte cadeau a déjà été envoyée",
        });
      }

      // Générer le code de la carte cadeau s'il n'existe pas
      let cardCode = appointment.codeCarteCadeau;
      if (!cardCode) {
        cardCode = `CC-${Date.now().toString(36).toUpperCase()}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}`;
        appointment.codeCarteCadeau = cardCode;
      }

      // Générer le PDF de la carte cadeau
      const { buffer: pdfBuffer, code: generatedCode } =
        await generateGiftCardPDF(appointment);

      // Utiliser le code généré ou celui existant
      const finalCode = generatedCode || cardCode;
      appointment.codeCarteCadeau = finalCode;

      // Envoyer l'email avec la carte cadeau
      await sendGiftCardEmail(appointment, pdfBuffer, finalCode);

      // Marquer la carte cadeau comme envoyée
      appointment.carteCadeauEnvoyee = true;
      const updatedAppointment = await appointment.save();

      res.json({
        success: true,
        message: "Carte cadeau envoyée avec succès",
        data: updatedAppointment,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la carte cadeau:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi de la carte cadeau",
        error: error.message,
      });
    }
  }
);

export default router;
