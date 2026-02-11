import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Appointment from "../models/Appointment.js";
import { sendFollowUpEmail } from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

const sendFollowUps = async () => {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI n'est pas défini dans .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connecté à MongoDB");

    const now = new Date();
    // Normaliser à minuit pour comparer les dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculer les dates : il y a 2 jours et il y a 3 jours (à minuit)
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const twoDaysAgoEnd = new Date(twoDaysAgo);
    twoDaysAgoEnd.setHours(23, 59, 59, 999);

    // Récupérer les rendez-vous qui ont eu lieu il y a 2-3 jours
    // (entre 2 et 3 jours dans le passé, donc on envoie 2-3 jours après)
    const appointments = await Appointment.find({
      carteCadeaux: false, // Seulement les rendez-vous, pas les cartes cadeaux
      date: {
        $gte: threeDaysAgo,
        $lte: twoDaysAgoEnd,
      },
      suiviEmailEnvoye: false,
      status: { $in: ["pending", "confirmed"] }, // Seulement les rendez-vous confirmés ou en attente
    });

    console.log(`📋 ${appointments.length} rendez-vous trouvés pour suivi`);

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
        console.log(
          `✅ Email de suivi envoyé pour ${appointment.prenom} ${
            appointment.nom
          } (${appointment.email}) - Séance du ${new Date(
            appointment.date
          ).toLocaleDateString("fr-FR")}`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Erreur pour ${appointment.prenom} ${appointment.nom}:`,
          error.message
        );
      }
    }

    console.log("\n📊 Résumé:");
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📧 Total: ${appointments.length}`);

    await mongoose.disconnect();
    console.log("\n✅ Déconnecté de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution du script:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Exécuter le script
sendFollowUps();
