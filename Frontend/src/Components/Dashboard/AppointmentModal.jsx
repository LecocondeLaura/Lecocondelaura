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
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../../config/api.config.js";
import { getAvailableTimesForDate } from "../../utils/appointments.js";
import {
  ALL_SLOT_TIMES,
  filterSlotsForService,
  getServiceDuration,
} from "../../utils/appointmentSlots.js";

function AppointmentModal({
  appointment,
  onClose,
  onDelete,
  onSendFollowUp,
  onUpdateStatus,
  onUpdateMoyenPaiement,
  onUpdateCodeCarteCadeau,
  onReschedule,
  onSaveNotes,
}) {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isDateClosed, setIsDateClosed] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [availableGiftCards, setAvailableGiftCards] = useState([]);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (!appointment?.date) return;
    setRescheduleDate(new Date(appointment.date).toISOString().split("T")[0]);
    setRescheduleTime(appointment.heure || "");
  }, [appointment?._id, appointment?.date, appointment?.heure]);

  useEffect(() => {
    setGiftCardCode(appointment?.codeCarteCadeau || "");
  }, [appointment?._id, appointment?.codeCarteCadeau]);

  useEffect(() => {
    setNotes(appointment?.notes || "");
  }, [appointment?._id, appointment?.notes]);

  useEffect(() => {
    if (
      !appointment ||
      appointment.carteCadeaux ||
      appointment.moyenPaiement !== "carte_cadeaux"
    ) {
      return;
    }

    let cancelled = false;
    const loadAvailableGiftCards = async () => {
      try {
        setLoadingGiftCards(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/appointments/gift-cards/available`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();
        if (!cancelled && data.success) {
          setAvailableGiftCards(data.data || []);
        }
      } catch (error) {
        console.error("Erreur chargement cartes cadeaux:", error);
      } finally {
        if (!cancelled) setLoadingGiftCards(false);
      }
    };

    loadAvailableGiftCards();
    return () => {
      cancelled = true;
    };
  }, [appointment?._id, appointment?.moyenPaiement, appointment?.carteCadeaux]);

  useEffect(() => {
    if (
      !appointment ||
      appointment.carteCadeaux ||
      !rescheduleDate ||
      !appointment.service
    ) {
      setAvailableTimes([]);
      setIsDateClosed(false);
      setAvailabilityError(false);
      return;
    }

    let cancelled = false;
    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        const result = await getAvailableTimesForDate(
          rescheduleDate,
          ALL_SLOT_TIMES,
          { excludeId: appointment._id },
        );
        if (cancelled) return;

        setAvailabilityError(result.hasError === true);
        if (result.isClosed) {
          setAvailableTimes([]);
          setIsDateClosed(true);
          setRescheduleTime("");
          return;
        }

        setIsDateClosed(false);
        let filtered = filterSlotsForService({
          allTimes: ALL_SLOT_TIMES,
          service: appointment.service,
          reservedAppointments: result.reservedAppointments || [],
          closureBlockedTimes: result.closureBlockedTimes || [],
        });

        // Garder l'heure actuelle si on reste sur le même jour
        const currentDateKey = appointment.date
          ? new Date(appointment.date).toISOString().split("T")[0]
          : null;
        if (
          currentDateKey === rescheduleDate &&
          appointment.heure &&
          !filtered.includes(appointment.heure)
        ) {
          filtered = [...filtered, appointment.heure].sort();
        }

        setAvailableTimes(filtered);
        setRescheduleTime((prev) =>
          prev && !filtered.includes(prev) ? "" : prev,
        );
      } catch (error) {
        console.error("Erreur créneaux reprogrammation:", error);
        if (!cancelled) {
          setAvailableTimes([]);
          setAvailabilityError(true);
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [appointment?._id, appointment?.service, rescheduleDate]);

  if (!appointment) return null;

  const appointmentDate = appointment.date ? new Date(appointment.date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isPastAppointment = false;
  if (appointmentDate) {
    const appointmentDateNormalized = new Date(appointmentDate);
    appointmentDateNormalized.setHours(0, 0, 0, 0);
    const diffTime = today - appointmentDateNormalized;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
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

  const durationMin = getServiceDuration(appointment.service);
  const notesDirty = (notes || "") !== (appointment.notes || "");

  const handleSaveNotes = async () => {
    if (!onSaveNotes) return false;
    setIsSavingNotes(true);
    const ok = await onSaveNotes(appointment._id, notes);
    setIsSavingNotes(false);
    return ok;
  };

  const handleClose = async () => {
    if (notesDirty && onSaveNotes) {
      await handleSaveNotes();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-6 flex items-center justify-between">
          <h3 className="text-2xl font-black text-white">
            Détails du rendez-vous
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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

          {/* Note interne — en haut pour bien la voir */}
          {onSaveNotes && (
            <div className="rounded-xl border-2 border-[#e8c96a] bg-[#fff8e1] p-5">
              <h4 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#8b6f6f]">
                <PencilSquareIcon className="h-5 w-5" />
                Note sur cette cliente
              </h4>
              <p className="mb-3 text-xs text-gray-600">
                Après enregistrement, la note s’affiche sur la card dans
                l’agenda (non envoyée à la cliente).
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Ex. : préfère musique douce, allergie, à rappeler…"
                className="w-full rounded-xl border border-[#e8c96a] bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f0cfcf]"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-400">{notes.length}/2000</span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!notesDirty || isSavingNotes}
                  className="rounded-xl bg-[#8b6f6f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a5f5f] disabled:opacity-50"
                >
                  {isSavingNotes ? "Enregistrement…" : "Enregistrer la note"}
                </button>
              </div>
            </div>
          )}

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
                <span className="font-semibold">Durée :</span> {durationMin} min
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
                      <select
                        value={giftCardCode}
                        onChange={(e) => {
                          const value = e.target.value;
                          setGiftCardCode(value);
                          if (onUpdateCodeCarteCadeau) {
                            onUpdateCodeCarteCadeau(
                              appointment._id,
                              value || null,
                            );
                          }
                        }}
                        className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf]"
                      >
                        <option value="">
                          {loadingGiftCards
                            ? "Chargement des cartes…"
                            : "Sélectionner une carte cadeau"}
                        </option>
                        {giftCardCode &&
                          !availableGiftCards.some(
                            (c) => c.codeCarteCadeau === giftCardCode,
                          ) && (
                            <option value={giftCardCode}>
                              {giftCardCode} (déjà sélectionnée)
                            </option>
                          )}
                        {availableGiftCards.map((card) => (
                          <option key={card._id} value={card.codeCarteCadeau}>
                            {card.codeCarteCadeau}
                            {" — "}
                            {card.prenom} {card.nom}
                            {card.service ? ` — ${card.service}` : ""}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-500">
                        {availableGiftCards.length === 0 && !loadingGiftCards
                          ? "Aucune carte cadeau disponible (envoyée et non utilisée)."
                          : "Choisis le code dans la liste — la carte sera marquée comme utilisée."}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {(appointment.message || appointment.carteCadeaux) && (
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-bold text-[#8b6f6f] mb-2">
                Message de la cliente
              </h4>
              {appointment.carteCadeaux && (
                <>
                  <p className="font-medium text-[#8b6f6f] mb-2">
                    Soin offert par une carte cadeau.
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Le client doit se présenter avec la carte physique et
                    indiquer le numéro de la carte pour validation.
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

          {isPastAppointment && appointment.suiviEmailEnvoye && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                Email de suivi envoyé le{" "}
                {new Date(appointment.dateSuiviEmail).toLocaleDateString(
                  "fr-FR",
                )}
              </p>
            </div>
          )}

          {onReschedule &&
            !appointment.carteCadeaux &&
            appointment.status !== "cancelled" &&
            appointment.status !== "completed" && (
              <div className="bg-[#fcebeb] rounded-xl p-5">
                <h4 className="font-bold text-[#8b6f6f] mb-2 text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Avancer ou décaler le rendez-vous
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Chaque soin bloque sa durée + 30 min de préparation. Ex. :
                  60 min à 14h → libre à partir de 15h30 ; un 30 min à 13h30
                  est refusé (finirait à 14h30). Un email sera envoyé à{" "}
                  {appointment.email}.
                </p>
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
                      disabled={loadingSlots || isDateClosed}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f0cfcf] focus:border-[#f0cfcf] outline-none transition-all bg-white disabled:opacity-60"
                    >
                      <option value="">
                        {loadingSlots
                          ? "Chargement…"
                          : isDateClosed
                            ? "Jour fermé"
                            : "Choisir une heure"
                          }
                      </option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {availabilityError && (
                  <p className="mt-2 text-sm text-red-600">
                    Impossible de charger les créneaux. Réessayez.
                  </p>
                )}
                {!loadingSlots &&
                  !isDateClosed &&
                  !availabilityError &&
                  availableTimes.length === 0 &&
                  rescheduleDate && (
                    <p className="mt-2 text-sm text-amber-700">
                      Aucun créneau libre ce jour-là pour ce soin.
                    </p>
                  )}
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      if (!rescheduleDate || !rescheduleTime) return;
                      if (
                        !window.confirm(
                          `Reprogrammer au ${rescheduleDate} à ${rescheduleTime} ?\nLa cliente recevra un email.`,
                        )
                      ) {
                        return;
                      }
                      setIsRescheduling(true);
                      await onReschedule(
                        appointment._id,
                        rescheduleDate,
                        rescheduleTime,
                      );
                      setIsRescheduling(false);
                    }}
                    disabled={
                      !rescheduleDate ||
                      !rescheduleTime ||
                      isRescheduling ||
                      loadingSlots
                    }
                    className="px-5 py-2.5 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] disabled:opacity-50 transition-colors"
                  >
                    {isRescheduling
                      ? "Reprogrammation…"
                      : "Reprogrammer et prévenir la cliente"}
                  </button>
                </div>
              </div>
            )}

          <div className="flex justify-end gap-3 flex-wrap">
            {onUpdateStatus && !appointment.carteCadeaux && (
              <>
                {appointment.status !== "cancelled" &&
                  appointment.status !== "completed" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Marquer ce rendez-vous comme effectué ? (Le client est venu au salon.)",
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
                {appointment.status !== "cancelled" &&
                  appointment.status !== "completed" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Annuler ce rendez-vous ? Le client recevra un email d'annulation.",
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
                {appointment.status !== "pending" &&
                  appointment.status !== "completed" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remettre ce rendez-vous en attente ?",
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
                        "Envoyer un email de suivi au client ?",
                      )
                    ) {
                      onSendFollowUp(appointment._id);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-taupe text-white rounded-xl font-semibold hover:bg-ink transition-colors"
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
                      "Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Le client recevra un email d'annulation.",
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
              onClick={handleClose}
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
