import React, { useCallback, useEffect, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "../Components/Dashboard/DashboardLayout";
import API_BASE_URL from "../config/api.config.js";
import { useToast } from "../contexts/ToastContext";

function Promotions() {
  const { showSuccess, showError } = useToast();
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState({
    count: 0,
    smsConfigured: false,
  });

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const recRes = await fetch(`${API_BASE_URL}/promotions/recipients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recData = await recRes.json();
      if (recData.success) setRecipients(recData.data);
    } catch {
      showError("Impossible de charger les destinataires");
    }
  }, [showError]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else load();
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [load]);

  const sendBroadcast = async ({ testTo } = {}) => {
    try {
      setSending(true);
      const res = await fetch(`${API_BASE_URL}/promotions/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: broadcastMessage,
          ...(testTo ? { testTo } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        showError(data.message || "Envoi impossible");
        return;
      }
      const r = data.data;
      if (testTo) {
        showSuccess(`Test envoyé à ${testTo}`);
        return;
      }
      if (r.smsConfigured) {
        showSuccess(`Envoyé : ${r.smsSent} SMS, ${r.emailSent} emails`);
      } else {
        showSuccess(
          `Message envoyé par email à ${r.emailSent} cliente${
            r.emailSent > 1 ? "s" : ""
          }`,
        );
      }
      setBroadcastMessage("");
    } catch {
      showError("Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  const handleTestBroadcast = async () => {
    const testTo = window.prompt(
      "Email de test (une seule personne) :",
      "lecocondelaura17@gmail.com",
    );
    if (!testTo) return;
    await sendBroadcast({ testTo: testTo.trim() });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        `Envoyer ce message à ${recipients.count} cliente${
          recipients.count > 1 ? "s" : ""
        } par email ?`,
      )
    ) {
      return;
    }
    await sendBroadcast();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-black text-[#8b6f6f] sm:text-4xl">
          Message aux clientes
        </h1>
        <p className="mb-6 text-sm text-gray-600 sm:text-base">
          Envoyer une offre ou une info à toutes les clientes qui ont un email.
        </p>

        <form
          onSubmit={handleBroadcast}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#8b6f6f]">
            <PaperAirplaneIcon className="h-5 w-5" />
            Nouveau message
          </h2>
          <p className="text-sm text-gray-600">
            {recipients.count} cliente{recipients.count > 1 ? "s" : ""} avec un
            email.
            {recipients.smsConfigured
              ? " Le message partira par email, et aussi par SMS si un numéro est connu."
              : " Le message partira par email."}
          </p>
          <textarea
            required
            rows={5}
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#f0cfcf] focus:ring-2 focus:ring-[#f0cfcf]"
            placeholder="Exemple : -20 % sur les cartes cadeaux au salon bien-être de samedi."
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={sending || recipients.count === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[#8b6f6f] px-5 py-2.5 font-semibold text-white hover:bg-[#7a5f5f] disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Envoyer le message"}
            </button>
            <button
              type="button"
              disabled={sending || broadcastMessage.trim().length < 5}
              onClick={handleTestBroadcast}
              className="inline-flex items-center gap-2 rounded-xl border border-[#8b6f6f] px-5 py-2.5 font-semibold text-[#8b6f6f] hover:bg-[#faf6f6] disabled:opacity-60"
            >
              Envoyer un test
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default Promotions;
