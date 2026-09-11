import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import API_BASE_URL from "../../config/api.config.js";

const inputClass =
  "w-full rounded-xl border border-[#e8a8b2]/40 bg-white/90 px-4 py-3 font-body text-sm text-[#6e5656] outline-none transition focus:border-[#c97886] focus:ring-4 focus:ring-[#f0cfcf]/50";

const labelClass =
  "mb-1.5 block font-body text-xs font-medium tracking-[0.12em] text-[#6e5656]/60 uppercase";

const emptyForm = {
  entreprise: "",
  typeEtablissement: "",
  contactNom: "",
  email: "",
  telephone: "",
  lieu: "",
  dateSouhaitee: "",
  nombrePersonnes: "",
  message: "",
};

function MobileQuoteModal({ isOpen, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setIsSent(false);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/mobile-quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setIsSent(true);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch {
      setError("Impossible d'envoyer la demande. Réessayez dans un instant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-quote-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#6e5656]/45 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={resetAndClose}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#f0cfcf] bg-[#fdf8f6] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#f0cfcf] bg-[#fdf8f6]/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="font-display text-xs tracking-[0.25em] text-[#c97886] uppercase">
              Head Spa Mobile
            </p>
            <h2
              id="mobile-quote-title"
              className="font-display text-2xl font-medium text-[#6e5656]"
            >
              Demander un devis
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-full p-2 text-[#6e5656]/60 transition hover:bg-[#f0cfcf]/50 hover:text-[#6e5656]"
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {isSent ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f0cfcf] to-[#e8a8b2]">
                <svg
                  className="h-8 w-8 text-white"
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
              <p className="font-display text-2xl text-[#6e5656]">
                Demande envoyée
              </p>
              <p className="mt-2 font-body text-sm text-[#6e5656]/65">
                Laura vous recontactera rapidement pour votre devis Head Spa
                Mobile.
              </p>
              <button
                type="button"
                onClick={resetAndClose}
                className="mt-8 rounded-full bg-[#6e5656] px-8 py-3 font-body text-sm font-medium tracking-wide text-white transition hover:bg-[#5a4343]"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="font-body text-sm leading-relaxed text-[#6e5656]/65">
                Pour les entreprises, hôtels & spa et EHPAD — Laura se déplace
                avec son rituel Head Spa.
              </p>

              <div>
                <label htmlFor="mq-entreprise" className={labelClass}>
                  Nom de l&apos;établissement *
                </label>
                <input
                  id="mq-entreprise"
                  name="entreprise"
                  required
                  value={form.entreprise}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex : Résidence Les Lilas, Hôtel Atlantic…"
                />
              </div>

              <div>
                <label htmlFor="mq-type" className={labelClass}>
                  Type d&apos;établissement *
                </label>
                <select
                  id="mq-type"
                  name="typeEtablissement"
                  required
                  value={form.typeEtablissement}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Choisir…</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="hotel_spa">Hôtel &amp; Spa</option>
                  <option value="ephad">EHPAD</option>
                </select>
              </div>

              <div>
                <label htmlFor="mq-contact" className={labelClass}>
                  Prénom et nom (demandeur) *
                </label>
                <input
                  id="mq-contact"
                  name="contactNom"
                  required
                  value={form.contactNom}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex : Marie Dupont"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="mq-email" className={labelClass}>
                    Email *
                  </label>
                  <input
                    id="mq-email"
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="mq-tel" className={labelClass}>
                    Téléphone *
                  </label>
                  <input
                    id="mq-tel"
                    type="tel"
                    name="telephone"
                    required
                    value={form.telephone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mq-lieu" className={labelClass}>
                  Ville *
                </label>
                <input
                  id="mq-lieu"
                  name="lieu"
                  required
                  value={form.lieu}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex : Jonzac, Saintes…"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="mq-date" className={labelClass}>
                    Date souhaitée
                  </label>
                  <input
                    id="mq-date"
                    type="date"
                    name="dateSouhaitee"
                    value={form.dateSouhaitee}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="mq-nb" className={labelClass}>
                    Nombre de personnes
                  </label>
                  <input
                    id="mq-nb"
                    name="nombrePersonnes"
                    value={form.nombrePersonnes}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ex : 8, 12…"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mq-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="mq-message"
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Besoin, fréquence, précisions…"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#6e5656] py-3.5 font-body text-sm font-medium tracking-wide text-white transition hover:bg-[#5a4343] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Envoi en cours…" : "Envoyer la demande"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileQuoteModal;
