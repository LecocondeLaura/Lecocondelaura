import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api.config.js";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Sauvegarder le token dans localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        // Rediriger vers le dashboard
        navigate("/dashboard");
      } else {
        setError(data.message || "Erreur de connexion");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-[#8b6f6f] mb-2">
              Le Cocon de Laura
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mx-auto mb-4 rounded-full"></div>
            <p className="text-gray-600">Connexion à l'espace d'administration</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#47403B] mb-2"
              >
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#8B827D]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6f6f]/50 focus:border-transparent transition-all text-[#47403B]"
                placeholder="Votre nom d'utilisateur"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#47403B] mb-2"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#8B827D]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6f6f]/50 focus:border-transparent transition-all text-[#47403B]"
                placeholder="Votre mot de passe"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-xl bg-[#8b6f6f] text-white font-semibold hover:bg-[#7a5f5f] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
