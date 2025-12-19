import React from "react";
import {
  XMarkIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

function AppointmentModal({ appointment, onClose }) {
  if (!appointment) return null;

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
                    appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status === "confirmed"
                    ? "Confirmé"
                    : appointment.status === "cancelled"
                    ? "Annulé"
                    : "En attente"}
                </span>
              </p>
            </div>
          </div>

          {/* Message */}
          {appointment.message && (
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-bold text-[#8b6f6f] mb-2">Message</h4>
              <p className="text-gray-700 italic">{appointment.message}</p>
            </div>
          )}

          {/* Bouton fermer */}
          <div className="flex justify-end">
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
