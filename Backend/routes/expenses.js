import express from "express";
import Expense from "../models/Expense.js";
import Appointment from "../models/Appointment.js";
import MobileQuote from "../models/MobileQuote.js";
import { authenticateToken } from "../middleware/auth.js";
import { getPriceForService } from "../services/emailService.js";

const router = express.Router();

const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getYearRange = (year) => {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
};

const sumRevenue = (list) =>
  list.reduce((acc, apt) => acc + (getPriceForService(apt.service) || 0), 0);

const mobileQuoteRevenueDate = (q) => {
  if (Array.isArray(q.joursIntervention) && q.joursIntervention.length) {
    return q.joursIntervention[q.joursIntervention.length - 1];
  }
  return q.dateFinMission || q.dateDebutMission || null;
};

const inRange = (date, start, end) => {
  if (!date) return false;
  const t = new Date(date).getTime();
  return t >= start.getTime() && t <= end.getTime();
};

/** Solde final hors acompte déjà compté */
const mobileFinalAmount = (q) => {
  const total = q.montant || 0;
  if (!q.paiementEffectue || total <= 0) return 0;
  const acompte =
    q.acompteRecuAt && q.montantAcompte > 0 ? q.montantAcompte : 0;
  return Math.max(0, total - acompte);
};

const computeRevenue = async (start, end) => {
  const paidMassageFilter = {
    paiementEffectue: true,
    status: { $in: ["pending", "confirmed", "completed"] },
    carteCadeaux: false,
    moyenPaiement: { $ne: "carte_cadeaux" },
  };
  const paidGiftCardFilter = {
    paiementEffectue: true,
    carteCadeaux: true,
  };

  const [massages, giftCards, mobileQuotes] = await Promise.all([
    Appointment.find({
      ...paidMassageFilter,
      date: { $gte: start, $lte: end },
    }).select("service date prenom nom moyenPaiement"),
    Appointment.find({
      ...paidGiftCardFilter,
      createdAt: { $gte: start, $lte: end },
    }).select("service createdAt prenom nom codeCarteCadeau"),
    MobileQuote.find({
      $or: [
        { paiementEffectue: true, montant: { $gt: 0 } },
        { acompteRecuAt: { $ne: null }, montantAcompte: { $gt: 0 } },
      ],
    }).select(
      "montant montantAcompte acompteRecuAt paiementEffectue dateDebutMission dateFinMission joursIntervention entreprise contactNom prenom nom lieu moyenPaiement"
    ),
  ]);

  const mobileAcomptes = mobileQuotes.filter(
    (q) =>
      q.acompteRecuAt &&
      q.montantAcompte > 0 &&
      inRange(q.acompteRecuAt, start, end)
  );

  const mobileFinals = mobileQuotes.filter((q) => {
    if (mobileFinalAmount(q) <= 0) return false;
    return inRange(mobileQuoteRevenueDate(q), start, end);
  });

  const massageRevenue = sumRevenue(massages);
  const giftCardsRevenue = sumRevenue(giftCards);
  const mobileAcompteRevenue = mobileAcomptes.reduce(
    (acc, q) => acc + (q.montantAcompte || 0),
    0
  );
  const mobileFinalRevenue = mobileFinals.reduce(
    (acc, q) => acc + mobileFinalAmount(q),
    0
  );
  const mobileRevenue = mobileAcompteRevenue + mobileFinalRevenue;

  return {
    massages: massageRevenue,
    giftCards: giftCardsRevenue,
    mobile: mobileRevenue,
    total: massageRevenue + giftCardsRevenue + mobileRevenue,
    massageItems: massages,
    giftCardItems: giftCards,
    mobileAcompteItems: mobileAcomptes,
    mobileItems: mobileFinals,
  };
};

// GET - Dépenses + résumé CA + mouvements (gains / dépenses) pour le tableau
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const monthParam = req.query.month;
    const month =
      monthParam != null && monthParam !== ""
        ? parseInt(monthParam, 10)
        : null;

    let start;
    let end;
    let periodLabel;

    if (month != null && month >= 1 && month <= 12) {
      ({ start, end } = getMonthRange(year, month));
      periodLabel = `${year}-${String(month).padStart(2, "0")}`;
    } else {
      ({ start, end } = getYearRange(year));
      periodLabel = String(year);
    }

    const [expenses, revenue] = await Promise.all([
      Expense.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      computeRevenue(start, end),
    ]);

    const totalExpenses = expenses.reduce(
      (acc, e) => acc + (e.montant || 0),
      0
    );

    // Lignes du tableau : GAIN (soins, cartes, mobile) + DÉPENSE
    const movements = [];

    revenue.massageItems.forEach((apt) => {
      const amount = getPriceForService(apt.service) || 0;
      if (!amount) return;
      movements.push({
        id: `soin-${apt._id}`,
        type: "gain",
        source: "soin",
        date: apt.date,
        label: apt.service || "Soin",
        detail: `${apt.prenom || ""} ${apt.nom || ""}`.trim() || "Client",
        montant: amount,
        editable: false,
      });
    });

    revenue.giftCardItems.forEach((apt) => {
      const amount = getPriceForService(apt.service) || 0;
      if (!amount) return;
      movements.push({
        id: `carte-${apt._id}`,
        type: "gain",
        source: "carte_cadeau",
        date: apt.createdAt,
        label: "Carte cadeau",
        detail:
          `${apt.prenom || ""} ${apt.nom || ""}`.trim() +
          (apt.codeCarteCadeau ? ` · ${apt.codeCarteCadeau}` : ""),
        montant: amount,
        editable: false,
      });
    });

    revenue.mobileAcompteItems.forEach((q) => {
      movements.push({
        id: `mobile-acompte-${q._id}`,
        type: "gain",
        source: "head_spa_mobile",
        date: q.acompteRecuAt,
        label: "Acompte Head Spa Mobile",
        detail:
          (q.entreprise ||
            `${q.prenom || ""} ${q.nom || ""}`.trim() ||
            q.contactNom ||
            "") + (q.lieu ? ` · ${q.lieu}` : ""),
        montant: q.montantAcompte || 0,
        editable: false,
      });
    });

    revenue.mobileItems.forEach((q) => {
      const amount = mobileFinalAmount(q);
      if (!amount) return;
      movements.push({
        id: `mobile-${q._id}`,
        type: "gain",
        source: "head_spa_mobile",
        date: mobileQuoteRevenueDate(q),
        label: q.acompteRecuAt
          ? "Solde Head Spa Mobile"
          : "Head Spa Mobile",
        detail:
          (q.entreprise ||
            `${q.prenom || ""} ${q.nom || ""}`.trim() ||
            q.contactNom ||
            "") + (q.lieu ? ` · ${q.lieu}` : ""),
        montant: amount,
        editable: false,
      });
    });

    expenses.forEach((e) => {
      movements.push({
        id: e._id.toString(),
        type: "depense",
        source: "depense",
        date: e.date,
        label: e.nom,
        detail: e.categorie || e.notes || "",
        montant: e.montant || 0,
        editable: true,
        expense: e,
      });
    });

    movements.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        periodLabel,
        year,
        month: month || null,
        revenue: {
          massages: revenue.massages,
          giftCards: revenue.giftCards,
          mobile: revenue.mobile,
          total: revenue.total,
        },
        totalExpenses,
        balance: revenue.total - totalExpenses,
        expenses,
        movements,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des comptes",
      error: error.message,
    });
  }
});

// GET - Toutes les dépenses (optionnel)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des dépenses",
      error: error.message,
    });
  }
});

// POST - Créer une dépense
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nom, montant, date, categorie, notes } = req.body;

    if (!nom || montant == null || !date) {
      return res.status(400).json({
        success: false,
        message: "Nom, montant et date sont requis",
      });
    }

    const amount = Number(montant);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Montant invalide",
      });
    }

    const expense = await Expense.create({
      nom: String(nom).trim(),
      montant: amount,
      date: new Date(date),
      categorie: categorie ? String(categorie).trim() : "",
      notes: notes ? String(notes).trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Dépense enregistrée",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la dépense",
      error: error.message,
    });
  }
});

// PUT - Modifier une dépense
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Dépense non trouvée",
      });
    }

    const { nom, montant, date, categorie, notes } = req.body;

    if (nom !== undefined) expense.nom = String(nom).trim();
    if (montant !== undefined) {
      const amount = Number(montant);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Montant invalide",
        });
      }
      expense.montant = amount;
    }
    if (date !== undefined) expense.date = new Date(date);
    if (categorie !== undefined) expense.categorie = String(categorie).trim();
    if (notes !== undefined) expense.notes = String(notes).trim();

    await expense.save();

    res.json({
      success: true,
      message: "Dépense mise à jour",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error.message,
    });
  }
});

// DELETE - Supprimer une dépense
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Dépense non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Dépense supprimée",
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
