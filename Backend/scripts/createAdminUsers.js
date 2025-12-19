import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import readline from "readline";

// Charger les variables d'environnement
dotenv.config();

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    return false;
  }
};

// Créer les utilisateurs admin
const createAdminUsers = async () => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const existingUsers = await User.find();
    if (existingUsers.length > 0) {
      console.log(
        "⚠️  Des utilisateurs existent déjà dans la base de données."
      );
      const answer = await question(
        "Voulez-vous créer de nouveaux utilisateurs ? (oui/non): "
      );
      if (answer.toLowerCase() !== "oui") {
        console.log("❌ Opération annulée");
        rl.close();
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    console.log("\n📝 Création des comptes administrateurs\n");

    // Premier utilisateur
    console.log("--- Premier compte administrateur ---");
    const username1 = await question("Nom d'utilisateur (1): ");
    const password1 = await question("Mot de passe (1): ");

    if (!username1 || !password1) {
      console.log("❌ Le nom d'utilisateur et le mot de passe sont requis");
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser1 = await User.findOne({
      username: username1.toLowerCase(),
    });
    if (existingUser1) {
      console.log(
        `⚠️  L'utilisateur "${username1}" existe déjà. Passage au suivant...`
      );
    } else {
      const user1 = new User({
        username: username1.toLowerCase(),
        password: password1,
        role: "admin",
      });
      await user1.save();
      console.log(`✅ Utilisateur "${username1}" créé avec succès`);
    }

    // Deuxième utilisateur
    console.log("\n--- Deuxième compte administrateur ---");
    const username2 = await question("Nom d'utilisateur (2): ");
    const password2 = await question("Mot de passe (2): ");

    if (!username2 || !password2) {
      console.log("⚠️  Deuxième utilisateur non créé (champs vides)");
    } else {
      // Vérifier si l'utilisateur existe déjà
      const existingUser2 = await User.findOne({
        username: username2.toLowerCase(),
      });
      if (existingUser2) {
        console.log(`⚠️  L'utilisateur "${username2}" existe déjà.`);
      } else {
        const user2 = new User({
          username: username2.toLowerCase(),
          password: password2,
          role: "admin",
        });
        await user2.save();
        console.log(`✅ Utilisateur "${username2}" créé avec succès`);
      }
    }

    console.log("\n✅ Création des comptes terminée !");
    console.log(
      "\n💡 Vous pouvez maintenant vous connecter au dashboard avec ces identifiants."
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création des utilisateurs:",
      error.message
    );
  }
};

// Exécuter le script
const run = async () => {
  const connected = await connectDB();
  if (connected) {
    await createAdminUsers();
    rl.close();
    await mongoose.connection.close();
    console.log("✅ Connexion fermée");
    process.exit(0);
  } else {
    rl.close();
    process.exit(1);
  }
};

run();
