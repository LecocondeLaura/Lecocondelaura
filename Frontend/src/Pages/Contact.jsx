import React, { useState, useEffect } from "react";
import {
  addAppointment,
  getAvailableTimesForDate,
} from "../utils/appointments";
import API_BASE_URL from "../config/api.config.js";

function Contact() {
  const showAdress = false;
  const [upcomingClosures, setUpcomingClosures] = useState([]);
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

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isDateClosed, setIsDateClosed] = useState(false);
  const [showSundayAlert, setShowSundayAlert] = useState(false);
  const [carteCadeaux, setCarteCadeaux] = useState(false);

  const allTimes = ["09:00", "11:00", "14:00", "16:00", "18:00"];

  // Date du jour au format YYYY-MM-DD (fuseau local)
  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  // True si la date est aujourd'hui ET que l'heure du créneau est déjà passée (aligné sur l'heure actuelle)
  const isTimePast = (dateStr, timeStr) => {
    if (!dateStr || dateStr !== getTodayStr()) return false;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = hours * 60 + minutes;
    return slotMinutes <= nowMinutes;
  };

  // Date minimale pour réserver : à partir du 16 février (du jour ou de l'année en cours)
  const getMinBookingDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const feb16 = `${year}-02-16`;
    const today = getTodayStr();
    return today < feb16 ? feb16 : today;
  };

  // Charger les prochaines fermetures pour la bannière
  useEffect(() => {
    fetch(`${API_BASE_URL}/closures/upcoming`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) setUpcomingClosures(data.data);
      })
      .catch(() => {});
  }, []);

  // Rafraîchir la liste des créneaux chaque minute quand la date sélectionnée est aujourd'hui (heure actuelle)
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!formData.date || formData.date !== getTodayStr()) return;
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [formData.date]);

  const formatClosureDate = (str) => {
    const d = new Date(str + "T12:00:00");
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fonction pour obtenir la durée du soin en minutes
  const getServiceDuration = (serviceName) => {
    if (serviceName.includes("45min")) return 45;
    if (serviceName.includes("60min")) return 60;
    if (serviceName.includes("90min")) return 90;
    return 60; // Par défaut
  };

  // Fonction pour obtenir les créneaux bloqués selon la durée du soin
  const getBlockedSlots = (startTime, serviceName) => {
    const duration = getServiceDuration(serviceName);
    let blockedSlots = [startTime];

    // Convertir l'heure en minutes depuis minuit
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    let blockedMinutes;

    if (duration === 45 || duration === 60) {
      // Pour 45min ou 1h → bloquer 1h30 (90 minutes)
      blockedMinutes = startMinutes + 90;
    } else if (duration === 90) {
      // Pour 1h30 → bloquer 2h (120 minutes)
      blockedMinutes = startMinutes + 120;
    }

    // Trouver tous les créneaux qui se chevauchent
    allTimes.forEach((time) => {
      const timeMinutes = timeToMinutes(time);
      // Si le créneau commence avant la fin du soin, il est bloqué
      if (timeMinutes >= startMinutes && timeMinutes < blockedMinutes) {
        if (!blockedSlots.includes(time)) {
          blockedSlots.push(time);
        }
      }
    });

    return blockedSlots;
  };

  // Mettre à jour les horaires disponibles quand la date ou le service change
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

          // Calculer tous les créneaux bloqués par les rendez-vous existants
          const allBlockedSlots = new Set();
          result.reservedAppointments.forEach((apt) => {
            const blocked = getBlockedSlots(apt.heure, apt.service);
            blocked.forEach((slot) => allBlockedSlots.add(slot));
          });

          // Filtrer les créneaux disponibles en excluant ceux qui sont bloqués
          let filtered = allTimes.filter((time) => !allBlockedSlots.has(time));

          // Pour chaque créneau disponible, vérifier s'il serait bloqué par le service sélectionné
          // (on ne peut pas prendre un créneau si notre soin bloquerait un autre créneau déjà réservé)
          filtered = filtered.filter((time) => {
            const wouldBlock = getBlockedSlots(time, formData.service);
            // Vérifier si notre soin ne chevauche pas avec un rendez-vous existant
            return !wouldBlock.some((blockedTime) =>
              result.reservedAppointments.some(
                (apt) => apt.heure === blockedTime,
              ),
            );
          });

          // Pour la date du jour : exclure les créneaux déjà passés (aligné sur l'heure actuelle)
          if (formData.date === getTodayStr()) {
            filtered = filtered.filter(
              (time) => !isTimePast(formData.date, time),
            );
          }

          setAvailableTimes(filtered);
          // Réinitialiser l'heure si elle n'est plus disponible
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, formData.service]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    // Gérer la checkbox carte cadeaux
    if (name === "carteCadeaux") {
      setCarteCadeaux(checked);
      // Si on coche la carte cadeaux, on vide date et heure
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          date: "",
          heure: "",
        }));
        setAvailableTimes([]);
      }
      return;
    }

    // Vérifier si la date sélectionnée est un dimanche
    if (name === "date" && value) {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay(); // 0 = dimanche, 1 = lundi, etc.

      if (dayOfWeek === 0) {
        setShowSundayAlert(true);
        setFormData((prev) => ({
          ...prev,
          date: "",
        }));
        // Masquer la popup après 4 secondes
        setTimeout(() => {
          setShowSundayAlert(false);
        }, 4000);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Si ce n'est pas une carte cadeaux, vérifier la date et l'heure
      if (!carteCadeaux) {
        // Vérifier que la date est à partir du 16 février
        if (formData.date < getMinBookingDate()) {
          alert("Les réservations sont possibles à partir du 16 février.");
          setIsLoading(false);
          return;
        }
        // Vérifier que ce n'est pas un dimanche
        const selectedDate = new Date(formData.date);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0) {
          setShowSundayAlert(true);
          setIsLoading(false);
          // Masquer la popup après 4 secondes
          setTimeout(() => {
            setShowSundayAlert(false);
          }, 4000);
          return;
        }

        // Vérifier que le créneau est toujours disponible
        const result = await getAvailableTimesForDate(formData.date, allTimes);

        // Calculer tous les créneaux bloqués par les rendez-vous existants
        const allBlockedSlots = new Set();
        result.reservedAppointments.forEach((apt) => {
          const blocked = getBlockedSlots(apt.heure, apt.service);
          blocked.forEach((slot) => allBlockedSlots.add(slot));
        });

        // Vérifier si notre créneau est disponible
        if (allBlockedSlots.has(formData.heure)) {
          alert(
            "Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.",
          );
          setIsLoading(false);
          return;
        }

        // Vérifier si notre soin ne chevauche pas avec un rendez-vous existant
        const wouldBlock = getBlockedSlots(formData.heure, formData.service);
        const wouldConflict = wouldBlock.some((blockedTime) =>
          result.reservedAppointments.some((apt) => apt.heure === blockedTime),
        );

        if (wouldConflict) {
          alert(
            "Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.",
          );
          setIsLoading(false);
          return;
        }
      }

      // Préparer les données à envoyer
      const dataToSend = {
        ...formData,
        carteCadeaux: carteCadeaux,
      };

      await addAppointment(dataToSend);

      setIsSubmitted(true);

      // Réinitialiser le formulaire après 15 secondes
      setTimeout(() => {
        setIsSubmitted(false);
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
        setCarteCadeaux(false);
        setAvailableTimes([]);
      }, 15000);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      alert(
        "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    "Head Spa Kodomo - 60min (enfant)",
    "Head Spa Rituel Détente - 60min",
    "Head Spa Rituel Ultime - 90min",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-20 pb-16 px-4 sm:px-6 lg:px-12 lg:pt-16 lg:pb-20 lg:mt-20 mt-12 relative">
      {/* Toast chaleureux pour dimanche */}
      {showSundayAlert && (
        <div className="fixed top-4 sm:top-10 left-1/2 transform -translate-x-1/2 z-50 animate-toast-in w-full px-4 sm:px-0 sm:w-auto">
          <div className="bg-gradient-to-br from-[#fef5f5] to-white rounded-2xl shadow-lg p-4 sm:p-5 max-w-sm mx-auto border border-[#f0cfcf]/30 backdrop-blur-sm">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b6f6f]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-[#8b6f6f] mb-1">
                  Dimanche fermé
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Nous sommes fermés le dimanche. Veuillez choisir un autre jour
                  pour votre rendez-vous.
                </p>
              </div>
              <button
                onClick={() => setShowSundayAlert(false)}
                className="flex-shrink-0 text-gray-400 hover:text-[#8b6f6f] transition-colors ml-1 sm:ml-2"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-start h-full">
          {/* Colonne gauche : Titre et informations */}
          <div className="lg:pl-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <h1 className="text-9xl font-black text-[#f0cfcf]">
                  RÉSERVATION
                </h1>
              </div>
              <div className="relative z-10">
                <h1 className="text-5xl sm:text-6xl font-black text-[#8b6f6f] mb-6 leading-tight">
                  Réservez votre
                  <br />
                  <span className="text-4xl sm:text-5xl text-[#f0cfcf] font-alex-brush">
                    Head Spa
                  </span>
                </h1>
                <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mb-8 rounded-full"></div>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Remplissez le formulaire pour réserver votre moment de
                  détente.
                </p>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              <div className="bg-[#fcebeb] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#f0cfcf]/50 group">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    📧
                  </div>
                  <div>
                    <h3 className="font-bold text-[#8b6f6f] mb-1 text-lg">
                      Email
                    </h3>
                    <p className="text-gray-600">lecocondelaura17@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    📞
                  </div>
                  <div>
                    <h3 className="font-bold text-[#8b6f6f] mb-1 text-lg">
                      Téléphone
                    </h3>
                    <p className="text-gray-600">07 87 98 43 41</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    📍
                  </div>
                  <div>
                    <h3 className="font-bold text-[#8b6f6f] mb-1 text-lg">
                      Adresse
                    </h3>
                    <p
                      className={`text-gray-600 select-none ${!showAdress ? "blur-md pointer-events-none" : ""}`}
                      aria-hidden={!showAdress}
                    >
                      70 rue Sadi Carnot, 17500 Jonzac
                    </p>
                    {!showAdress && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        Bientôt révélée à l&apos;ouverture
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Formulaire */}
          <div className="relative lg:-mt-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] rounded-3xl blur opacity-20"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12 border border-gray-100 w-full">
              {isSubmitted ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] rounded-full mb-6 animate-pulse">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-black text-[#8b6f6f]">
                    {carteCadeaux
                      ? "Demande de carte cadeau envoyée"
                      : "Réservation confirmée"}
                  </h2>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-[#f0cfcf]/50">
                  {upcomingClosures.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-amber-800 font-semibold text-sm flex items-center gap-2 mb-2">
                        <span className="text-lg" aria-hidden>
                          📅
                        </span>
                        Le salon sera fermé
                      </p>
                      <ul className="text-amber-700 text-sm space-y-1">
                        {upcomingClosures.map((c, i) => (
                          <li key={i}>
                            {c.startDate === c.endDate
                              ? `Le ${formatClosureDate(c.startDate)}`
                              : `Du ${formatClosureDate(c.startDate)} au ${formatClosureDate(c.endDate)}`}
                            {c.label ? ` — ${c.label}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <label
                          htmlFor="nom"
                          className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                        >
                          Nom *
                        </label>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="Votre nom"
                        />
                      </div>
                      <div className="group">
                        <label
                          htmlFor="prenom"
                          className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                        >
                          Prénom *
                        </label>
                        <input
                          type="text"
                          id="prenom"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="Votre prénom"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <label
                          htmlFor="email"
                          className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div className="group">
                        <label
                          htmlFor="telephone"
                          className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                        >
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          id="telephone"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="service"
                        className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                      >
                        Service souhaité *
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez un service</option>
                        {services.map((service, index) => (
                          <option key={index} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>

                      {/* Checkbox Carte Cadeaux - affichée uniquement si un service est sélectionné */}
                      {formData.service && (
                        <div className="mt-4 flex items-center">
                          <input
                            type="checkbox"
                            id="carteCadeaux"
                            name="carteCadeaux"
                            checked={carteCadeaux}
                            onChange={handleChange}
                            className="w-5 h-5 text-[#8b6f6f] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] cursor-pointer"
                          />
                          <label
                            htmlFor="carteCadeaux"
                            className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer"
                          >
                            CARTE CADEAUX
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Champs Date et Heure - cachés si carte cadeaux est cochée */}
                    {!carteCadeaux && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group">
                          <label
                            htmlFor="date"
                            className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                          >
                            Date souhaitée *
                          </label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            min={getMinBookingDate()}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                          />
                        </div>
                        <div className="group">
                          <label
                            htmlFor="heure"
                            className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                          >
                            Heure souhaitée *
                          </label>
                          {formData.date ? (
                            availableTimes.length > 0 ||
                            allTimes.some((t) =>
                              isTimePast(formData.date, t),
                            ) ? (
                              <select
                                id="heure"
                                name="heure"
                                value={formData.heure}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                              >
                                <option value="">Sélectionnez une heure</option>
                                {allTimes.map((heure, index) => {
                                  const past = isTimePast(formData.date, heure);
                                  const available =
                                    availableTimes.includes(heure);
                                  return (
                                    <option
                                      key={index}
                                      value={heure}
                                      disabled={past || !available}
                                      style={
                                        past ? { color: "#9ca3af" } : undefined
                                      }
                                    >
                                      {heure}
                                    </option>
                                  );
                                })}
                              </select>
                            ) : (
                              <div className="w-full px-5 py-4 border-2 border-amber-200 rounded-xl bg-amber-50">
                                <p className="text-amber-800 text-sm font-semibold">
                                  {isDateClosed
                                    ? "Le salon est fermé à cette date (congés ou fermeture). Choisissez un autre jour."
                                    : "Aucun créneau disponible pour cette date"}
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl bg-gray-100">
                              <p className="text-gray-500 text-sm">
                                Veuillez d'abord sélectionner une date
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="group">
                      <label
                        htmlFor="message"
                        className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide"
                      >
                        Message (optionnel)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 resize-none bg-gray-50 focus:bg-white"
                        placeholder="Des informations complémentaires, allergies, grossesse..."
                      ></textarea>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={
                          isLoading ||
                          (!carteCadeaux && !formData.heure) ||
                          (carteCadeaux && !formData.service)
                        }
                        className="w-full bg-[#8b6f6f] text-white py-5 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-[#7a5f5f] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading
                          ? "Envoi en cours..."
                          : carteCadeaux
                            ? "Confirmer la demande de carte cadeaux"
                            : "Confirmer la réservation"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
