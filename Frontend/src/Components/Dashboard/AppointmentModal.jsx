import React from "react";
import {
  XMarkIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

function AppointmentModal({ appointment, onClose, onDelete, onSendFollowUp, onUpdateStatus, onUpdateMoyenPaiement }) {
  if (!appointment) return null;

  // Vérifier si le rendez-vous a eu lieu il y a au moins 1 jour
  // (pour éviter d'afficher le bouton le jour même de la séance)
  const appointmentDate = appointment.date ? new Date(appointment.date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliser à minuit pour comparer les dates

  let isPastAppointment = false;
  if (appointmentDate) {
    const appointmentDateNormalized = new Date(appointmentDate);
    appointmentDateNormalized.setHours(0, 0, 0, 0);

    // Calculer la différence en jours
    const diffTime = today - appointmentDateNormalized;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Le rendez-vous doit avoir eu lieu il y a au moins 1 jour
    isPastAppointment = diffDays >= 1;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    const days = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    return `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-6 flex items-center justify-between">
          <h3 className="text-2xl font-black text-white">
            Détails du rendez-vous
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Informations client */}
          <div className="bg-[#fcebeb] rounded-xl p-5">
            <h4 className="font-bold text-[#8b6f6f] mb-4 text-lg flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Client
            </h4>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Nom :</span>{" "}
                {appointment.prenom} {appointment.nom}
              </p>
              <p className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-[#8b6f6f]" />
                <span className="font-semibold">Email :</span>{" "}
                {appointment.email}
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-[#8b6f6f]" />
                <span className="font-semibold">Téléphone :</span>{" "}
                {appointment.telephone}
              </p>
            </div>
          </div>

          {/* Informations rendez-vous */}
          <div className="bg-[#fcebeb] rounded-xl p-5">
            <h4 className="font-bold text-[#8b6f6f] mb-4 text-lg flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Rendez-vous
            </h4>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Service :</span>{" "}
                {appointment.service}
              </p>
              <p>
                <span className="font-semibold">Date :</span>{" "}
                {formatDate(appointment.date)}
              </p>
              <p>
                <span className="font-semibold">Heure :</span>{" "}
                {appointment.heure}
              </p>
              <p>
                <span className="font-semibold">Statut :</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status === "completed"
                    ? "Effectué"
                    : appointment.status === "confirmed"
                    ? "Confirmé"
                    : appointment.status === "cancelled"
                    ? "Annulé"
                    : "En attente"}
                </span>
              </p>
              {!appointment.carteCadeaux && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Paiement :</span>
                  {onUpdateMoyenPaiement ? (
                    <select
                      value={appointment.moyenPaiement || ""}
                      onChange={(e) => {
                        const value = e.target.value || null;
                        onUpdateMoyenPaiement(appointment._id, value);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf]"
                    >
                      <option value="">—</option>
                      <option value="especes">Espèces</option>
                      <option value="cheque">Chèque</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        appointment.moyenPaiement
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {appointment.moyenPaiement === "especes"
                        ? "Espèces"
                        : appointment.moyenPaiement === "cheque"
                        ? "Chèque"
                        : "—"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {(appointment.message || appointment.carteCadeaux) && (
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-bold text-[#8b6f6f] mb-2">Message</h4>
              {appointment.carteCadeaux && (
                <>
                  <p className="font-medium text-[#8b6f6f] mb-2">
                    Soin offert par une carte cadeau.
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Le client doit se présenter avec la carte physique et indiquer le numéro de la carte pour validation.
                  </p>
                  {appointment.codeCarteCadeau && (
                    <p className="text-sm font-mono font-semibold text-[#8b6f6f]">
                      N° carte : {appointment.codeCarteCadeau}
                    </p>
                  )}
                </>
              )}
              {appointment.message && (
                <p className="text-gray-700 italic">{appointment.message}</p>
              )}
            </div>
          )}

          {/* Statut email de suivi */}
          {isPastAppointment && appointment.suiviEmailEnvoye && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                Email de suivi envoyé le{" "}
                {new Date(appointment.dateSuiviEmail).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 flex-wrap">
            {/* Boutons de changement de statut */}
            {onUpdateStatus && !appointment.carteCadeaux && (
              <>
                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Marquer ce rendez-vous comme effectué ? (Le client est venu au salon.)"
                        )
                      ) {
                        onUpdateStatus(appointment._id, "completed");
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                    Séance effectuée
                  </button>
                )}
                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Annuler ce rendez-vous ? Le client recevra un email d'annulation."
                        )
                      ) {
                        onUpdateStatus(appointment._id, "cancelled");
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Annuler
                  </button>
                )}
                {appointment.status !== "pending" && appointment.status !== "completed" && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Remettre ce rendez-vous en attente ?"
                        )
                      ) {
                        onUpdateStatus(appointment._id, "pending");
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    <ClockIcon className="w-5 h-5" />
                    Remettre en attente
                  </button>
                )}
              </>
            )}
            {onSendFollowUp &&
              isPastAppointment &&
              !appointment.carteCadeaux &&
              !appointment.suiviEmailEnvoye && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Envoyer un email de suivi au client pour lui demander son avis ?"
                      )
                    ) {
                      onSendFollowUp(appointment._id);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Envoyer suivi
                </button>
              )}
            {onDelete && !appointment.carteCadeaux && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Le client recevra un email d'annulation."
                    )
                  ) {
                    onDelete(appointment._id);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentModal;
