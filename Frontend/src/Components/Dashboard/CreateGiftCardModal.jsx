import React, { useState } from "react";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import API_BASE_URL from "../../config/api.config.js";

function CreateGiftCardModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    service: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const services = [
    "Head Spa  Kodomo - 45min (enfant)",
    "Head Spa Rituel Détente - 60min",
    "Head Spa Rituel Ultime - 90min",
  ];

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
          carteCadeaux: true,
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
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <GiftIcon className="w-6 h-6" />
            Créer une carte cadeau
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

          {/* Informations carte cadeau */}
          <div className="bg-[#fcebeb] rounded-xl p-5">
            <h4 className="font-bold text-[#8b6f6f] mb-4 text-lg flex items-center gap-2">
              <GiftIcon className="w-5 h-5" />
              Détails de la carte cadeau
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
                  placeholder="Notes, informations complémentaires..."
                ></textarea>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note :</strong> Un email sera automatiquement envoyé
                  au client avec les coordonnées bancaires pour effectuer le
                  virement. Une fois le paiement reçu, vous pourrez envoyer la
                  carte cadeau depuis la page "Cartes cadeaux".
                </p>
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
              {isLoading ? "Création..." : "Créer la carte cadeau"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGiftCardModal;
