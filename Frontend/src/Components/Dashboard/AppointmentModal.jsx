import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

function AppointmentModal({
  appointment,
  onClose,
  onDelete,
  onSendFollowUp,
  onUpdateStatus,
  onUpdateMoyenPaiement,
  onUpdateCodeCarteCadeau,
  onReschedule,
}) {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const allTimes = ["09:00", "11:00", "14:00", "16:00", "18:00"];

  useEffect(() => {
    if (!appointment?.date) return;
    setRescheduleDate(new Date(appointment.date).toISOString().split("T")[0]);
    setRescheduleTime(appointment.heure || "");
  }, [appointment?._id, appointment?.date, appointment?.heure]);
  useEffect(() => {
    setGiftCardCode(appointment?.codeCarteCadeau || "");
  }, [appointment?._id, appointment?.codeCarteCadeau]);
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
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Statut :</span>{" "}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status === "cancelled" && (
                    <XCircleIcon className="w-4 h-4 shrink-0" aria-hidden />
                  )}
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
                <div className="flex flex-col gap-2">
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
                        <option value="virement">Virement</option>
                        <option value="carte_cadeaux">Carte cadeau</option>
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
                          : appointment.moyenPaiement === "virement"
                          ? "Virement"
                          : appointment.moyenPaiement === "carte_cadeaux"
                          ? "Carte cadeau"
                          : "—"}
                      </span>
                    )}
                  </div>
                  {appointment.moyenPaiement === "carte_cadeaux" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        N° carte cadeau
                      </label>
                      <input
                        type="text"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                        onBlur={() =>
                          onUpdateCodeCarteCadeau &&
                          onUpdateCodeCarteCadeau(
                            appointment._id,
                            giftCardCode.trim() || null
                          )
                        }
                        placeholder="Ex : CC-ABC123"
                        className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 font-mono focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf]"
                      />
                      <span className="text-xs text-gray-500">
                        Modifiez puis cliquez ailleurs pour enregistrer.
                      </span>
                    </div>
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

          {/* Reprogrammation */}
          {onReschedule &&
            !appointment.carteCadeaux &&
            appointment.status !== "cancelled" &&
            appointment.status !== "completed" && (
              <div className="bg-[#fcebeb] rounded-xl p-5">
                <h4 className="font-bold text-[#8b6f6f] mb-4 text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Reprogrammer le rendez-vous
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nouvelle date
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nouvelle heure
                    </label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all bg-white"
                    >
                      <option value="">Choisir une heure</option>
                      {allTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      if (!rescheduleDate || !rescheduleTime) return;
                      setIsRescheduling(true);
                      await onReschedule(
                        appointment._id,
                        rescheduleDate,
                        rescheduleTime
                      );
                      setIsRescheduling(false);
                    }}
                    disabled={!rescheduleDate || !rescheduleTime || isRescheduling}
                    className="px-5 py-2.5 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] disabled:opacity-50 transition-colors"
                  >
                    {isRescheduling ? "Reprogrammation…" : "Reprogrammer"}
                  </button>
                </div>
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
