import React, { useState, useEffect, useCallback } from "react";
import {
  PencilIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import { useToast } from "../contexts/ToastContext";

function Clients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clientSoinsModal, setClientSoinsModal] = useState(null);
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const [editForm, setEditForm] = useState({
    allergies: "",
    notes: "",
    preferences: "",
    autresInfos: "",
  });

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setClients(data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      showError("Erreur lors du chargement des clients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          loadClients();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      });
  }, [loadClients]);

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditForm({
      allergies: client.allergies || "",
      notes: client.notes || "",
      preferences: client.preferences || "",
      autresInfos: client.autresInfos || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const clientData = {
        email: selectedClient.email,
        nom: selectedClient.nom,
        prenom: selectedClient.prenom,
        telephone: selectedClient.telephone,
        ...editForm,
      };

      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess("Informations client mises à jour avec succès");
        setIsEditing(false);
        setSelectedClient(null);
        loadClients();
      } else {
        showError(data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showError("Erreur lors de la sauvegarde");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedClient(null);
    setEditForm({
      allergies: "",
      notes: "",
      preferences: "",
      autresInfos: "",
    });
  };

  // Récapitulatif des soins uniques (service -> nombre de fois)
  const getSoinsSummary = (appointments) => {
    if (!appointments || appointments.length === 0) return [];
    const countByService = {};
    appointments.forEach((apt) => {
      if (apt.carteCadeaux) {
        const label = "Carte cadeaux";
        countByService[label] = (countByService[label] || 0) + 1;
      } else if (apt.service) {
        countByService[apt.service] = (countByService[apt.service] || 0) + 1;
      }
    });
    return Object.entries(countByService).map(([service, count]) => ({
      service,
      count,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const email = (client.email || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Organiser les clients par nom de famille (répertoire)
  const organizeClientsByLastName = (clientsList) => {
    // Trier par nom de famille, puis par prénom
    const sorted = [...clientsList].sort((a, b) => {
      const lastNameA = (a.nom || "").toLowerCase();
      const lastNameB = (b.nom || "").toLowerCase();
      if (lastNameA !== lastNameB) {
        return lastNameA.localeCompare(lastNameB, "fr");
      }
      const firstNameA = (a.prenom || "").toLowerCase();
      const firstNameB = (b.prenom || "").toLowerCase();
      return firstNameA.localeCompare(firstNameB, "fr");
    });

    // Grouper par première lettre du nom de famille
    const grouped = {};
    sorted.forEach((client) => {
      const lastName = (client.nom || "").trim();
      const firstLetter =
        lastName.length > 0 ? lastName.charAt(0).toUpperCase() : "#";

      // Normaliser les lettres accentuées
      const normalizedLetter = firstLetter
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const letter = /[A-Z]/.test(normalizedLetter) ? normalizedLetter : "#";

      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(client);
    });

    return grouped;
  };

  // Organiser les clients par nom de famille (répertoire)
  const clientsByLetter =
    filteredClients.length > 0
      ? organizeClientsByLastName(filteredClients)
      : {};
  const letters = Object.keys(clientsByLetter).sort();

  return (
    <DashboardLayout>
      {/* Modal Soins du client */}
      {clientSoinsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-6 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                Soins de {clientSoinsModal.prenom} {clientSoinsModal.nom}
              </h3>
              <button
                onClick={() => setClientSoinsModal(null)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                aria-label="Fermer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {clientSoinsModal.appointments && clientSoinsModal.appointments.length > 0 ? (
                <>
                  {/* Récapitulatif des soins */}
                  {getSoinsSummary(clientSoinsModal.appointments).length > 0 && (
                    <div className="bg-[#fcebeb] rounded-xl p-4">
                      <p className="text-sm font-bold text-[#8b6f6f] mb-2">Soins choisis</p>
                      <ul className="space-y-1">
                        {getSoinsSummary(clientSoinsModal.appointments).map(({ service, count }) => (
                          <li key={service} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#8b6f6f]"></span>
                            {service}
                            {count > 1 && (
                              <span className="text-gray-500 text-xs">({count} fois)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Liste détaillée des rendez-vous */}
                  <div>
                    <p className="text-sm font-bold text-[#8b6f6f] mb-3">Historique des rendez-vous</p>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {clientSoinsModal.appointments.map((apt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100 flex-wrap"
                        >
                          <div>
                            {apt.carteCadeaux ? (
                              <>
                                <span className="font-medium text-gray-800">Carte cadeaux</span>
                                {apt.service && (
                                  <span className="text-gray-600 text-sm ml-1">({apt.service})</span>
                                )}
                              </>
                            ) : (
                              <span className="font-medium text-gray-800">{apt.service}</span>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">
                              {apt.date ? formatDate(apt.date) : formatDate(apt.createdAt)}
                              {apt.heure && ` à ${apt.heure}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {apt.carteCadeaux && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  apt.carteCadeauUtilisee
                                    ? "bg-emerald-100 text-emerald-800"
                                    : apt.carteCadeauEnvoyee
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {apt.carteCadeauUtilisee
                                  ? "Carte utilisée"
                                  : apt.carteCadeauEnvoyee
                                  ? "Carte envoyée"
                                  : "En attente"}
                              </span>
                            )}
                            {apt.status && !apt.carteCadeaux && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  apt.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : apt.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {apt.status === "completed"
                                  ? "Effectué"
                                  : apt.status === "cancelled"
                                  ? "Annulé"
                                  : apt.status === "confirmed"
                                  ? "Confirmé"
                                  : "En attente"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center py-8">Aucun rendez-vous pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {isEditing && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] p-6 flex items-center justify-between sticky top-0">
              <h3 className="text-2xl font-black text-white">
                Modifier les informations
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-[#8b6f6f] mb-4">
                  {selectedClient.prenom} {selectedClient.nom}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Email :</span>{" "}
                    {selectedClient.email}
                  </p>
                  <p>
                    <span className="font-semibold">Téléphone :</span>{" "}
                    {selectedClient.telephone || "Non renseigné"}
                  </p>
                  <p>
                    <span className="font-semibold">Total rendez-vous :</span>{" "}
                    {selectedClient.totalAppointments || 0}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  value={editForm.allergies}
                  onChange={(e) =>
                    setEditForm({ ...editForm, allergies: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8b6f6f] focus:outline-none resize-none"
                  rows="3"
                  placeholder="Indiquez les allergies du client..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8b6f6f] focus:outline-none resize-none"
                  rows="4"
                  placeholder="Notes sur le client..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Préférences
                </label>
                <textarea
                  value={editForm.preferences}
                  onChange={(e) =>
                    setEditForm({ ...editForm, preferences: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8b6f6f] focus:outline-none resize-none"
                  rows="3"
                  placeholder="Préférences du client..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Autres informations
                </label>
                <textarea
                  value={editForm.autresInfos}
                  onChange={(e) =>
                    setEditForm({ ...editForm, autresInfos: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8b6f6f] focus:outline-none resize-none"
                  rows="3"
                  placeholder="Autres informations importantes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f6f] text-white rounded-xl font-semibold hover:bg-[#7a5f5f] transition-colors"
                >
                  <CheckIcon className="w-5 h-5" />
                  Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#8b6f6f] mb-2">
            Suivi clients
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez le suivi de vos clients et leurs rendez-vous
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un client par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8b6f6f] focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <p className="text-gray-600 text-lg">
              {searchTerm
                ? "Aucun client trouvé pour cette recherche"
                : "Aucun client pour le moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {letters.map((letter) => (
              <div key={letter} className="space-y-3">
                {/* En-tête de lettre */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#8b6f6f] to-[#7a5f5f] text-white px-4 py-1.5 rounded-xl shadow-lg">
                  <h2 className="text-xl font-black">{letter}</h2>
                </div>

                {/* Clients de cette lettre */}
                <div className="space-y-3">
                  {clientsByLetter[letter].map((client) => (
                    <div
                      key={client.email}
                      onClick={() => setClientSoinsModal(client)}
                      className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Informations principales */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#8b6f6f]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-[#8b6f6f]" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-[#47403B]">
                                  <span className="font-bold">
                                    {client.nom || "Sans nom"}
                                  </span>{" "}
                                  {client.prenom}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <EnvelopeIcon className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]">
                                      {client.email}
                                    </span>
                                  </div>
                                  {client.telephone && (
                                    <div className="flex items-center gap-1">
                                      <PhoneIcon className="w-3.5 h-3.5" />
                                      <span>{client.telephone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>
                                      {client.totalAppointments || 0}{" "}
                                      rendez-vous
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(client);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b6f6f] text-white rounded-lg font-semibold hover:bg-[#7a5f5f] transition-colors text-xs flex-shrink-0"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                              Modifier
                            </button>
                          </div>

                          {/* Informations supplémentaires */}
                          {(client.allergies ||
                            client.notes ||
                            client.preferences ||
                            client.autresInfos) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                              {client.allergies && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                    Allergies
                                  </p>
                                  <p className="text-xs text-gray-700 line-clamp-2">
                                    {client.allergies}
                                  </p>
                                </div>
                              )}
                              {client.preferences && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                    Préférences
                                  </p>
                                  <p className="text-xs text-gray-700 line-clamp-2">
                                    {client.preferences}
                                  </p>
                                </div>
                              )}
                              {client.notes && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                    Notes
                                  </p>
                                  <p className="text-xs text-gray-700 line-clamp-2">
                                    {client.notes}
                                  </p>
                                </div>
                              )}
                              {client.autresInfos && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                    Autres informations
                                  </p>
                                  <p className="text-xs text-gray-700 line-clamp-2">
                                    {client.autresInfos}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Historique des rendez-vous */}
                          {client.appointments &&
                            client.appointments.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 mb-1.5">
                                  Derniers rendez-vous
                                </p>
                                <div className="space-y-1">
                                  {client.appointments
                                    .slice(0, 3)
                                    .map((apt, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-gray-600 flex items-center gap-1.5"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b6f6f]"></span>
                                        {apt.carteCadeaux ? (
                                          <span>
                                            Carte cadeaux -{" "}
                                            {formatDate(apt.createdAt)}
                                          </span>
                                        ) : (
                                          <span>
                                            {apt.service} -{" "}
                                            {formatDate(apt.date)} à {apt.heure}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  {client.appointments.length > 3 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      +{client.appointments.length - 3} autre(s)
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Clients;
