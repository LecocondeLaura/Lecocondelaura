import crypto from "crypto";

// Générer une clé secrète aléatoire de 64 caractères
const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};

const secret = generateJWTSecret();

console.log("\n🔐 Clé JWT_SECRET générée :\n");
console.log(secret);
console.log("\n📝 Ajoutez cette ligne dans votre fichier .env :\n");
console.log(`JWT_SECRET=${secret}\n`);
console.log(
  "⚠️  IMPORTANT : Gardez cette clé secrète et ne la partagez jamais !\n"
);
