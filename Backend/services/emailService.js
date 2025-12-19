import nodemailer from "nodemailer";

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail", // gmail, outlook, yahoo, etc.
    auth: {
      user: process.env.EMAIL_USER, // Votre adresse email
      pass: process.env.EMAIL_PASSWORD, // Votre mot de passe ou App Password
    },
  });
};

// Générer l'URL Google Calendar pour ajouter un événement
const generateGoogleCalendarUrl = (appointment) => {
  // Durées des services en minutes
  const serviceDurations = {
    "Head Spa Classique": 60,
    "Head Spa Premium": 90,
    "Head Spa Détente": 45,
  };

  const duration = serviceDurations[appointment.service] || 60;

  // Créer la date de début
  const [hours, minutes] = appointment.heure.split(":");
  const startDate = new Date(appointment.date);
  startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Créer la date de fin (début + durée)
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + duration);

  // Formater les dates au format Google Calendar (YYYYMMDDTHHMMSS)
  const formatGoogleDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hour}${min}${sec}`;
  };

  const start = formatGoogleDate(startDate);
  const end = formatGoogleDate(endDate);

  // Créer la description
  const description = `Client: ${appointment.prenom} ${appointment.nom}
Email: ${appointment.email}
Téléphone: ${appointment.telephone}
Service: ${appointment.service}
${appointment.message ? `Message: ${appointment.message}` : ""}`;

  // Créer l'URL Google Calendar
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${appointment.nom} ${appointment.prenom} - ${appointment.service}`,
    dates: `${start}/${end}`,
    details: description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Envoyer un email de notification pour un nouveau rendez-vous
export const sendAppointmentNotification = async (appointment) => {
  try {
    const transporter = createTransporter();
    const recipientEmail = process.env.RECIPIENT_EMAIL; // Email de votre conjointe

    if (!recipientEmail) {
      console.warn("⚠️ RECIPIENT_EMAIL non configuré, email non envoyé");
      return false;
    }

    // Formater la date (seulement si ce n'est pas une carte cadeaux)
    let dateFormatted = "";
    let calendarUrl = "";

    if (!appointment.carteCadeaux && appointment.date) {
      dateFormatted = new Date(appointment.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Générer l'URL Google Calendar seulement pour les rendez-vous
      calendarUrl = generateGoogleCalendarUrl(appointment);
    }

    // Construire les sections HTML de manière séparée pour éviter les problèmes avec Gmail
    const headerTitle = appointment.carteCadeaux
      ? "🎁 Nouvelle demande de carte cadeaux"
      : "💆‍♀️ Nouvelle demande de rendez-vous";

    const serviceInfoHtml =
      !appointment.carteCadeaux && dateFormatted
        ? `<p><span class="label">📅 Date :</span> ${dateFormatted}</p>
         <p><span class="label">🕐 Heure :</span> ${appointment.heure}</p>`
        : `<p><span class="label">🎁 Type :</span> Carte cadeaux</p>`;

    const messageHtml = appointment.message
      ? `<div class="message-box">
           <strong>💬 Message du client :</strong><br>
           ${appointment.message.replace(/\n/g, "<br>")}
         </div>`
      : "";

    const calendarHtml =
      !appointment.carteCadeaux && calendarUrl
        ? `<div class="button-container">
           <a href="${calendarUrl}" class="calendar-button" target="_blank">
             📅 Ajouter à Google Calendar
           </a>
         </div>`
        : "";

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: appointment.carteCadeaux
        ? `🎁 Nouvelle demande de carte cadeaux - ${appointment.service}`
        : `🎉 Nouvelle demande de rendez-vous - ${appointment.service}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f0cfcf 0%, #e0bfbf 100%);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #f0cfcf;
              }
              .label {
                font-weight: bold;
                color: #8b6f6f;
                display: inline-block;
                min-width: 120px;
              }
              .message-box {
                background: #fff;
                padding: 15px;
                margin-top: 15px;
                border-radius: 5px;
                border: 1px solid #e0e0e0;
                font-style: italic;
                color: #666;
              }
              .calendar-button {
                display: inline-block;
                background: #4285f4;
                color: white !important;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
                transition: background 0.3s;
              }
              .calendar-button:hover {
                background: #357ae8;
              }
              .button-container {
                text-align: center;
                margin: 25px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${headerTitle}</h1>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="content">
              <div class="info-box">
                <p><span class="label">👤 Client :</span> ${
                  appointment.prenom
                } ${appointment.nom}</p>
                <p><span class="label">📧 Email :</span> ${
                  appointment.email
                }</p>
                <p><span class="label">📞 Téléphone :</span> ${
                  appointment.telephone
                }</p>
              </div>
              
              <div class="info-box">
                <p><span class="label">🌸 Service :</span> ${
                  appointment.service
                }</p>
                ${serviceInfoHtml}
              </div>
              ${messageHtml}
              ${calendarHtml}

              <p style="margin-top: 30px; text-align: center; color: #666;">
                <small>Rendez-vous créé le ${new Date().toLocaleString(
                  "fr-FR"
                )}</small>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `${
        appointment.carteCadeaux
          ? "Nouvelle demande de carte cadeaux"
          : "Nouvelle demande de rendez-vous"
      } - Le Cocon de Laura

Client: ${appointment.prenom} ${appointment.nom}
Email: ${appointment.email}
Téléphone: ${appointment.telephone}

Service: ${appointment.service}
${
  !appointment.carteCadeaux && dateFormatted
    ? `Date: ${dateFormatted}\nHeure: ${appointment.heure}`
    : "Type: Carte cadeaux"
}

${appointment.message ? `Message: ${appointment.message}` : ""}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès à ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error.message);

    // Messages d'aide selon le type d'erreur
    if (error.code === "EAUTH") {
      console.error("\n💡 AIDE : Erreur d'authentification Gmail");
      console.error(
        "   → Vous devez utiliser un App Password (pas votre mot de passe Gmail)"
      );
      console.error("   → Voir le guide : Backend/GMAIL_APP_PASSWORD.md");
      console.error(
        "   → Lien direct : https://myaccount.google.com/apppasswords"
      );
    }

    return false;
  }
};

// Envoyer un email de confirmation au client pour un rendez-vous normal
export const sendClientConfirmationEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    // Formater la date
    const dateFormatted = new Date(appointment.date).toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `✅ Confirmation de votre réservation - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f0cfcf 0%, #e0bfbf 100%);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #f0cfcf;
              }
              .label {
                font-weight: bold;
                color: #8b6f6f;
                display: inline-block;
                min-width: 120px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Réservation confirmée</h1>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Nous avons le plaisir de confirmer votre réservation :</p>
              
              <div class="info-box">
                <p><span class="label">🌸 Service :</span> ${appointment.service}</p>
                <p><span class="label">📅 Date :</span> ${dateFormatted}</p>
                <p><span class="label">🕐 Heure :</span> ${appointment.heure}</p>
              </div>

              <p>Nous avons hâte de vous accueillir au salon !</p>
              
              <p>Si vous avez des questions ou souhaitez modifier votre rendez-vous, n'hésitez pas à nous contacter :</p>
              
              <div class="info-box">
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>À très bientôt !</p>
              <p><strong>Laura</strong><br>Le Cocon de Laura</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Confirmation de réservation - Le Cocon de Laura

Bonjour ${appointment.prenom},

Nous avons le plaisir de confirmer votre réservation :

Service : ${appointment.service}
Date : ${dateFormatted}
Heure : ${appointment.heure}

Nous avons hâte de vous accueillir au salon !

Contact :
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

À très bientôt !
Laura - Le Cocon de Laura
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email de confirmation envoyé au client ${appointment.email}`
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de confirmation:",
      error.message
    );
    return false;
  }
};

// Envoyer un email initial pour une carte cadeaux (avec RIB, sans PDF)
export const sendGiftCardRequestEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    // RIB - Récupérer depuis les variables d'environnement
    // Format attendu dans .env : RIB="IBAN: FR76...\nBIC: ...\nTitulaire: ..."
    let rib =
      process.env.RIB ||
      "IBAN: FR76 XXXX XXXX XXXX XXXX XXXX XXX\nBIC: XXXXXXXX\nTitulaire: Laura Coutant\n\n⚠️ Veuillez configurer la variable RIB dans le fichier .env";

    // S'assurer que les sauts de ligne sont correctement gérés
    // Remplacer les \n par <br> pour le HTML et garder \n pour le texte
    const ribHtml = rib.replace(/\n/g, "<br>");
    const ribText = rib;

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `🎁 Demande de carte cadeau - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f0cfcf 0%, #e0bfbf 100%);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #f0cfcf;
              }
              .rib-box {
                background: #fff3cd;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                border: 2px solid #ffc107;
              }
              .label {
                font-weight: bold;
                color: #8b6f6f;
                display: inline-block;
                min-width: 120px;
              }
              .rib-text {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.8;
                color: #333;
                white-space: pre-line;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎁 Demande de carte cadeau</h1>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="content">
              <p style="margin: 0 0 15px 0;">Bonjour ${appointment.prenom},</p>
              
              <p style="margin: 0 0 20px 0;">Merci pour votre demande de carte cadeau !</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><span class="label">🌸 Service :</span> ${appointment.service}</p>
                <p style="margin: 5px 0;"><span class="label">👤 Pour :</span> ${appointment.prenom} ${appointment.nom}</p>
              </div>

              <p style="margin: 20px 0 15px 0;"><strong>Pour finaliser votre commande, veuillez effectuer le virement bancaire aux coordonnées suivantes :</strong></p>
              
              <div class="rib-box">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #8b6f6f; font-size: 16px;">Coordonnées bancaires :</p>
                <div class="rib-text" style="white-space: pre-line;">${ribHtml}</div>
              </div>

              <p style="margin: 20px 0 15px 0;"><strong>Une fois le virement effectué, votre carte cadeau vous sera envoyée par email avec un code unique.</strong></p>
              
              <p style="margin: 20px 0 15px 0;">Pour réserver votre rendez-vous une fois la carte cadeau reçue, contactez-nous :</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p style="margin: 5px 0;"><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p style="margin: 5px 0;"><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p style="margin: 20px 0 10px 0;">Nous avons hâte de vous accueillir !</p>
              <p style="margin: 10px 0 0 0;"><strong>Laura</strong><br>Le Cocon de Laura</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Demande de carte cadeau - Le Cocon de Laura

Bonjour ${appointment.prenom},

Merci pour votre demande de carte cadeau !

Service : ${appointment.service}
Pour : ${appointment.prenom} ${appointment.nom}

Pour finaliser votre commande, veuillez effectuer le virement bancaire aux coordonnées suivantes :

${ribText}

Une fois le virement effectué, votre carte cadeau vous sera envoyée par email avec un code unique.

Pour réserver votre rendez-vous une fois la carte cadeau reçue :
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous avons hâte de vous accueillir !
Laura - Le Cocon de Laura
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email de demande de carte cadeau envoyé au client ${appointment.email}`
    );
    console.log("📧 Détails de l'email:", {
      to: appointment.email,
      subject: mailOptions.subject,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de demande de carte cadeau:",
      error.message
    );
    return false;
  }
};

// Envoyer un email avec la carte cadeaux en PDF (après paiement)
export const sendGiftCardEmail = async (appointment, pdfBuffer, cardCode) => {
  try {
    const transporter = createTransporter();

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `🎁 Votre carte cadeau - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f0cfcf 0%, #e0bfbf 100%);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #f0cfcf;
              }
              .label {
                font-weight: bold;
                color: #8b6f6f;
                display: inline-block;
                min-width: 120px;
              }
              .code-box {
                background: #f0cfcf;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .code {
                font-size: 24px;
                font-weight: bold;
                color: #8b6f6f;
                letter-spacing: 2px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎁 Votre carte cadeau</h1>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Merci pour votre commande ! Votre carte cadeau est prête.</p>
              
              <div class="info-box">
                <p><span class="label">🌸 Service :</span> ${appointment.service}</p>
                <p><span class="label">👤 Pour :</span> ${appointment.prenom} ${appointment.nom}</p>
              </div>

              <div class="code-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Code de la carte</p>
                <p class="code">${cardCode}</p>
              </div>

              <p><strong>Votre carte cadeau est en pièce jointe de cet email.</strong></p>
              
              <p>Pour utiliser votre carte cadeaux :</p>
              <ul>
                <li>Présentez-la lors de votre réservation</li>
                <li>Elle est valable 12 mois à compter de ce jour</li>
                <li>Un seul service par carte cadeaux</li>
              </ul>

              <p>Pour réserver votre rendez-vous, contactez-nous :</p>
              
              <div class="info-box">
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>Nous avons hâte de vous accueillir !</p>
              <p><strong>Laura</strong><br>Le Cocon de Laura</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Votre carte cadeau - Le Cocon de Laura

Bonjour ${appointment.prenom},

Merci pour votre commande ! Votre carte cadeau est prête.

Service : ${appointment.service}
Pour : ${appointment.prenom} ${appointment.nom}
Code : ${cardCode}

Votre carte cadeau est en pièce jointe de cet email.

Pour utiliser votre carte cadeaux :
- Présentez-la lors de votre réservation
- Elle est valable 6 mois à compter de ce jour
- Un seul service par carte cadeau

Pour réserver votre rendez-vous :
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous avons hâte de vous accueillir !
Laura - Le Cocon de Laura
      `,
      attachments: [
        {
          filename: `Carte_Cadeau_${cardCode}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email avec carte cadeau envoyé au client ${appointment.email}`
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email avec carte cadeau:",
      error.message
    );
    return false;
  }
};
