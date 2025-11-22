// src/components/OfferModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const OfferModal = ({ isOpen, onClose, listing }) => {
  const { t } = useTranslation("offers");
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listing?.id) return;
    if (!currentUser?.uid) {
      setError(t("errors.notLoggedIn", {
        defaultValue: "Bitte zuerst einloggen.",
      }));
      return;
    }

    if (!amount) {
      setError(t("errors.noAmount", {
        defaultValue: "Bitte einen Angebotspreis eingeben.",
      }));
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await addDoc(
        collection(db, "listings", listing.id, "offers"),
        {
          listingId: listing.id,
          ownerId: listing.ownerId || listing.userId || null,
          userId: currentUser.uid,
          userEmail: currentUser.email || null,
          amount: Number(amount),
          message: message || "",
          moveInDate: moveInDate || null,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      );
      onClose();
      setAmount("");
      setMessage("");
      setMoveInDate("");
    } catch (err) {
      console.error("[OfferModal] error submitting offer:", err);
      setError(
        t("errors.submitFailed", {
          defaultValue: "Das Angebot konnte nicht gespeichert werden.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {t("title", { defaultValue: "Angebot abgeben" })}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("fields.amount", { defaultValue: "Ihr Angebotspreis" })} (€)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("fields.moveInDate", { defaultValue: "Gewünschter Einzugstermin" })}
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("fields.message", { defaultValue: "Nachricht an den Eigentümer" })}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              placeholder={t("placeholders.message", {
                defaultValue: "Stellen Sie sich kurz vor und erklären Sie Ihr Angebot…",
              })}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t("actions.cancel", { defaultValue: "Abbrechen" })}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting
                ? t("actions.submitting", { defaultValue: "Wird gesendet…" })
                : t("actions.submit", { defaultValue: "Angebot senden" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

OfferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  listing: PropTypes.object,
};

export default OfferModal;
