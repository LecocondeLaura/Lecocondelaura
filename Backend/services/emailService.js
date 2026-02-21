// Prix des soins (aligné avec Frontend/src/Data/Service.json) — Kodomo 70€, Rituel Détente 120€, Rituel Ultime 140€
export const getPriceForService = (serviceName) => {
  if (!serviceName) return null;
  if (serviceName.includes("Kodomo")) return 70;
  if (serviceName.includes("Rituel Détente")) return 120;
  if (serviceName.includes("Rituel Ultime")) return 140;
  return null;
};

const formatPriceInEmail = (serviceName) => {
  const price = getPriceForService(serviceName);
  return price != null ? `${price} €` : "";
};

// Envoi uniquement via Resend, avec le domaine vérifié lecocondelaura.fr
const DEFAULT_RESEND_FROM = "Le Cocon de Laura <contact@lecocondelaura.fr>";

const getResendFrom = () => {
  const explicit = process.env.RESEND_FROM?.trim();
  return explicit || DEFAULT_RESEND_FROM;
};

// Envoi via Resend (API HTTPS) — fonctionne sur Railway sans SMTP
const sendViaResend = async (mailOptions) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const from = getResendFrom();
  const to = Array.isArray(mailOptions.to) ? mailOptions.to[0] : mailOptions.to;
  const payload = {
    from,
    to: [to],
    subject: mailOptions.subject,
    html: mailOptions.html || "",
  };
  const replyTo = process.env.RESEND_REPLY_TO?.trim() || process.env.RECIPIENT_EMAIL?.trim();
  if (replyTo) payload.reply_to = replyTo;
  if (mailOptions.attachments?.length) {
    payload.attachments = mailOptions.attachments.map((a) => {
      const content = a.content || a.raw;
      const base64 = Buffer.isBuffer(content) ? content.toString("base64") : Buffer.from(String(content)).toString("base64");
      return { filename: a.filename || "attachment", content: base64 };
    });
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = new Error(`Resend: ${res.status} ${await res.text()}`);
    throw err;
  }
  return { messageId: (await res.json()).id };
};

// Envoi d'emails : uniquement via Resend (domaine lecocondelaura.fr vérifié sur resend.com)
const createTransporter = () => {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error(
      "RESEND_API_KEY est requis. Configurez-le sur Railway (resend.com → API Keys)."
    );
  }
  return {
    sendMail: async (mailOptions) => sendViaResend(mailOptions),
  };
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
                background: #f0cfcf;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white;
              }
              .header h1 {
                color: white !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
              }
              .header p {
                color: white !important;
                margin: 10px 0 0 0;
                opacity: 0.95;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">${headerTitle}</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
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
                <p><span class="label">🌸 Soin :</span> ${
                  appointment.service
                }</p>
                ${serviceInfoHtml}
              </div>
              ${messageHtml}
              ${calendarHtml}

              <p style="margin-top: 30px; text-align: center; color: #666;">
                <small>Rendez-vous créé le ${new Date().toLocaleString(
                  "fr-FR",
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
        "   → Vous devez utiliser un App Password (pas votre mot de passe Gmail)",
      );
      console.error("   → Voir le guide : Backend/GMAIL_APP_PASSWORD.md");
      console.error(
        "   → Lien direct : https://myaccount.google.com/apppasswords",
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
      },
    );

    const priceStr = formatPriceInEmail(appointment.service);

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `Confirmation de votre réservation - Le Cocon de Laura`,
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
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">✅ Réservation confirmée</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Nous avons le plaisir de confirmer votre réservation :</p>
              
              <div class="info-box">
                <p><span class="label">🌸 Soin :</span> ${appointment.service}</p>
                <p><span class="label">📅 Date :</span> ${dateFormatted}</p>
                <p><span class="label">🕐 Heure :</span> ${appointment.heure}</p>
                ${priceStr ? `<p><span class="label">💳 Prix :</span> ${priceStr}</p>` : ""}
              </div>

              <p>Nous avons hâte de vous accueillir au salon !</p>
              
              <p><strong>💳 Paiement :</strong> Le règlement s'effectue au salon lors de votre venue, en espèces ou par chèque.</p>
              
              <p>Si vous avez des questions ou souhaitez modifier votre rendez-vous, n'hésitez pas à nous contacter :</p>
              
              <div class="info-box">
                <p><span class="label">🌐 Site :</span> https://www.lecocondelaura.fr</p>
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>À très bientôt !</p>
              <p>Le Cocon de Laura</p>
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

Soin : ${appointment.service}
Date : ${dateFormatted}
Heure : ${appointment.heure}
${priceStr ? `Prix : ${priceStr}` : ""}

Nous avons hâte de vous accueillir au salon !

Paiement : Le règlement s'effectue au salon lors de votre venue, en espèces ou par chèque.

Contact :
Site : https://www.lecocondelaura.fr
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

À très bientôt !
Le Cocon de Laura
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email de confirmation envoyé au client ${appointment.email}`,
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de confirmation:",
      error.message,
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
      subject: `Demande de carte cadeau - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
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
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">🎁 Demande de carte cadeau</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p style="margin: 0 0 15px 0;">Bonjour ${appointment.prenom},</p>
              
              <p style="margin: 0 0 20px 0;">Merci pour votre demande de carte cadeau !</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><span class="label">🌸 Soin :</span> ${appointment.service}</p>
                <p style="margin: 5px 0;"><span class="label">👤 Pour :</span> ${appointment.prenom} ${appointment.nom}</p>
                ${formatPriceInEmail(appointment.service) ? `<p style="margin: 5px 0;"><span class="label">💳 Prix :</span> ${formatPriceInEmail(appointment.service)}</p>` : ""}
              </div>

              <p style="margin: 20px 0 15px 0;"><strong>Pour finaliser votre commande, veuillez effectuer le virement bancaire aux coordonnées suivantes :</strong></p>
              
              <div class="rib-box">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #8b6f6f; font-size: 16px;">Coordonnées bancaires :</p>
                <div class="rib-text" style="white-space: pre-line;">${ribHtml}</div>
              </div>

              <p style="margin: 20px 0 15px 0;"><strong>Une fois le virement effectué, votre carte cadeau vous sera envoyée par email avec un code unique.</strong></p>
              
              <div class="info-box">
              <p style="margin: 5px 0;"><span class="label">🌐 Site :</span> https://www.lecocondelaura.fr</p>
              <p style="margin: 5px 0;"><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
              <p style="margin: 5px 0;"><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
              <p style="margin: 5px 0;"><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p style="margin: 20px 0 10px 0;">Nous avons hâte de vous accueillir !</p>
              <p style="margin: 10px 0 0 0;">Le Cocon de Laura</p>
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

Soin : ${appointment.service}
Pour : ${appointment.prenom} ${appointment.nom}
${formatPriceInEmail(appointment.service) ? `Prix : ${formatPriceInEmail(appointment.service)}` : ""}

Pour finaliser votre commande, veuillez effectuer le virement bancaire aux coordonnées suivantes :

${ribText}

Une fois le virement effectué, votre carte cadeau vous sera envoyée par email avec un code unique.

Pour réserver votre rendez-vous une fois la carte cadeau reçue :
Site : https://www.lecocondelaura.fr
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous avons hâte de vous accueillir !
Le Cocon de Laura
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email de demande de carte cadeau envoyé au client ${appointment.email}`,
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
      error.message,
    );
    return false;
  }
};

// Envoyer un email avec la carte cadeau en pièce jointe (PDF ou image personnalisée)
export const sendGiftCardEmail = async (appointment, attachment, cardCode) => {
  try {
    const transporter = createTransporter();

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `Votre carte cadeau - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
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
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">🎁 Votre carte cadeau</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Merci pour votre commande ! Votre carte cadeau est prête.</p>
              
              <div class="info-box">
                <p><span class="label">🌸 Soin :</span> ${appointment.service}</p>
                <p><span class="label">👤 Pour :</span> ${appointment.prenom} ${appointment.nom}</p>
                ${formatPriceInEmail(appointment.service) ? `<p><span class="label">💳 Prix :</span> ${formatPriceInEmail(appointment.service)}</p>` : ""}
              </div>

              <div class="code-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Numéro de la carte</p>
                <p class="code">${cardCode}</p>
              </div>

              <p><strong>Votre carte cadeau est en pièce jointe de cet email.</strong></p>
              
              <p>Pour utiliser votre carte cadeau :</p>
              <ul>
                <li>Prenez rendez-vous sur le site pour effectuer votre soin</li>
                <li>Venez avec votre carte et communiquez le numéro de la carte pour validation</li>
                <li>Elle est valable 6 mois à compter de ce jour</li>
                <li>Un seul soin par carte cadeau</li>
              </ul>
              
              <div class="info-box">
                <p><span class="label">🌐 Site :</span> https://www.lecocondelaura.fr</p>
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>Nous avons hâte de vous accueillir !</p>
              <p>Le Cocon de Laura</p>
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

Soin : ${appointment.service}
Pour : ${appointment.prenom} ${appointment.nom}
${formatPriceInEmail(appointment.service) ? `Prix : ${formatPriceInEmail(appointment.service)}` : ""}

Numéro de la carte : ${cardCode}

Votre carte cadeau est en pièce jointe de cet email.

Lors de votre venue : venez avec votre carte et indiquez le numéro de la carte pour valider votre soin.

Ce soin est offert par une carte cadeau.

Pour utiliser votre carte cadeau :
- Prenez rendez-vous sur le site pour effectuer votre soin
- Venez avec votre carte et communiquez le numéro de la carte pour validation
- Elle est valable 6 mois à compter de ce jour
- Un seul soin par carte cadeau

Site : https://www.lecocondelaura.fr
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous avons hâte de vous accueillir !
Le Cocon de Laura
      `,
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.buffer,
          contentType: attachment.contentType,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email avec carte cadeau envoyé au client ${appointment.email}`,
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email avec carte cadeau:",
      error.message,
    );
    return false;
  }
};

// Envoyer un email d'annulation au client
export const sendCancellationEmail = async (appointment) => {
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
      },
    );

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `Annulation de votre rendez-vous - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              .header {
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
              .cancelled-box {
                background: #ffe6e6;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #dc3545;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">❌ Rendez-vous annulé</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Nous vous informons que votre rendez-vous a été annulé :</p>
              
              <div class="cancelled-box">
                <p><span class="label">🌸 Soin :</span> ${appointment.service}</p>
                <p><span class="label">📅 Date :</span> ${dateFormatted}</p>
                <p><span class="label">🕐 Heure :</span> ${appointment.heure}</p>
                ${formatPriceInEmail(appointment.service) ? `<p><span class="label">💳 Prix :</span> ${formatPriceInEmail(appointment.service)}</p>` : ""}
              </div>

              <p>Nous sommes désolés pour ce désagrément. Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à nous contacter :</p>
              
              <div class="info-box">
                <p><span class="label">🌐 Site :</span> https://www.lecocondelaura.fr</p>
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>Nous espérons vous accueillir prochainement !</p>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Annulation de rendez-vous - Le Cocon de Laura

Bonjour ${appointment.prenom},

Nous vous informons que votre rendez-vous a été annulé :

Soin : ${appointment.service}
Date : ${dateFormatted}
Heure : ${appointment.heure}
${formatPriceInEmail(appointment.service) ? `Prix : ${formatPriceInEmail(appointment.service)}` : ""}

Nous sommes désolés pour ce désagrément. Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à nous contacter :

Site : https://www.lecocondelaura.fr
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous espérons vous accueillir prochainement !
Le Cocon de Laura
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email d'annulation envoyé au client ${appointment.email}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email d'annulation:",
      error.message,
    );
    return false;
  }
};

// Envoyer une notification d'annulation au propriétaire du salon
export const sendCancellationNotification = async (appointment) => {
  try {
    const transporter = createTransporter();
    const recipientEmail = process.env.RECIPIENT_EMAIL;

    if (!recipientEmail) {
      console.warn("⚠️ RECIPIENT_EMAIL non configuré, email non envoyé");
      return false;
    }

    // Formater la date
    const dateFormatted = new Date(appointment.date).toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Rendez-vous annulé - ${appointment.prenom} ${appointment.nom}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              .header {
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
              .cancelled-box {
                background: #ffe6e6;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #dc3545;
              }
              .label {
                font-weight: bold;
                color: #8b6f6f;
                display: inline-block;
                min-width: 120px;
              }
            </style>
          </head>
          <body>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">❌ Rendez-vous annulé</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p>Un rendez-vous a été annulé :</p>
              
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
              
              <div class="cancelled-box">
                <p><span class="label">🌸 Soin :</span> ${
                  appointment.service
                }</p>
                <p><span class="label">📅 Date :</span> ${dateFormatted}</p>
                <p><span class="label">🕐 Heure :</span> ${
                  appointment.heure
                }</p>
              </div>

              <p style="margin-top: 30px; text-align: center; color: #666;">
                <small>Rendez-vous annulé le ${new Date().toLocaleString(
                  "fr-FR",
                )}</small>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Rendez-vous annulé - Le Cocon de Laura

Un rendez-vous a été annulé :

Client : ${appointment.prenom} ${appointment.nom}
Email : ${appointment.email}
Téléphone : ${appointment.telephone}

Service : ${appointment.service}
Date : ${dateFormatted}
Heure : ${appointment.heure}

Rendez-vous annulé le ${new Date().toLocaleString("fr-FR")}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification d'annulation envoyée à ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de la notification d'annulation:",
      error.message,
    );
    return false;
  }
};

// Envoyer un email de relance pour une carte cadeaux (3 mois avant expiration)
export const sendGiftCardReminderEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    // Calculer la date d'expiration (6 mois après l'envoi de la carte)
    // Utiliser dateEnvoiCarte si disponible, sinon updatedAt si carteCadeauEnvoyee est true, sinon createdAt
    const cardSentDate =
      appointment.dateEnvoiCarte ||
      (appointment.carteCadeauEnvoyee ? appointment.updatedAt : null) ||
      appointment.createdAt;
    const expirationDate = new Date(cardSentDate);
    expirationDate.setMonth(expirationDate.getMonth() + 6);

    // Formater les dates
    const expirationDateFormatted = expirationDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `⏰ Rappel : Votre carte cadeau expire bientôt - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              .header {
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
              .reminder-box {
                background: #fff3cd;
                padding: 20px;
                margin: 15px 0;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">⏰ Rappel carte cadeau</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Nous souhaitons vous rappeler que vous possédez une carte cadeau qui expire dans 3 mois.</p>
              
              <div class="reminder-box">
                <p style="margin: 0; font-weight: bold; color: #856404;">⏰ Date d'expiration : ${expirationDateFormatted}</p>
                <p style="margin: 5px 0 0 0; color: #856404;">Il vous reste 3 mois pour l'utiliser !</p>
              </div>

              <div class="info-box">
                <p><span class="label">🌸 Soin :</span> ${
                  appointment.service
                }</p>
                <p><span class="label">👤 Pour :</span> ${appointment.prenom} ${
                  appointment.nom
                }</p>
              </div>

              ${
                appointment.codeCarteCadeau
                  ? `
              <div class="code-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Code de votre carte</p>
                <p class="code">${appointment.codeCarteCadeau}</p>
              </div>
              `
                  : ""
              }

              <p><strong>N'oubliez pas de réserver votre rendez-vous avant l'expiration !</strong></p>
              
              <p>Pour réserver votre rendez-vous, contactez-nous :</p>
              
              <div class="info-box">
                <p><span class="label">🌐 Site :</span> https://www.lecocondelaura.fr</p>
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>Nous avons hâte de vous accueillir !</p>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Rappel carte cadeau - Le Cocon de Laura

Bonjour ${appointment.prenom},

Nous souhaitons vous rappeler que vous possédez une carte cadeau qui expire dans 3 mois.

Date d'expiration : ${expirationDateFormatted}
Il vous reste 3 mois pour l'utiliser !

Service : ${appointment.service}
Pour : ${appointment.prenom} ${appointment.nom}
${appointment.codeCarteCadeau ? `Code : ${appointment.codeCarteCadeau}` : ""}

N'oubliez pas de réserver votre rendez-vous avant l'expiration !

Pour réserver votre rendez-vous :
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous avons hâte de vous accueillir !
Laura - Le Cocon de Laura
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de relance envoyé au client ${appointment.email}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de relance:",
      error.message,
    );
    return false;
  }
};

// Envoyer un email de suivi post-séance (2-3 jours après la séance)
export const sendFollowUpEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    // Formater la date de la séance
    const sessionDate = new Date(appointment.date);
    const sessionDateFormatted = sessionDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // URL du site (peut être configurée dans .env)
    const siteUrl = process.env.SITE_URL || "https://lecocondelaura.fr";

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: `💆‍♀️ Comment s'est passée votre séance ? - Le Cocon de Laura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              .header {
                background: #f0cfcf !important;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                color: white !important;
              }
              .header h1 {
                color: #ffffff !important;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                -webkit-text-fill-color: #ffffff !important;
              }
              .header p {
                color: #ffffff !important;
                margin: 10px 0 0 0;
                opacity: 1 !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              @media only screen and (max-width: 600px) {
                .header {
                  background-color: #f0cfcf !important;
                  background: #f0cfcf !important;
                }
                .header h1 {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
                .header p {
                  color: #ffffff !important;
                  -webkit-text-fill-color: #ffffff !important;
                }
              }
              [data-ogsc] .header {
                background-color: #f0cfcf !important;
                background: #f0cfcf !important;
              }
              [data-ogsc] .header h1 {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
              [data-ogsc] .header p {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
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
              .cta-box {
                background: #f0cfcf;
                padding: 25px;
                margin: 20px 0;
                border-radius: 8px;
                text-align: center;
              }
              .cta-button {
                display: inline-block;
                background: #8b6f6f;
                color: white !important;
                padding: 15px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                margin-top: 10px;
              }
              .cta-button:hover {
                background: #7a5f5f;
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
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#f0cfcf" style="background-color: #f0cfcf !important; border-radius: 10px 10px 0 0; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
              <tr>
                <td bgcolor="#f0cfcf" style="padding: 30px; text-align: center; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-hide: all; -webkit-background-clip: padding-box; background-clip: padding-box;">
                  <h1 bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: bold; background-color: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">💆‍♀️ Comment s'est passée votre séance ?</h1>
                  <p bgcolor="#f0cfcf" style="color: #ffffff !important; margin: 10px 0 0 0; background-color: #f0cfcf !important; background: #f0cfcf !important; mso-color-alt: #ffffff; -webkit-text-fill-color: #ffffff !important; text-fill-color: #ffffff !important;">Le Cocon de Laura</p>
                </td>
              </tr>
            </table>
            <div class="content">
              <p>Bonjour ${appointment.prenom},</p>
              
              <p>Nous espérons que votre séance du <strong>${sessionDateFormatted}</strong> s'est bien passée !</p>
              
              <div class="info-box">
                <p><span class="label">🌸 Soin :</span> ${appointment.service}</p>
                <p><span class="label">📅 Date :</span> ${sessionDateFormatted}</p>
                <p><span class="label">🕐 Heure :</span> ${appointment.heure}</p>
              </div>

              <p>Votre avis compte beaucoup pour nous ! Si vous souhaitez partager votre expérience, n'hésitez pas à laisser un avis sur notre site.</p>
              
              <div class="cta-box">
                <p style="margin: 0 0 15px 0; color: #8b6f6f; font-weight: bold; font-size: 18px;">
                  Partagez votre expérience
                </p>
                <a href="${siteUrl}" class="cta-button" style="color: #ffffff !important; text-decoration: none;">
                  Laisser un avis
                </a>
              </div>

              <p>Si vous avez des questions ou des commentaires, n'hésitez pas à nous contacter :</p>
              
              <div class="info-box">
              <p><span class="label">🌐 Site :</span> https://www.lecocondelaura.fr</p>
                <p><span class="label">📞 Téléphone :</span> 07 87 98 43 41</p>
                <p><span class="label">📧 Email :</span> lecocondelaura17@gmail.com</p>
                <p><span class="label">📍 Adresse :</span> 70 rue Sadi Carnot, 17500 Jonzac</p>
              </div>

              <p>Nous avons hâte de vous revoir !</p>
              <p>Le Cocon de Laura</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Comment s'est passée votre séance ? - Le Cocon de Laura

Bonjour ${appointment.prenom},

Nous espérons que votre séance du ${sessionDateFormatted} s'est bien passée !

Service : ${appointment.service}
Date : ${sessionDateFormatted}
Heure : ${appointment.heure}

Votre avis compte beaucoup pour nous ! Si vous souhaitez partager votre expérience, n'hésitez pas à laisser un avis sur notre site.

Lien pour laisser un avis : ${siteUrl}

Si vous avez des questions ou des commentaires :
Téléphone : 07 87 98 43 41
Email : lecocondelaura17@gmail.com
Adresse : 70 rue Sadi Carnot, 17500 Jonzac

Nous avons hâte de vous revoir !
Laura - Le Cocon de Laura
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de suivi envoyé au client ${appointment.email}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de suivi:",
      error.message,
    );
    return false;
  }
};
