import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../../config/api.config.js";
import { getAvailableTimesForDate } from "../../utils/appointments.js";

function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    service: "",
    date: "",
    heure: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isDateClosed, setIsDateClosed] = useState(false);
  const [errors, setErrors] = useState({});

  const services = [
    "Head Spa Kodomo - 60min (enfant)",
    "Head Spa Rituel Détente - 60min",
    "Head Spa Rituel Ultime - 90min",
  ];

  const allTimes = ["09:00", "11:00", "14:00", "16:00", "18:00"];

  // Fonction pour obtenir la durée du soin en minutes
  const getServiceDuration = (serviceName) => {
    if (serviceName.includes("45min")) return 45;
    if (serviceName.includes("60min")) return 60;
    if (serviceName.includes("90min")) return 90;
    return 60;
  };

  // Fonction pour obtenir les créneaux bloqués selon la durée du soin
  const getBlockedSlots = (startTime, serviceName) => {
    const duration = getServiceDuration(serviceName);
    let blockedSlots = [startTime];

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    let blockedMinutes;

    if (duration === 45 || duration === 60) {
      blockedMinutes = startMinutes + 90;
    } else if (duration === 90) {
      blockedMinutes = startMinutes + 120;
    }

    allTimes.forEach((time) => {
      const timeMinutes = timeToMinutes(time);
      if (timeMinutes >= startMinutes && timeMinutes < blockedMinutes) {
        if (!blockedSlots.includes(time)) {
          blockedSlots.push(time);
        }
      }
    });

    return blockedSlots;
  };

  // Charger les créneaux disponibles quand la date ou le service change
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (formData.date && formData.service) {
        try {
          const result = await getAvailableTimesForDate(
            formData.date,
            allTimes,
          );

          if (result.isClosed) {
            setAvailableTimes([]);
            setIsDateClosed(true);
            if (formData.heure) setFormData((prev) => ({ ...prev, heure: "" }));
            return;
          }
          setIsDateClosed(false);

          const allBlockedSlots = new Set();
          result.reservedAppointments.forEach((apt) => {
            const blocked = getBlockedSlots(apt.heure, apt.service);
            blocked.forEach((slot) => allBlockedSlots.add(slot));
          });

          let filtered = allTimes.filter((time) => !allBlockedSlots.has(time));

          filtered = filtered.filter((time) => {
            const wouldBlock = getBlockedSlots(time, formData.service);
            return !wouldBlock.some((blockedTime) =>
              result.reservedAppointments.some(
                (apt) => apt.heure === blockedTime,
              ),
            );
          });

          setAvailableTimes(filtered);
          if (formData.heure && !filtered.includes(formData.heure)) {
            setFormData((prev) => ({ ...prev, heure: "" }));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des horaires:", error);
          setAvailableTimes([]);
          setIsDateClosed(false);
        }
      } else {
        setAvailableTimes([]);
        setIsDateClosed(false);
        if (!formData.service) {
          setFormData((prev) => ({ ...prev, heure: "" }));
        }
      }
    };

    fetchAvailableTimes();
  }, [formData.date, formData.service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    }
    if (!formData.service) newErrors.service = "Le service est requis";
    if (!formData.date) newErrors.date = "La date est requise";
    if (!formData.heure) newErrors.heure = "L'heure est requise";

    // Vérifier que ce n'est pas un dimanche
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0) {
        newErrors.date = "Le dimanche n'est pas disponible";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          carteCadeaux: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        // Réinitialiser le formulaire
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          service: "",
          date: "",
          heure: "",
          message: "",
        });
        setErrors({});
      } else {
        setErrors({ submit: data.message || "Erreur lors de la création" });
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setErrors({
        submit: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-6 flex items-center justify-between">
          <h3 className="text-2xl font-black text-white">
            Créer un nouveau rendez-vous
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Informations client */}
          <div className="bg-[#fcebeb] rounded-xl p-5">
            <h4 className="font-bold text-[#8b6f6f] mb-4 text-lg flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informations client
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all ${
                    errors.nom
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="Nom"
                />
                {errors.nom && (
                  <p className="text-red-600 text-xs mt-1">{errors.nom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all ${
                    errors.prenom
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="Prénom"
                />
                {errors.prenom && (
                  <p className="text-red-600 text-xs mt-1">{errors.prenom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all ${
                    errors.telephone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="06 12 34 56 78"
                />
                {errors.telephone && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.telephone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations rendez-vous */}
          <div className="bg-[#fcebeb] rounded-xl p-5">
            <h4 className="font-bold text-[#8b6f6f] mb-4 text-lg flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Détails du rendez-vous
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all appearance-none cursor-pointer ${
                    errors.service
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`}
                >
                  <option value="">Sélectionnez un service</option>
                  {services.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <p className="text-red-600 text-xs mt-1">{errors.service}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all ${
                      errors.date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`}
                  />
                  {errors.date && (
                    <p className="text-red-600 text-xs mt-1">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Heure *
                  </label>
                  {formData.date && formData.service ? (
                    availableTimes.length > 0 ? (
                      <select
                        name="heure"
                        value={formData.heure}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all appearance-none cursor-pointer ${
                          errors.heure
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50 focus:bg-white"
                        }`}
                      >
                        <option value="">Sélectionnez une heure</option>
                        {availableTimes.map((heure, index) => (
                          <option key={index} value={heure}>
                            {heure}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl bg-amber-50">
                        <p className="text-amber-800 text-sm font-semibold">
                          {isDateClosed
                            ? "Le salon est fermé à cette date (congés ou fermeture). Choisissez un autre jour."
                            : "Aucun créneau disponible pour cette date"}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100">
                      <p className="text-gray-500 text-sm">
                        Veuillez d'abord sélectionner une date et un service
                      </p>
                    </div>
                  )}
                  {errors.heure && (
                    <p className="text-red-600 text-xs mt-1">{errors.heure}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                  placeholder="Notes, allergies, informations complémentaires..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création..." : "Créer le rendez-vous"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAppointmentModal;
