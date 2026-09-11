import express from "express";
import MobileQuote from "../models/MobileQuote.js";
import Closure from "../models/Closure.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  sendMobileQuoteNotification,
  sendMobileQuoteClientConfirmation,
} from "../services/emailService.js";

const router = express.Router();

const TYPE_LABELS = {
  entreprise: "Entreprise",
  hotel_spa: "Hôtel & Spa",
  ephad: "EHPAD",
};

const addHistory = (quote, entry) => {
  quote.history = quote.history || [];
  quote.history.unshift({
    ...entry,
    at: entry.at || new Date(),
  });
};

const parseDateOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Parse YYYY-MM-DD → Date midi UTC (évite décalage jour) */
const parseDayString = (value) => {
  if (!value) return null;
  const str = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const parseJoursIntervention = (raw) => {
  if (!Array.isArray(raw)) return [];
  const days = raw
    .map((v) => parseDayString(v) || parseDateOrNull(v))
    .filter(Boolean);
  const keys = new Set();
  const unique = [];
  for (const d of days) {
    const key = d.toISOString().slice(0, 10);
    if (keys.has(key)) continue;
    keys.add(key);
    unique.push(d);
  }
  unique.sort((a, b) => a - b);
  return unique;
};

const quoteEntreprise = (q) =>
  (q.entreprise || q.nom || "").trim() || "Établissement";

const quoteContact = (q) =>
  (q.contactNom || `${q.prenom || ""} ${q.nom || ""}`.trim()).trim();

const acompteFromTarif = (montant) =>
  Math.round(Number(montant) * 0.3 * 100) / 100;

const clearLinkedClosures = async (quote) => {
  const ids = [
    ...(quote.linkedClosureIds || []),
    quote.linkedClosureId,
  ].filter(Boolean);
  if (ids.length) {
    await Closure.deleteMany({ _id: { $in: ids } });
  }
  quote.linkedClosureIds = [];
  quote.linkedClosureId = null;
};

/** Une fermeture par jour d'intervention → agenda + blocage formulaire RDV */
const syncMissionClosures = async (quote) => {
  const days = Array.isArray(quote.joursIntervention)
    ? quote.joursIntervention
    : [];

  // Fallback legacy plage début/fin
  let dayList = [...days];
  if (
    dayList.length === 0 &&
    quote.dateDebutMission &&
    quote.devisSigneAt
  ) {
    const start = new Date(quote.dateDebutMission);
    const end = new Date(quote.dateFinMission || quote.dateDebutMission);
    const cur = new Date(start);
    cur.setUTCHours(12, 0, 0, 0);
    while (cur <= end) {
      dayList.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }

  await clearLinkedClosures(quote);

  if (dayList.length === 0) return;

  const entreprise = quoteEntreprise(quote);
  const ville = (quote.lieu || "").trim();
  const label = [`Head Spa Mobile`, entreprise, ville]
    .filter(Boolean)
    .join(" · ");

  const createdIds = [];
  for (const day of dayList) {
    const d = new Date(day);
    d.setUTCHours(12, 0, 0, 0);
    const created = await Closure.create({
      startDate: d,
      endDate: d,
      label,
      visibleToClients: false,
      timeScope: "full",
      blockedSlots: [],
      kind: "head_spa_mobile",
    });
    createdIds.push(created._id);
  }
  quote.linkedClosureIds = createdIds;
  quote.linkedClosureId = createdIds[0] || null;

  // Sync legacy fields for revenue helpers
  if (dayList.length) {
    quote.dateDebutMission = dayList[0];
    quote.dateFinMission = dayList[dayList.length - 1];
  }
};

// POST - Demande de devis publique
router.post("/", async (req, res) => {
  try {
    const {
      entreprise,
      typeEtablissement,
      contactNom,
      email,
      telephone,
      lieu,
      dateSouhaitee,
      nombrePersonnes,
      message,
      // legacy
      nom,
      prenom,
    } = req.body;

    const entrepriseVal = String(entreprise || nom || "").trim();
    const contactVal = String(contactNom || prenom || "").trim();
    const typeVal = ["entreprise", "hotel_spa", "ephad"].includes(
      typeEtablissement
    )
      ? typeEtablissement
      : "";

    if (
      !entrepriseVal ||
      !typeVal ||
      !contactVal ||
      !email ||
      !telephone ||
      !lieu
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Entreprise, type, contact, email, téléphone et ville sont requis",
      });
    }

    const quote = await MobileQuote.create({
      entreprise: entrepriseVal,
      typeEtablissement: typeVal,
      contactNom: contactVal,
      nom: entrepriseVal,
      prenom: contactVal,
      email: String(email).trim().toLowerCase(),
      telephone: String(telephone).trim(),
      lieu: String(lieu).trim(),
      dateSouhaitee: dateSouhaitee ? String(dateSouhaitee).trim() : "",
      nombrePersonnes: nombrePersonnes
        ? String(nombrePersonnes).trim()
        : "",
      message: message ? String(message).trim() : "",
      history: [
        {
          type: "created",
          label: "Demande reçue via le site",
          detail: `${TYPE_LABELS[typeVal] || typeVal} · ${entrepriseVal}`,
          at: new Date(),
        },
      ],
    });

    sendMobileQuoteNotification(quote).catch(() => {});
    sendMobileQuoteClientConfirmation(quote).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Demande de devis envoyée",
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de la demande",
      error: error.message,
    });
  }
});

// GET - Liste (protégé)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const quotes = await MobileQuote.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des demandes",
      error: error.message,
    });
  }
});

// PATCH - Statut simple
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "contacted", "quoted", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    const quote = await MobileQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    quote.status = status;
    addHistory(quote, {
      type: "status",
      label: `Statut → ${status}`,
    });
    await quote.save();

    res.json({ success: true, message: "Statut mis à jour", data: quote });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error.message,
    });
  }
});

// POST - Marquer devis envoyé
router.post("/:id/devis-envoye", authenticateToken, async (req, res) => {
  try {
    const quote = await MobileQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    const now = new Date();
    quote.devisEnvoyeAt = now;
    quote.status = "quoted";
    addHistory(quote, {
      type: "devis_envoye",
      label: "Devis envoyé",
      detail: `Envoyé à ${now.toLocaleString("fr-FR")}`,
      at: now,
    });
    await quote.save();

    res.json({
      success: true,
      message: "Devis marqué comme envoyé",
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

// POST - Devis signé
router.post("/:id/devis-signe", authenticateToken, async (req, res) => {
  try {
    const quote = await MobileQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    const now = new Date();
    quote.devisSigneAt = now;
    addHistory(quote, {
      type: "devis_signe",
      label: "Devis signé",
      detail: `Signé le ${now.toLocaleString("fr-FR")}`,
      at: now,
    });

    await syncMissionClosures(quote);
    await quote.save();

    res.json({
      success: true,
      message: "Devis marqué comme signé",
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

// POST - Acompte reçu
router.post("/:id/acompte-recu", authenticateToken, async (req, res) => {
  try {
    const quote = await MobileQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    let amount =
      req.body.montantAcompte != null && req.body.montantAcompte !== ""
        ? Number(req.body.montantAcompte)
        : quote.montantAcompte;

    if (
      (amount == null || Number.isNaN(amount)) &&
      quote.montant != null &&
      quote.montant > 0
    ) {
      amount = acompteFromTarif(quote.montant);
    }

    if (amount == null || Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Indiquez d'abord le tarif (acompte = 30 %)",
      });
    }

    const now = new Date();
    quote.montantAcompte = amount;
    quote.acompteRecuAt = now;
    addHistory(quote, {
      type: "acompte_recu",
      label: "Acompte reçu (30 %)",
      detail: `Acompte de ${amount} € reçu le ${now.toLocaleString("fr-FR")}`,
      montant: amount,
      at: now,
    });
    await quote.save();

    res.json({
      success: true,
      message: "Acompte enregistré",
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur",
      error: error.message,
    });
  }
});

// PATCH - Détails mission / paiement
router.patch("/:id/mission", authenticateToken, async (req, res) => {
  try {
    const quote = await MobileQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    const {
      montant,
      moyenPaiement,
      paiementEffectue,
      dateDebutMission,
      dateFinMission,
      joursIntervention,
      notesInternes,
      status,
      montantAcompte,
    } = req.body;

    if (montant !== undefined) {
      if (montant === null || montant === "") {
        quote.montant = null;
        if (!quote.acompteRecuAt) quote.montantAcompte = null;
      } else {
        const amount = Number(montant);
        if (Number.isNaN(amount) || amount < 0) {
          return res.status(400).json({
            success: false,
            message: "Montant invalide",
          });
        }
        quote.montant = amount;
        // Auto 30 % si acompte pas encore encaissé
        if (!quote.acompteRecuAt) {
          quote.montantAcompte = acompteFromTarif(amount);
        }
      }
    }

    if (montantAcompte !== undefined && !quote.acompteRecuAt) {
      if (montantAcompte === null || montantAcompte === "")
        quote.montantAcompte = null;
      else {
        const amount = Number(montantAcompte);
        if (Number.isNaN(amount) || amount < 0) {
          return res.status(400).json({
            success: false,
            message: "Montant acompte invalide",
          });
        }
        quote.montantAcompte = amount;
      }
    }

    if (moyenPaiement !== undefined) {
      if (moyenPaiement === null || moyenPaiement === "") {
        quote.moyenPaiement = null;
        quote.paiementEffectue = false;
      } else if (
        ["especes", "cheque", "virement", "carte_cadeaux"].includes(
          moyenPaiement
        )
      ) {
        quote.moyenPaiement = moyenPaiement;
        quote.paiementEffectue = true;
        addHistory(quote, {
          type: "paiement",
          label: "Solde / paiement enregistré",
          detail: `Moyen : ${moyenPaiement}`,
          montant: quote.montant,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Moyen de paiement invalide",
        });
      }
    }

    if (paiementEffectue !== undefined) {
      quote.paiementEffectue = Boolean(paiementEffectue);
      if (!quote.paiementEffectue) quote.moyenPaiement = null;
    }

    if (joursIntervention !== undefined) {
      quote.joursIntervention = parseJoursIntervention(joursIntervention);
      if (quote.joursIntervention.length) {
        quote.dateDebutMission = quote.joursIntervention[0];
        quote.dateFinMission =
          quote.joursIntervention[quote.joursIntervention.length - 1];
      } else {
        quote.dateDebutMission = null;
        quote.dateFinMission = null;
      }
    } else {
      if (dateDebutMission !== undefined) {
        quote.dateDebutMission = parseDateOrNull(dateDebutMission);
      }
      if (dateFinMission !== undefined) {
        quote.dateFinMission = parseDateOrNull(dateFinMission);
      }
    }

    if (notesInternes !== undefined) {
      quote.notesInternes = String(notesInternes).trim();
    }
    if (status !== undefined) {
      if (!["pending", "contacted", "quoted", "closed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Statut invalide",
        });
      }
      quote.status = status;
    }

    // Bloquer l'agenda dès qu'il y a des jours (ou après devis signé)
    await syncMissionClosures(quote);
    await quote.save();

    res.json({
      success: true,
      message: "Mission mise à jour",
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la mission",
      error: error.message,
    });
  }
});

// DELETE
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const quote = await MobileQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    await clearLinkedClosures(quote);
    await MobileQuote.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Demande supprimée" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
});

export default router;
