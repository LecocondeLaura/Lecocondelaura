import express from "express";
import Promotion from "../models/Promotion.js";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  BOOKING_SERVICES,
  buildPublicPromoMap,
  quoteService,
} from "../services/pricing.js";
import { sendPromoBroadcastEmail } from "../services/emailService.js";
import {
  isSmsConfigured,
  normalizeFrPhone,
  sendSms,
} from "../services/smsService.js";

const router = express.Router();

const sanitizePromo = (body = {}) => {
  const services = Array.isArray(body.services)
    ? body.services.filter((s) => BOOKING_SERVICES.includes(s))
    : [];
  const discountType = body.discountType === "amount" ? "amount" : "percent";
  let discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue < 0) discountValue = 0;
  if (discountType === "percent") discountValue = Math.min(100, discountValue);

  return {
    title: String(body.title || "").trim(),
    discountType,
    discountValue,
    services,
    applyToGiftCards: body.applyToGiftCards !== false,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    active: body.active !== false,
    message: String(body.message || "").trim(),
  };
};

router.get("/active", async (_req, res) => {
  try {
    const data = await buildPublicPromoMap();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impossible de charger les promotions",
      error: error.message,
    });
  }
});

router.get("/quote", async (req, res) => {
  try {
    const service = String(req.query.service || "");
    const giftCard = req.query.giftCard === "true";
    const quote = await quoteService(service, { giftCard });
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impossible de calculer le tarif",
      error: error.message,
    });
  }
});

router.get("/", authenticateToken, async (_req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impossible de charger les promotions",
      error: error.message,
    });
  }
});

const collectEmailRecipients = async () => {
  const appointments = await Appointment.find({
    email: { $exists: true, $ne: "" },
  }).select("nom prenom email telephone");

  const byEmail = new Map();
  appointments.forEach((apt) => {
    const email = String(apt.email || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@") || byEmail.has(email)) return;
    byEmail.set(email, {
      prenom: apt.prenom || "",
      nom: apt.nom || "",
      email,
      phone: normalizeFrPhone(apt.telephone),
    });
  });

  return Array.from(byEmail.values());
};

router.get("/recipients", authenticateToken, async (_req, res) => {
  try {
    const recipients = await collectEmailRecipients();
    res.json({
      success: true,
      data: {
        count: recipients.length,
        smsConfigured: isSmsConfigured(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impossible de compter les destinataires",
      error: error.message,
    });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const payload = sanitizePromo(req.body);
    if (!payload.title) {
      return res.status(400).json({
        success: false,
        message: "Le titre de la promotion est requis",
      });
    }
    if (!payload.services.length) {
      return res.status(400).json({
        success: false,
        message: "Choisissez au moins un soin",
      });
    }
    if (!payload.discountValue) {
      return res.status(400).json({
        success: false,
        message: "Indiquez une réduction",
      });
    }
    const promotion = await Promotion.create(payload);
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Impossible de créer la promotion",
    });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const payload = sanitizePromo(req.body);
    if (!payload.title || !payload.services.length || !payload.discountValue) {
      return res.status(400).json({
        success: false,
        message: "Titre, soins et réduction sont requis",
      });
    }
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion introuvable" });
    }
    res.json({ success: true, data: promotion });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Impossible de modifier la promotion",
    });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion introuvable" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impossible de supprimer la promotion",
      error: error.message,
    });
  }
});

router.post("/broadcast", authenticateToken, async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    if (message.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Écrivez un message d’au moins quelques mots",
      });
    }

    const testTo = String(req.body.testTo || "")
      .trim()
      .toLowerCase();
    const isTest = Boolean(testTo && testTo.includes("@"));

    let recipients;
    if (isTest) {
      recipients = [
        {
          prenom: testTo.includes("lecocondelaura")
            ? "Laura"
            : testTo.startsWith("florentin")
              ? "Florentin"
              : "bonjour",
          nom: "",
          email: testTo,
          phone: null,
        },
      ];
    } else {
      recipients = await collectEmailRecipients();
    }

    if (!recipients.length) {
      return res.status(400).json({
        success: false,
        message: "Aucune cliente avec un email",
      });
    }

    const smsConfigured = isSmsConfigured();
    let smsSent = 0;
    let smsFailed = 0;
    let emailSent = 0;
    let emailFailed = 0;

    for (const client of recipients) {
      if (smsConfigured && client.phone && !isTest) {
        try {
          await sendSms(client.phone, message);
          smsSent += 1;
        } catch (err) {
          console.error("SMS promo:", err.message);
          smsFailed += 1;
        }
      }
      if (client.email) {
        try {
          await sendPromoBroadcastEmail(client, message);
          emailSent += 1;
        } catch (err) {
          console.error("Email promo:", err.message);
          emailFailed += 1;
        }
      }
    }

    res.json({
      success: true,
      data: {
        recipients: recipients.length,
        smsConfigured,
        smsSent,
        smsFailed,
        emailSent,
        emailFailed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Impossible d’envoyer le message",
      error: error.message,
    });
  }
});

export default router;
