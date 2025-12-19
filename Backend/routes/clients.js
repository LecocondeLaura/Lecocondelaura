import express from "express";
import Client from "../models/Client.js";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET - Récupérer tous les clients avec leurs rendez-vous
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Récupérer tous les rendez-vous pour extraire les clients uniques
    const appointments = await Appointment.find({
      email: { $exists: true, $ne: "" },
    }).select("nom prenom email telephone");

    // Créer un Map pour stocker les clients uniques par email
    const clientsMap = new Map();

    // Ajouter les clients depuis les rendez-vous
    appointments.forEach((apt) => {
      if (apt.email && !clientsMap.has(apt.email)) {
        clientsMap.set(apt.email, {
          email: apt.email,
          nom: apt.nom || "",
          prenom: apt.prenom || "",
          telephone: apt.telephone || "",
        });
      }
    });

    // Récupérer les infos supplémentaires depuis la collection Client
    const clientsWithDetails = await Client.find({});
    clientsWithDetails.forEach((client) => {
      if (clientsMap.has(client.email)) {
        // Mettre à jour avec les infos supplémentaires
        const existing = clientsMap.get(client.email);
        clientsMap.set(client.email, {
          ...existing,
          allergies: client.allergies || "",
          notes: client.notes || "",
          preferences: client.preferences || "",
          autresInfos: client.autresInfos || "",
          _id: client._id,
        });
      } else {
        // Client qui n'a pas de rendez-vous mais existe dans la base
        clientsMap.set(client.email, {
          email: client.email,
          nom: client.nom || "",
          prenom: client.prenom || "",
          telephone: client.telephone || "",
          allergies: client.allergies || "",
          notes: client.notes || "",
          preferences: client.preferences || "",
          autresInfos: client.autresInfos || "",
          _id: client._id,
        });
      }
    });

    // Convertir le Map en tableau
    const clients = Array.from(clientsMap.values());

    // Pour chaque client, récupérer l'historique des rendez-vous
    const clientsWithAppointments = await Promise.all(
      clients.map(async (client) => {
        const appointments = await Appointment.find({
          email: client.email,
        })
          .sort({ date: -1, heure: -1 })
          .select("date heure service status carteCadeaux createdAt");

        return {
          ...client,
          appointments: appointments,
          totalAppointments: appointments.length,
        };
      })
    );

    // Trier par nom de famille
    clientsWithAppointments.sort((a, b) => {
      const nameA = `${a.prenom} ${a.nom}`.toLowerCase();
      const nameB = `${b.prenom} ${b.nom}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    res.json({ success: true, data: clientsWithAppointments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des clients",
      error: error.message,
    });
  }
});

// GET - Récupérer un client spécifique par email
router.get("/:email", authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;
    const client = await Client.findOne({ email: email.toLowerCase() });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    // Récupérer l'historique des rendez-vous
    const appointments = await Appointment.find({
      email: email.toLowerCase(),
    })
      .sort({ date: -1, heure: -1 })
      .select("date heure service status carteCadeaux createdAt");

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        appointments: appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du client",
      error: error.message,
    });
  }
});

// POST - Créer ou mettre à jour un client
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      email,
      nom,
      prenom,
      telephone,
      allergies,
      notes,
      preferences,
      autresInfos,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "L'email est requis",
      });
    }

    // Chercher si le client existe déjà
    let client = await Client.findOne({ email: email.toLowerCase() });

    if (client) {
      // Mettre à jour le client existant
      client.nom = nom || client.nom;
      client.prenom = prenom || client.prenom;
      client.telephone = telephone || client.telephone;
      client.allergies = allergies || "";
      client.notes = notes || "";
      client.preferences = preferences || "";
      client.autresInfos = autresInfos || "";
      await client.save();
    } else {
      // Créer un nouveau client
      client = await Client.create({
        email: email.toLowerCase(),
        nom: nom || "",
        prenom: prenom || "",
        telephone: telephone || "",
        allergies: allergies || "",
        notes: notes || "",
        preferences: preferences || "",
        autresInfos: autresInfos || "",
      });
    }

    res.json({
      success: true,
      message: "Client enregistré avec succès",
      data: client,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Un client avec cet email existe déjà",
      });
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du client",
      error: error.message,
    });
  }
});

// PUT - Mettre à jour un client
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      allergies,
      notes,
      preferences,
      autresInfos,
      nom,
      prenom,
      telephone,
    } = req.body;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    // Mettre à jour les champs
    if (allergies !== undefined) client.allergies = allergies;
    if (notes !== undefined) client.notes = notes;
    if (preferences !== undefined) client.preferences = preferences;
    if (autresInfos !== undefined) client.autresInfos = autresInfos;
    if (nom !== undefined) client.nom = nom;
    if (prenom !== undefined) client.prenom = prenom;
    if (telephone !== undefined) client.telephone = telephone;

    await client.save();

    res.json({
      success: true,
      message: "Client mis à jour avec succès",
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du client",
      error: error.message,
    });
  }
});

export default router;
