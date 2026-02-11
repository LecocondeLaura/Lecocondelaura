import cron from "node-cron";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import { sendFollowUpEmail } from "./emailService.js";

/**
 * Fonction pour envoyer les emails de suivi
 * Cette fonction peut être appelée manuellement ou via cron
 */
export const sendFollowUpEmails = async () => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      console.log(
        "⚠️ MongoDB non connecté, impossible d'envoyer les emails de suivi"
      );
      return;
    }

    const now = new Date();
    // Normaliser à minuit pour comparer les dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculer les dates : il y a 2 jours et il y a 3 jours (à minuit)
    // On cherche les séances qui ont eu lieu il y a 2-3 jours
    // Exemple: si aujourd'hui est jeudi, on cherche les séances de lundi et mardi
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const twoDaysAgoEnd = new Date(twoDaysAgo);
    twoDaysAgoEnd.setHours(23, 59, 59, 999);

    // Log pour debug
    console.log(
      `📅 [Suivi automatique] Recherche des séances entre ${threeDaysAgo.toLocaleDateString(
        "fr-FR"
      )} et ${twoDaysAgo.toLocaleDateString("fr-FR")} (il y a 2-3 jours)`
    );

    // Récupérer les rendez-vous qui ont eu lieu il y a 2-3 jours
    // (donc on envoie l'email 2-3 jours APRÈS la séance)
    const appointments = await Appointment.find({
      carteCadeaux: false, // Seulement les rendez-vous, pas les cartes cadeaux
      date: {
        $gte: threeDaysAgo, // Séances d'il y a 3 jours ou plus récentes
        $lte: twoDaysAgoEnd, // Jusqu'à il y a 2 jours
      },
      suiviEmailEnvoye: false, // Pas encore envoyé
      status: { $in: ["pending", "confirmed"] }, // Seulement les rendez-vous confirmés ou en attente
    });

    console.log(
      `📋 [Suivi automatique] ${appointments.length} rendez-vous trouvés pour suivi`
    );

    let successCount = 0;
    let errorCount = 0;

    // Envoyer les emails de suivi
    for (const appointment of appointments) {
      try {
        await sendFollowUpEmail(appointment);

        // Marquer l'email de suivi comme envoyé
        appointment.suiviEmailEnvoye = true;
        appointment.dateSuiviEmail = new Date();
        await appointment.save();

        successCount++;
        const sessionDate = new Date(appointment.date);
        const daysSinceSession = Math.floor(
          (now - sessionDate) / (1000 * 60 * 60 * 24)
        );
        console.log(
          `✅ [Suivi automatique] Email envoyé pour ${appointment.prenom} ${
            appointment.nom
          } (${appointment.email}) - Séance du ${sessionDate.toLocaleDateString(
            "fr-FR"
          )} (il y a ${daysSinceSession} jour${
            daysSinceSession > 1 ? "s" : ""
          })`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `❌ [Suivi automatique] Erreur pour ${appointment.prenom} ${appointment.nom}:`,
          error.message
        );
      }
    }

    if (appointments.length > 0) {
      console.log(
        `📊 [Suivi automatique] Résumé: ✅ ${successCount} succès, ❌ ${errorCount} erreurs, 📧 ${appointments.length} total`
      );
    }
  } catch (error) {
    console.error(
      "❌ [Suivi automatique] Erreur lors de l'exécution:",
      error.message
    );
  }
};

/**
 * Démarrer le planificateur automatique
 * S'exécute tous les jours à 9h00 du matin
 */
export const startFollowUpScheduler = () => {
  // Planifier l'exécution tous les jours à 9h00
  // Format cron: minute heure jour mois jour-semaine
  // "0 9 * * *" = tous les jours à 9h00
  cron.schedule("0 9 * * *", async () => {
    console.log(
      "🕘 [Suivi automatique] Démarrage de l'envoi automatique des emails de suivi..."
    );
    await sendFollowUpEmails();
  });

  console.log(
    "✅ [Suivi automatique] Planificateur démarré - Exécution quotidienne à 9h00"
  );

  // Optionnel: Exécuter immédiatement au démarrage pour tester
  // Décommentez la ligne suivante si vous voulez tester au démarrage
  // sendFollowUpEmails();
};
