import express from "express";
import path from "path";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getPriceForService,
  sendAppointmentNotification,
  sendClientConfirmationEmail,
  sendGiftCardRequestEmail,
  sendGiftCardEmail,
  sendCancellationEmail,
  sendCancellationNotification,
  sendGiftCardReminderEmail,
  sendFollowUpEmail,
} from "../services/emailService.js";
import {
  generateGiftCardPDF,
  generateGiftCardPDFFromImage,
  getCustomGiftCardImage,
} from "../services/giftCardService.js";
import { isDateClosed } from "./closures.js";

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

// Retourne le lundi 00:00:00 de la semaine ISO (year, week)
function getMondayOfISOWeek(year, week) {
  const jan4 = new Date(year, 0, 4);
  const dayOfJan4 = jan4.getDay();
  const mondayOffset = dayOfJan4 === 0 ? -6 : 1 - dayOfJan4;
  const mondayOfWeek1 = new Date(year, 0, 4 + mondayOffset);
  const monday = new Date(mondayOfWeek1);
  monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// GET - Chiffre d'affaires semaine et mois (RDV payés, protégé)
// Query: weekYear, week (ISO 1-53), year, month (1-12) — défaut = période courante
router.get("/stats/revenue", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const weekYear = req.query.weekYear != null ? parseInt(req.query.weekYear, 10) : now.getFullYear();
    const weekNum = req.query.week != null ? parseInt(req.query.week, 10) : null;
    const monthYear = req.query.year != null ? parseInt(req.query.year, 10) : now.getFullYear();
    const monthNum = req.query.month != null ? parseInt(req.query.month, 10) : null;

    let startOfWeek;
    let endOfWeek;
    if (weekNum != null && !Number.isNaN(weekNum) && weekNum >= 1 && weekNum <= 53) {
      startOfWeek = getMondayOfISOWeek(weekYear, weekNum);
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
    } else {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + mondayOffset);
      startOfWeek.setHours(0, 0, 0, 0);
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
    }

    const month = monthNum != null && !Number.isNaN(monthNum) && monthNum >= 1 && monthNum <= 12
      ? monthNum - 1
      : now.getMonth();
    const year = !Number.isNaN(monthYear) ? monthYear : now.getFullYear();
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const paidFilter = {
      paiementEffectue: true,
      status: { $in: ["pending", "confirmed", "completed"] },
      carteCadeaux: false,
    };

    const [appointmentsWeek, appointmentsMonth] = await Promise.all([
      Appointment.find({
        ...paidFilter,
        date: { $gte: startOfWeek, $lte: endOfWeek },
      }).select("service"),
      Appointment.find({
        ...paidFilter,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }).select("service"),
    ]);

    const sumRevenue = (list) =>
      list.reduce((acc, apt) => acc + (getPriceForService(apt.service) || 0), 0);

    res.json({
      success: true,
      data: {
        week: sumRevenue(appointmentsWeek),
        month: sumRevenue(appointmentsMonth),
        weekStart: startOfWeek.toISOString().slice(0, 10),
        weekEnd: endOfWeek.toISOString().slice(0, 10),
        monthLabel: `${year}-${String(month + 1).padStart(2, "0")}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul du chiffre d'affaires",
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
      "11:00",
      "14:00",
      "16:00",
      "18:00",
    ];

    // Si le salon est fermé (congés/fermeture) ce jour-là : aucun créneau
    const closed = await isDateClosed(date);
    if (closed) {
      return res.json({
        success: true,
        data: {
          date,
          availableTimes: [],
          reservedTimes: [],
          reservedAppointments: [],
          isClosed: true,
        },
      });
    }

    // Récupérer les rendez-vous pour cette date
    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const reservedAppointments = await Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ["pending", "confirmed", "completed"] },
    }).select("heure service");

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
        reservedAppointments: reservedAppointments,
        isClosed: false,
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

    if (!carteCadeaux && date) {
      // Vérifier si le salon est fermé (congés / fermeture) ce jour-là
      const closed = await isDateClosed(date);
      if (closed) {
        return res.status(400).json({
          success: false,
          message:
            "Le salon est fermé à cette date. Veuillez choisir un autre jour.",
        });
      }

      // Vérifier si le créneau est disponible
      const isAvailable = await Appointment.isTimeSlotAvailable(date, heure, service);
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
    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
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

// PATCH - Mettre à jour le paiement : moyen (espèces/chèque) et/ou paiement effectué (protégé)
router.patch("/:id/paiement", authenticateToken, async (req, res) => {
  try {
    const { paiementEffectue, moyenPaiement } = req.body;
    const update = {};

    if (moyenPaiement !== undefined) {
      if (moyenPaiement === null || moyenPaiement === "") {
        update.moyenPaiement = null;
        update.paiementEffectue = false;
      } else if (["especes", "cheque"].includes(moyenPaiement)) {
        update.moyenPaiement = moyenPaiement;
        update.paiementEffectue = true;
      } else {
        return res.status(400).json({
          success: false,
          message: "moyenPaiement doit être 'especes', 'cheque' ou vide",
        });
      }
    }

    if (paiementEffectue !== undefined) {
      let paiementEffectueBool = paiementEffectue;
      if (typeof paiementEffectue === "string") {
        paiementEffectueBool = paiementEffectue === "true";
      } else if (typeof paiementEffectue === "number") {
        paiementEffectueBool = paiementEffectue === 1;
      } else if (typeof paiementEffectue !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Le champ paiementEffectue doit être un booléen",
        });
      }
      update.paiementEffectue = paiementEffectueBool;
      if (!paiementEffectueBool) update.moyenPaiement = null;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      update,
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
      message: "Paiement mis à jour",
      data: appointment,
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

      // Pièce jointe : PDF personnalisé (image + texte) ou PDF généré par défaut
      const customImage = getCustomGiftCardImage();
      let attachment;
      if (customImage) {
        const pdfBuffer = await generateGiftCardPDFFromImage(
          appointment,
          cardCode,
          customImage.buffer,
          customImage.width,
          customImage.height
        );
        attachment = {
          buffer: pdfBuffer,
          filename: `Carte_Cadeau_${cardCode}.pdf`,
          contentType: "application/pdf",
        };
      } else {
        const { buffer: pdfBuffer, code: generatedCode } =
          await generateGiftCardPDF(appointment);
        const finalCode = generatedCode || cardCode;
        appointment.codeCarteCadeau = finalCode;
        attachment = {
          buffer: pdfBuffer,
          filename: `Carte_Cadeau_${finalCode}.pdf`,
          contentType: "application/pdf",
        };
      }
      const finalCode = appointment.codeCarteCadeau;

      // Envoyer l'email avec la carte cadeau (image ou PDF)
      await sendGiftCardEmail(appointment, attachment, finalCode);

      // Marquer la carte cadeau comme envoyée
      appointment.carteCadeauEnvoyee = true;
      appointment.dateEnvoiCarte = new Date();
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

// PATCH - Marquer une carte cadeau comme utilisée (protégé)
router.patch("/:id/carte-utilisee", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { carteCadeauUtilisee: true },
      { new: true, runValidators: true }
    ).select("-__v");

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

    res.json({
      success: true,
      message: "Carte cadeau marquée comme utilisée",
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

// DELETE - Supprimer un rendez-vous (protégé)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé",
      });
    }

    // Ne pas supprimer les cartes cadeaux, seulement les rendez-vous
    if (appointment.carteCadeaux) {
      return res.status(400).json({
        success: false,
        message: "Les cartes cadeaux ne peuvent pas être supprimées",
      });
    }

    // Envoyer l'email d'annulation au client
    sendCancellationEmail(appointment).catch((error) => {
      console.error(
        "Erreur lors de l'envoi de l'email d'annulation (non bloquant):",
        error
      );
    });

    // Envoyer une notification d'annulation au propriétaire du salon
    sendCancellationNotification(appointment).catch((error) => {
      console.error(
        "Erreur lors de l'envoi de la notification d'annulation (non bloquant):",
        error
      );
    });

    // Supprimer le rendez-vous
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Rendez-vous supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du rendez-vous",
      error: error.message,
    });
  }
});

// GET - Récupérer les cartes cadeaux expirant bientôt (protégé)
router.get("/gift-cards/expiring-soon", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    // Récupérer les cartes cadeaux envoyées qui approchent de l'expiration
    // (entre 3 et 6 mois après l'envoi)
    const giftCards = await Appointment.find({
      carteCadeaux: true,
      carteCadeauEnvoyee: true,
    }).sort({ updatedAt: 1 });

    // Filtrer celles qui sont entre 3 et 6 mois après l'envoi
    const expiringSoon = giftCards.filter((card) => {
      const cardSentDate =
        card.dateEnvoiCarte ||
        (card.carteCadeauEnvoyee ? card.updatedAt : null) ||
        card.createdAt;
      const expirationDate = new Date(cardSentDate);
      expirationDate.setMonth(expirationDate.getMonth() + 6);

      // Vérifier si on est entre 3 et 6 mois après l'envoi
      const threeMonthsAfterSent = new Date(cardSentDate);
      threeMonthsAfterSent.setMonth(threeMonthsAfterSent.getMonth() + 3);

      return now >= threeMonthsAfterSent && now <= expirationDate;
    });

    // Ajouter les informations calculées
    const cardsWithExpiration = expiringSoon.map((card) => {
      const cardSentDate =
        card.dateEnvoiCarte ||
        (card.carteCadeauEnvoyee ? card.updatedAt : null) ||
        card.createdAt;
      const expirationDate = new Date(cardSentDate);
      expirationDate.setMonth(expirationDate.getMonth() + 6);

      const daysUntilExpiration = Math.ceil(
        (expirationDate - now) / (1000 * 60 * 60 * 24)
      );

      return {
        ...card.toObject(),
        expirationDate,
        daysUntilExpiration,
      };
    });

    res.json({
      success: true,
      data: cardsWithExpiration,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des cartes expirant bientôt:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération",
      error: error.message,
    });
  }
});

// POST - Envoyer une relance pour une carte cadeau (protégé)
router.post("/:id/send-reminder", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Carte cadeau non trouvée",
      });
    }

    if (!appointment.carteCadeaux || !appointment.carteCadeauEnvoyee) {
      return res.status(400).json({
        success: false,
        message: "Ce n'est pas une carte cadeau envoyée",
      });
    }

    // Envoyer l'email de relance
    await sendGiftCardReminderEmail(appointment);

    // Marquer la relance comme envoyée
    appointment.relanceEnvoyee = true;
    appointment.dateRelance = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: "Email de relance envoyé avec succès",
      data: appointment,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la relance:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de la relance",
      error: error.message,
    });
  }
});

// POST - Envoyer un email de relance de test (protégé)
router.post(
  "/gift-cards/test-reminder",
  authenticateToken,
  async (req, res) => {
    try {
      // Créer un objet de test avec des données fictives
      const testAppointment = {
        prenom: "Test",
        nom: "Client",
        email: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
        service: "Head Spa Premium",
        codeCarteCadeau: "CC-TEST-1234",
        carteCadeauEnvoyee: true,
        dateEnvoiCarte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Il y a 3 mois
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      };

      // Envoyer l'email de relance de test
      await sendGiftCardReminderEmail(testAppointment);

      res.json({
        success: true,
        message: "Email de relance de test envoyé avec succès",
        testEmail: testAppointment.email,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi de l'email de test",
        error: error.message,
      });
    }
  }
);

// POST - Envoyer un email de suivi pour un rendez-vous (protégé)
router.post("/:id/send-followup", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé",
      });
    }

    if (appointment.carteCadeaux) {
      return res.status(400).json({
        success: false,
        message: "Ce n'est pas un rendez-vous",
      });
    }

    if (!appointment.date) {
      return res.status(400).json({
        success: false,
        message: "Ce rendez-vous n'a pas de date",
      });
    }

    // Envoyer l'email de suivi
    await sendFollowUpEmail(appointment);

    // Marquer l'email de suivi comme envoyé
    appointment.suiviEmailEnvoye = true;
    appointment.dateSuiviEmail = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: "Email de suivi envoyé avec succès",
      data: appointment,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de suivi:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'email de suivi",
      error: error.message,
    });
  }
});

// POST - Envoyer un email de suivi de test (protégé)
router.post("/test-followup", authenticateToken, async (req, res) => {
  try {
    // Créer un objet de test avec des données fictives
    const testAppointment = {
      prenom: "Test",
      nom: "Client",
      email: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
      service: "Head Spa Premium",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      heure: "14:00",
      carteCadeaux: false,
    };

    // Envoyer l'email de suivi de test
    await sendFollowUpEmail(testAppointment);

    res.json({
      success: true,
      message: "Email de suivi de test envoyé avec succès",
      testEmail: testAppointment.email,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'email de test",
      error: error.message,
    });
  }
});

export default router;
