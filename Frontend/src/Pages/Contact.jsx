import React, { useState, useEffect } from "react";
import {
  addAppointment,
  getAvailableTimesForDate,
} from "../utils/appointments";

function Contact() {
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

  // Tous les horaires possibles
  const allTimes = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  // Mettre à jour les horaires disponibles quand la date change
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (formData.date) {
        try {
          const available = await getAvailableTimesForDate(
            formData.date,
            allTimes
          );
          setAvailableTimes(available);
          // Réinitialiser l'heure si elle n'est plus disponible
          if (formData.heure && !available.includes(formData.heure)) {
            setFormData((prev) => ({ ...prev, heure: "" }));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des horaires:", error);
          setAvailableTimes([]);
        }
      } else {
        setAvailableTimes([]);
        setFormData((prev) => ({ ...prev, heure: "" }));
      }
    };

    fetchAvailableTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, formData.heure]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Vérifier que le créneau est toujours disponible
      const available = await getAvailableTimesForDate(formData.date, allTimes);
      if (!available.includes(formData.heure)) {
        alert(
          "Ce créneau n'est plus disponible. Veuillez choisir un autre horaire."
        );
        setIsLoading(false);
        return;
      }

      // Enregistrer le rendez-vous (l'email est envoyé automatiquement par le backend)
      await addAppointment(formData);

      setIsSubmitted(true);

      // Réinitialiser le formulaire après 5 secondes
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
        setAvailableTimes([]);
      }, 10000);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      alert(
        "Une erreur est survenue lors de la réservation. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    "Head Spa Classique",
    "Head Spa Premium",
    "Head Spa Détente",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-24 pb-20 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1 className="text-9xl font-black text-[#f0cfcf]">RÉSERVATION</h1>
          </div>
          <div className="relative z-10">
            <div className="inline-block mb-6">
              <span className="text-sm font-semibold text-[#f0cfcf] uppercase tracking-wider bg-[#f0cfcf]/10 px-4 py-2 rounded-full">
                Prendre rendez-vous
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-[#8b6f6f] mb-6 leading-tight">
              Réservez votre
              <br />
              <span className="text-5xl sm:text-6xl text-[#f0cfcf]">
                Head Spa
              </span>
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Remplissez le formulaire ci-dessous pour réserver votre moment de
              détente. Nous vous confirmerons votre rendez-vous par email.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
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
                <h2 className="text-4xl font-black text-[#8b6f6f] mb-4">
                  Demande envoyée !
                </h2>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Nous vous contacterons très prochainement pour confirmer votre
                  rendez-vous.
                </p>
              </div>
            ) : (
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
                </div>

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
                      min={new Date().toISOString().split("T")[0]}
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
                      availableTimes.length > 0 ? (
                        <select
                          id="heure"
                          name="heure"
                          value={formData.heure}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#f0cfcf]/20 focus:border-[#f0cfcf] outline-none transition-all duration-300 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="">Sélectionnez une heure</option>
                          {availableTimes.map((heure, index) => (
                            <option key={index} value={heure}>
                              {heure}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-5 py-4 border-2 border-red-200 rounded-xl bg-red-50">
                          <p className="text-red-600 text-sm font-semibold">
                            Aucun créneau disponible pour cette date
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
                    placeholder="Des informations complémentaires, allergies, préférences..."
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.heure}
                    className="w-full bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] text-white py-5 rounded-xl font-black text-lg uppercase tracking-wide hover:from-[#e0bfbf] hover:to-[#d9b3b3] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading
                      ? "Envoi en cours..."
                      : "Confirmer la réservation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:border-[#f0cfcf]/50">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              📧
            </div>
            <h3 className="font-bold text-[#8b6f6f] mb-2 text-lg">Email</h3>
            <p className="text-gray-600">lecocondelaura17@gmail.com</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:border-[#f0cfcf]/50">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              📞
            </div>
            <h3 className="font-bold text-[#8b6f6f] mb-2 text-lg">Téléphone</h3>
            <p className="text-gray-600">07 87 98 43 41</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:border-[#f0cfcf]/50">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              📍
            </div>
            <h3 className="font-bold text-[#8b6f6f] mb-2 text-lg">Adresse</h3>
            <p className="text-gray-600">70 rue Sadi Carnot, 17500 Jonzac</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
