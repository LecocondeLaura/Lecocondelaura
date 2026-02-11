import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sizeOf from "image-size";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, "..", "assets");
const CUSTOM_CARD_NAMES = [
  "carte-cadeau.png",
  "carte-cadeau.jpg",
  "carte-cadeau.jpeg",
];

// Conversion pixels → points (72 pts = 1 inch ; on suppose ~150 dpi pour l'image)
const pxToPt = (px, dpi = 150) => (px * 72) / dpi;

/**
 * Retourne l'image personnalisée de la carte cadeau si elle existe (dossier Backend/assets).
 * @returns {{ buffer: Buffer, filename: string, contentType: string, width?: number, height?: number } | null}
 */
export const getCustomGiftCardImage = () => {
  for (const name of CUSTOM_CARD_NAMES) {
    const filePath = path.join(ASSETS_DIR, name);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(name).toLowerCase();
      const contentType = ext === ".png" ? "image/png" : "image/jpeg";
      let width, height;
      try {
        const dims = sizeOf(buffer);
        width = dims.width;
        height = dims.height;
      } catch (_) {
        width = 1200;
        height = 800;
      }
      return {
        buffer,
        filename: name,
        contentType,
        width: width || 1200,
        height: height || 800,
      };
    }
  }
  return null;
};

/**
 * Génère un PDF à partir de l'image personnalisée avec les champs écrits dessus :
 * Soin, Offert par, Valable jusqu'au (+ code carte)
 * @param {Object} appointment - Données de la carte
 * @param {string} cardCode - Code de la carte
 * @param {Buffer} imageBuffer - Image de fond
 * @param {number} imageWidth - Largeur en pixels
 * @param {number} imageHeight - Hauteur en pixels
 * @returns {Promise<Buffer>}
 */
export const generateGiftCardPDFFromImage = async (
  appointment,
  cardCode,
  imageBuffer,
  imageWidth,
  imageHeight,
) => {
  return new Promise((resolve, reject) => {
    try {
      const wPt = pxToPt(imageWidth);
      const hPt = pxToPt(imageHeight);

      const doc = new PDFDocument({
        size: [wPt, hPt],
        margins: 0,
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.image(imageBuffer, 0, 0, { width: wPt, height: hPt });

      const textColor = "#5c4033";
      const left = wPt * 0.08;
      const lineHeight = hPt * 0.09;
      let y = hPt * 0.44;

      doc.fontSize(18).fillColor(textColor).font("Helvetica-Bold");

      doc.text(`Soin : ${appointment.service || ""}`, left, y, {
        width: wPt * 0.55,
      });
      y += lineHeight;

      doc.text(
        `Offert par : ${appointment.prenom || ""} ${appointment.nom || ""}`,
        left,
        y,
        { width: wPt * 0.55 },
      );
      y += lineHeight;

      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);
      const validStr = validUntil.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      doc.text(`Valable jusqu'au : ${validStr}`, left, y, {
        width: wPt * 0.55,
      });
      y += lineHeight * 1.3;

      doc.fontSize(14).fillColor("#6b5344").font("Helvetica-Bold");
      doc.text(`Code : ${cardCode}`, left, y, { width: wPt * 0.55 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Génère un PDF de carte cadeaux élégant
 * @param {Object} appointment - Les données du rendez-vous/carte cadeaux
 * @returns {Promise<Buffer>} - Le PDF en tant que Buffer
 */
export const generateGiftCardPDF = async (appointment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [595, 842], // A4 en points
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      // Générer un code unique pour la carte cadeaux
      const cardCode = `CC-${Date.now()
        .toString(36)
        .toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve({
          buffer: Buffer.concat(chunks),
          code: cardCode,
        });
      });
      doc.on("error", reject);

      // Couleurs du thème
      const primaryColor = "#8b6f6f";
      const secondaryColor = "#f0cfcf";
      const lightColor = "#fef5f5";
      const textColor = "#333333";

      // Fond dégradé (simulé avec des rectangles)
      doc.rect(0, 0, 595, 842).fill(lightColor);

      // Bordure décorative
      doc
        .lineWidth(3)
        .strokeColor(secondaryColor)
        .roundedRect(30, 30, 535, 782, 20)
        .stroke();

      // En-tête avec fond dégradé
      doc.rect(50, 50, 495, 120).fill(secondaryColor);

      // Titre principal
      doc
        .fontSize(42)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("CARTE CADEAUX", 50, 80, {
          width: 495,
          align: "center",
        });

      // Sous-titre
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .font("Helvetica")
        .text("Le Cocon de Laura", 50, 130, {
          width: 495,
          align: "center",
        });

      // Section principale
      const startY = 220;

      // Cercle décoratif
      doc
        .circle(297.5, startY + 60, 80)
        .fill(secondaryColor)
        .opacity(0.3);

      // Icône cadeau (simulée avec du texte)
      doc
        .fontSize(60)
        .fillColor(primaryColor)
        .text("🎁", 237.5, startY + 30, {
          width: 120,
          align: "center",
        });

      // Service
      doc
        .fontSize(28)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Service offert :", 80, startY + 150, {
          width: 435,
          align: "center",
        });

      doc
        .fontSize(22)
        .fillColor(textColor)
        .font("Helvetica")
        .text(appointment.service, 80, startY + 190, {
          width: 435,
          align: "center",
        });

      // Ligne décorative
      doc
        .moveTo(150, startY + 250)
        .lineTo(445, startY + 250)
        .lineWidth(2)
        .strokeColor(secondaryColor)
        .stroke();

      // Informations du bénéficiaire
      const infoY = startY + 300;
      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Pour :", 80, infoY, {
          width: 435,
          align: "left",
        });

      doc
        .fontSize(20)
        .fillColor(textColor)
        .font("Helvetica")
        .text(`${appointment.prenom} ${appointment.nom}`, 80, infoY + 30, {
          width: 435,
          align: "left",
        });

      // Code de la carte cadeaux
      const codeY = infoY + 100;

      doc
        .fontSize(14)
        .fillColor("#666")
        .font("Helvetica")
        .text("Code de la carte :", 80, codeY, {
          width: 435,
          align: "center",
        });

      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text(cardCode, 80, codeY + 25, {
          width: 435,
          align: "center",
        });

      // Conditions d'utilisation
      const conditionsY = codeY + 100;
      doc
        .fontSize(12)
        .fillColor("#666")
        .font("Helvetica")
        .text("Conditions d'utilisation :", 80, conditionsY, {
          width: 435,
          align: "left",
        });

      const conditions = [
        "• Valable 12 mois à compter de la date d'émission",
        "• Non remboursable et non échangeable",
        "• À présenter lors de la réservation",
        "• Un seul service par carte cadeaux",
      ];

      let currentY = conditionsY + 25;
      conditions.forEach((condition) => {
        doc
          .fontSize(11)
          .fillColor("#666")
          .font("Helvetica")
          .text(condition, 100, currentY, {
            width: 395,
            align: "left",
          });
        currentY += 20;
      });

      // Pied de page
      const footerY = 700;
      doc
        .moveTo(150, footerY)
        .lineTo(445, footerY)
        .lineWidth(1)
        .strokeColor("#ddd")
        .stroke();

      doc
        .fontSize(10)
        .fillColor("#666")
        .font("Helvetica")
        .text("70 rue Sadi Carnot, 17500 Jonzac", 80, footerY + 20, {
          width: 435,
          align: "center",
        });

      doc
        .fontSize(10)
        .fillColor("#666")
        .font("Helvetica")
        .text("07 87 98 43 41 | lecocondelaura17@gmail.com", 80, footerY + 40, {
          width: 435,
          align: "center",
        });

      // Date d'émission
      const emissionDate = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      doc
        .fontSize(9)
        .fillColor("#999")
        .font("Helvetica")
        .text(`Émise le ${emissionDate}`, 80, footerY + 70, {
          width: 435,
          align: "center",
        });

      // Finaliser le PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
