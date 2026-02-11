import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Appointment from "../models/Appointment.js";
import { sendGiftCardReminderEmail } from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

const sendReminders = async () => {
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

    // Récupérer les cartes cadeaux envoyées qui approchent de l'expiration
    // (entre 3 et 6 mois après l'envoi, et qui n'ont pas encore reçu de relance)
    const giftCards = await Appointment.find({
      carteCadeaux: true,
      carteCadeauEnvoyee: true,
      relanceEnvoyee: false,
    });

    console.log(`📋 ${giftCards.length} cartes cadeaux trouvées`);

    // Filtrer celles qui sont entre 3 et 6 mois après l'envoi
    const cardsToRemind = giftCards.filter((card) => {
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

    console.log(
      `⏰ ${cardsToRemind.length} cartes cadeaux nécessitent une relance`
    );

    let successCount = 0;
    let errorCount = 0;

    // Envoyer les relances
    for (const card of cardsToRemind) {
      try {
        await sendGiftCardReminderEmail(card);

        // Marquer la relance comme envoyée
        card.relanceEnvoyee = true;
        card.dateRelance = new Date();
        await card.save();

        successCount++;
        console.log(
          `✅ Relance envoyée pour ${card.prenom} ${card.nom} (${card.email})`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Erreur pour ${card.prenom} ${card.nom}:`,
          error.message
        );
      }
    }

    console.log("\n📊 Résumé:");
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📧 Total: ${cardsToRemind.length}`);

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
sendReminders();
