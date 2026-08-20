import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import {
  addAppointment,
  getAvailableTimesForDate,
} from "../utils/appointments";
import API_BASE_URL from "../config/api.config.js";
import { BOOKING_SERVICES } from "../Data/bookingServices.js";

function Contact() {
  const [searchParams] = useSearchParams();
  const showAdress = true;
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
  const [availabilityError, setAvailabilityError] = useState(false);
  const [carteCadeaux, setCarteCadeaux] = useState(false);

  const allTimes = ["09:00", "11:00", "14:00", "16:00", "18:00"];

  // Préremplir le soin si on arrive depuis une card « Réserver »
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam && BOOKING_SERVICES.includes(serviceParam)) {
      setFormData((prev) => ({ ...prev, service: serviceParam }));
    }
  }, [searchParams]);

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const isTimePast = (dateStr, timeStr) => {
    if (!dateStr || dateStr !== getTodayStr()) return false;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = hours * 60 + minutes;
    return slotMinutes <= nowMinutes;
  };

  const getMinBookingDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const feb16 = `${year}-02-16`;
    const today = getTodayStr();
    return today < feb16 ? feb16 : today;
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/closures/upcoming`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) setUpcomingClosures(data.data);
      })
      .catch(() => {});
  }, []);

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

  const getServiceDuration = (serviceName) => {
    if (serviceName.includes("30min")) return 30;
    if (serviceName.includes("60min")) return 60;
    if (serviceName.includes("90min")) return 90;
    return 60;
  };

  const getBlockedSlots = (startTime, serviceName) => {
    const duration = getServiceDuration(serviceName);
    let blockedSlots = [startTime];

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    let blockedMinutes;

    if (duration === 30) {
      blockedMinutes = startMinutes + 60;
    } else if (duration === 60) {
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

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (formData.date && formData.service) {
        try {
          const result = await getAvailableTimesForDate(
            formData.date,
            allTimes,
          );
          setAvailabilityError(result.hasError === true);

          if (result.isClosed) {
            setAvailableTimes([]);
            setIsDateClosed(true);
            if (formData.heure) setFormData((prev) => ({ ...prev, heure: "" }));
            return;
          }
          setIsDateClosed(false);

          const closureBlockedSet = new Set(result.closureBlockedTimes || []);

          const allBlockedSlots = new Set();
          result.reservedAppointments.forEach((apt) => {
            const blocked = getBlockedSlots(apt.heure, apt.service);
            blocked.forEach((slot) => allBlockedSlots.add(slot));
          });

          let filtered = allTimes.filter(
            (time) =>
              !closureBlockedSet.has(time) && !allBlockedSlots.has(time),
          );

          filtered = filtered.filter((time) => {
            const wouldBlock = getBlockedSlots(time, formData.service);
            return !wouldBlock.some((blockedTime) =>
              result.reservedAppointments.some(
                (apt) => apt.heure === blockedTime,
              ),
            );
          });

          if (formData.date === getTodayStr()) {
            filtered = filtered.filter(
              (time) => !isTimePast(formData.date, time),
            );
          }

          setAvailableTimes(filtered);
          if (formData.heure && !filtered.includes(formData.heure)) {
            setFormData((prev) => ({ ...prev, heure: "" }));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des horaires:", error);
          setAvailableTimes([]);
          setIsDateClosed(false);
          setAvailabilityError(true);
        }
      } else {
        setAvailableTimes([]);
        setIsDateClosed(false);
        setAvailabilityError(false);
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

    if (name === "carteCadeaux") {
      setCarteCadeaux(checked);
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!carteCadeaux) {
        if (formData.date < getMinBookingDate()) {
          alert("Les réservations sont possibles à partir du 16 février.");
          setIsLoading(false);
          return;
        }
        const result = await getAvailableTimesForDate(formData.date, allTimes);
        if (result.hasError) {
          alert(
            "Impossible de vérifier les disponibilités pour le moment. Veuillez réessayer dans quelques instants.",
          );
          setIsLoading(false);
          return;
        }

        const closureBlockedSet = new Set(result.closureBlockedTimes || []);
        if (closureBlockedSet.has(formData.heure)) {
          alert(
            "Ce créneau n'est pas disponible. Veuillez choisir un autre horaire.",
          );
          setIsLoading(false);
          return;
        }

        const allBlockedSlots = new Set();
        result.reservedAppointments.forEach((apt) => {
          const blocked = getBlockedSlots(apt.heure, apt.service);
          blocked.forEach((slot) => allBlockedSlots.add(slot));
        });

        if (allBlockedSlots.has(formData.heure)) {
          alert(
            "Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.",
          );
          setIsLoading(false);
          return;
        }

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

      const dataToSend = {
        ...formData,
        carteCadeaux: carteCadeaux,
      };

      await addAppointment(dataToSend);

      setIsSubmitted(true);

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

  const services = BOOKING_SERVICES;

  const inputClass =
    "w-full rounded-xl border border-ink/10 bg-washi/60 px-4 py-3.5 font-body text-ink outline-none transition-all duration-300 placeholder:text-ink/35 focus:border-sakura-mid focus:bg-white focus:ring-4 focus:ring-sakura-soft/40";

  const labelClass =
    "mb-2 block font-body text-xs font-medium tracking-[0.12em] text-ink/55 uppercase";

  return (
    <div className="relative min-h-screen overflow-hidden bg-washi pt-28 pb-20">
      <div
        className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-sakura-soft/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-24 h-80 w-80 rounded-full bg-sakura-mid/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6">
        <header className="mb-12 text-center md:mb-16">
          <h1 className="font-display text-4xl font-medium text-ink sm:text-5xl md:text-6xl">
            Réservez votre{" "}
            <span className="font-alex-brush text-sakura-deep">Head Spa</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-sakura-mid/70" />
          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-ink/60">
            Choisissez votre soin, votre créneau… et laissez-vous guider vers un
            moment de douceur à Jonzac.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.9fr_1.35fr] lg:gap-10">
          {/* Infos salon */}
          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-3xl border border-sakura-soft/70 bg-white shadow-[0_20px_50px_-24px_rgba(47,40,38,0.25)]">
              <div className="bg-gradient-to-br from-ink via-[#3a302e] to-sakura-deep/70 px-7 py-8 text-washi">
                <p className="font-alex-brush text-3xl text-[#f8d5da]">
                  Le cocon de Laura
                </p>
                <p className="mt-2 font-body text-sm text-washi/70">
                  Head Spa japonais · Jonzac
                </p>
              </div>

              <div className="space-y-5 p-7">
                <a
                  href="mailto:lecocondelaura17@gmail.com"
                  className="group flex items-start gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0cfcf]/35 text-[#f8d5da] transition-colors group-hover:bg-[#f0cfcf]/55">
                    <EnvelopeIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-body text-xs tracking-wider text-ink/45 uppercase">
                      Email
                    </span>
                    <span className="font-body text-sm text-ink group-hover:text-sakura-deep">
                      lecocondelaura17@gmail.com
                    </span>
                  </span>
                </a>

                <a
                  href="tel:0787984341"
                  className="group flex items-start gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0cfcf]/35 text-[#f8d5da] transition-colors group-hover:bg-[#f0cfcf]/55">
                    <PhoneIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-body text-xs tracking-wider text-ink/45 uppercase">
                      Téléphone
                    </span>
                    <span className="font-body text-sm text-ink group-hover:text-sakura-deep">
                      07 87 98 43 41
                    </span>
                  </span>
                </a>

                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0cfcf]/35 text-[#f8d5da]">
                    <MapPinIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="block font-body text-xs tracking-wider text-ink/45 uppercase">
                      Adresse
                    </span>
                    <p
                      className={`font-body text-sm text-ink ${!showAdress ? "select-none blur-md" : ""}`}
                      aria-hidden={!showAdress}
                    >
                      70 rue Sadi Carnot, 17500 Jonzac
                    </p>
                    {!showAdress && (
                      <p className="mt-1 font-body text-xs italic text-ink/45">
                        Bientôt révélée à l&apos;ouverture
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-sakura-mid/50 bg-sakura-soft/20 px-6 py-5">
              <p className="font-display text-lg text-ink">
                Un premier pas vers la détente
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink/60">
                Essayez le{" "}
                <strong className="font-medium text-sakura-deep">
                  Soin Découverte
                </strong>{" "}
                à 50€ — idéal pour découvrir le Head Spa en douceur.
              </p>
            </div>
          </aside>

          {/* Formulaire */}
          <div className="rounded-3xl border border-sakura-soft/60 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(47,40,38,0.28)] sm:p-8 lg:p-10">
            {isSubmitted ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sakura-soft to-sakura-mid">
                  <svg
                    className="h-10 w-10 text-white"
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
                <h2 className="font-display text-3xl font-medium text-ink sm:text-4xl">
                  {carteCadeaux
                    ? "Demande envoyée"
                    : "Réservation enregistrée"}
                </h2>
                <p className="mt-3 max-w-sm font-body text-ink/60">
                  {carteCadeaux
                    ? "Laura vous recontactera rapidement pour votre carte cadeau."
                    : "Un email de confirmation va vous être envoyé. À très bientôt."}
                </p>
              </div>
            ) : (
              <>
                {upcomingClosures.length > 0 && (
                  <div className="mb-8 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-5 py-4">
                    <p className="mb-2 font-body text-sm font-semibold text-amber-900">
                      Fermetures à venir
                    </p>
                    <ul className="space-y-1 font-body text-sm text-amber-800/90">
                      {upcomingClosures.map((c, i) => {
                        const scopeSuffix =
                          c.timeScope === "morning"
                            ? " — matinée"
                            : c.timeScope === "afternoon"
                              ? " — après-midi"
                              : c.timeScope === "custom" &&
                                  c.blockedSlots?.length
                                ? ` — ${c.blockedSlots
                                    .map((t) => {
                                      const [h, m] = t.split(":");
                                      return `${parseInt(h, 10)}h${m}`;
                                    })
                                    .join(", ")}`
                                : "";
                        return (
                          <li key={i}>
                            {c.startDate === c.endDate
                              ? `Le ${formatClosureDate(c.startDate)}`
                              : `Du ${formatClosureDate(c.startDate)} au ${formatClosureDate(c.endDate)}`}
                            {scopeSuffix}
                            {c.label ? ` — ${c.label}` : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="nom" className={labelClass}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Dupont"
                      />
                    </div>
                    <div>
                      <label htmlFor="prenom" className={labelClass}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Marie"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="telephone" className={labelClass}>
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="service" className={labelClass}>
                      Soin souhaité *
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className={`${inputClass} cursor-pointer appearance-none`}
                    >
                      <option value="">Sélectionnez un soin</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>

                    {formData.service && (
                      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-sakura-soft/80 bg-sakura-soft/15 px-4 py-3 transition-colors hover:bg-sakura-soft/30">
                        <input
                          type="checkbox"
                          id="carteCadeaux"
                          name="carteCadeaux"
                          checked={carteCadeaux}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-ink/20 text-sakura-deep focus:ring-sakura-mid"
                        />
                        <GiftIcon className="h-5 w-5 text-sakura-deep" />
                        <span className="font-body text-sm font-medium text-ink">
                          Demander une carte cadeau
                        </span>
                      </label>
                    )}
                  </div>

                  {!carteCadeaux && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="date" className={labelClass}>
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
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="heure" className={labelClass}>
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
                              className={`${inputClass} cursor-pointer appearance-none`}
                            >
                              <option value="">Sélectionnez une heure</option>
                              {allTimes.map((heure, index) => {
                                const past = isTimePast(formData.date, heure);
                                const available =
                                  availableTimes.includes(heure);
                                const disabled = past || !available;
                                return (
                                  <option
                                    key={index}
                                    value={heure}
                                    disabled={disabled}
                                    style={
                                      disabled ? { color: "#9ca3af" } : undefined
                                    }
                                  >
                                    {heure}
                                    {past
                                      ? " — passé"
                                      : !available
                                        ? " — indisponible"
                                        : ""}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                              <p className="font-body text-sm font-medium text-amber-800">
                                {isDateClosed
                                  ? "Le salon est fermé ce jour-là."
                                  : availabilityError
                                    ? "Disponibilités indisponibles temporairement. Réessayez dans un instant."
                                    : "Aucun créneau disponible pour cette date."}
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="rounded-xl border border-ink/8 bg-washi/80 px-4 py-3.5">
                            <p className="font-body text-sm text-ink/45">
                              Veuillez d&apos;abord sélectionner une date
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="message" className={labelClass}>
                      Message{" "}
                      <span className="normal-case tracking-normal text-ink/35">
                        (optionnel)
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className={`${inputClass} resize-none`}
                      placeholder="Allergies, grossesse, envies particulières…"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      availabilityError ||
                      (!carteCadeaux && !formData.heure) ||
                      (carteCadeaux && !formData.service)
                    }
                    className="w-full rounded-full bg-ink py-4 font-body text-sm font-medium tracking-wide text-washi shadow-lg transition-all hover:scale-[1.01] hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    {isLoading
                      ? "Envoi en cours…"
                      : carteCadeaux
                        ? "Demander la carte cadeau"
                        : "Confirmer la réservation"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
