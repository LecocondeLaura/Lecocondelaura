import React, { useState, useEffect } from "react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import API_BASE_URL from "../../config/api.config.js";

function NoticeCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    message: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Charger les avis depuis l'API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/reviews`);
        const data = await response.json();

        if (data.success) {
          setReviews(data.data || []);
        } else {
          console.error("Erreur lors du chargement des avis:", data.message);
          // En cas d'erreur, on garde un tableau vide
          setReviews([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des avis:", error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Dupliquer les avis pour le carousel
  const duplicatedReviews =
    reviews.length > 0 ? [...reviews, ...reviews, ...reviews] : [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          message: formData.message.trim(),
          date: formData.date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({
          type: "success",
          text: "Votre avis a été soumis avec succès ! Il sera publié après modération.",
        });

        // Réinitialiser le formulaire
        setFormData({
          firstName: "",
          lastName: "",
          message: "",
          date: new Date().toISOString().split("T")[0],
        });

        // Fermer le modal après 2 secondes
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitMessage({ type: "", text: "" });
        }, 2000);
      } else {
        setSubmitMessage({
          type: "error",
          text: data.message || "Une erreur est survenue. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis:", error);
      setSubmitMessage({
        type: "error",
        text: "Erreur de connexion. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      firstName: "",
      lastName: "",
      message: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div>
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-24">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex flex-row items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-semibold text-[#8b6f6f]">
              Nos avis
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#8b6f6f] text-white px-5 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#5a524b] hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300 flex items-center gap-2 group"
            >
              <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
              Ajouter un avis
            </button>
          </div>
          <div className="w-16 h-0.5 bg-[#8B827D]/40 sm:mx-0 mb-2 md:mb-6"></div>
        </div>
      </div>

      <div className="relative overflow-hidden py-8 md:py-12 w-full mb-24">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-[#8B827D]">Chargement des avis...</p>
          </div>
        ) : duplicatedReviews.length > 0 ? (
          <div className="flex gap-4 notice-carousel w-full">
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <p className="text-[#8B827D] leading-relaxed mb-4 flex-grow">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-purple-200/30">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#47403B]/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#47403B]">
                        {review.initials}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[#8B827D]">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <p className="text-[#8B827D]">
              Aucun avis pour le moment. Soyez le premier à partager votre
              expérience !
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={handleCloseModal}
          ></div>

          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-purple-200/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#8B827D] hover:text-[#47403B] transition-colors duration-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#47403B] mb-2">
                Ajouter un avis
              </h2>
              <div className="w-16 h-0.5 bg-[#8B827D]/40"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {submitMessage.text && (
                <div
                  className={`p-4 rounded-xl ${
                    submitMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <p className="text-sm font-medium">{submitMessage.text}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-[#47403B] mb-2"
                  >
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border border-[#8B827D]/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#47403B]/50 focus:border-transparent transition-all text-[#47403B] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-[#47403B] mb-2"
                  >
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border border-[#8B827D]/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#47403B]/50 focus:border-transparent transition-all text-[#47403B] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[#47403B] mb-2"
                >
                  Votre avis * (max 300 caractères)
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  maxLength={300}
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-[#8B827D]/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#47403B]/50 focus:border-transparent transition-all text-[#47403B] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Partagez votre expérience..."
                />
                <p className="text-xs text-[#8B827D] mt-1 text-right">
                  {formData.message.length}/300
                </p>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-[#47403B] mb-2"
                >
                  Date de votre séance *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-[#8B827D]/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#47403B]/50 focus:border-transparent transition-all text-[#47403B] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl border border-[#8B827D]/30 text-[#47403B] font-semibold hover:bg-[#8B827D]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#47403B] text-white font-semibold hover:bg-[#5a524b] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi en cours..." : "Soumettre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeCard;
