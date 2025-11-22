// src/components/OfferFormModal.jsx
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const OfferFormModal = ({ isOpen, onClose, listing }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation("listingDetails");

  const [amount, setAmount] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [financing, setFinancing] = useState("cash");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSubmitting(true);

      await addDoc(collection(db, "offers"), {
        listingId: listing.id,
        listingTitle: listing.title || "",
        listingCity: listing.city || "",
        listingPrice: listing.price || null,

        ownerId: listing.ownerId || listing.userId || null,
        ownerEmail: listing.ownerEmail || null,

        buyerId: currentUser.uid,
        buyerEmail: currentUser.email || null,
        buyerName: currentUser.displayName || "",

        amount: Number(amount) || 0,
        moveInDate: moveInDate || null,
        financing,
        message: message.trim(),

        status: "pending",
        createdAt: serverTimestamp(),
      });

      // optional: kleines Reset
      setAmount("");
      setMoveInDate("");
      setFinancing("cash");
      setMessage("");

      onClose();
    } catch (err) {
      console.error("[OfferFormModal] Fehler beim Speichern der Offerte:", err);
      alert(
        t("offer.errorGeneric", {
          defaultValue:
            "Das Kaufangebot konnte nicht gespeichert werden. Bitte später erneut versuchen.",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700 relative">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-red-500 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-50">
          {t("offer.title", { defaultValue: "Kaufangebot abgeben" })}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t("offer.subtitle", {
            defaultValue:
              "Sende der/dem Eigentümer:in ein verbindliches Kaufangebot.",
          })}
        </p>

        {/* Listing Kurzinfo */}
        <div className="mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {listing.title || "–"}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {listing.city || "–"}
            {listing.price != null && (
              <>
                {" · € "}
                {Number(listing.price).toLocaleString("de-DE", {
                  maximumFractionDigits: 0,
                })}
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Betrag */}
          <div>
            <label className="block font-medium mb-1">
              {t("offer.amountLabel", { defaultValue: "Ihr Kaufpreis-Angebot (€)" })}
            </label>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Einzugstermin */}
          <div>
            <label className="block font-medium mb-1">
              {t("offer.moveInLabel", { defaultValue: "Wunscheinzugstermin" })}
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Finanzierung */}
          <div>
            <label className="block font-medium mb-1">
              {t("offer.financingLabel", { defaultValue: "Finanzierungsart" })}
            </label>
            <select
              value={financing}
              onChange={(e) => setFinancing(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
            >
              <option value="cash">
                {t("offer.financing.cash", { defaultValue: "Eigenkapital / Bar" })}
              </option>
              <option value="mortgage">
                {t("offer.financing.mortgage", { defaultValue: "Mit Finanzierung" })}
              </option>
              <option value="other">
                {t("offer.financing.other", { defaultValue: "Sonstiges" })}
              </option>
            </select>
          </div>

          {/* Nachricht */}
          <div>
            <label className="block font-medium mb-1">
              {t("offer.messageLabel", { defaultValue: "Nachricht (optional)" })}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
              placeholder={t("offer.messagePlaceholder", {
                defaultValue:
                  "Stellen Sie sich kurz vor und erklären Sie Ihr Angebot.",
              })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t("offer.cancel", { defaultValue: "Abbrechen" })}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting
                ? t("offer.submitting", { defaultValue: "Wird gesendet…" })
                : t("offer.submit", { defaultValue: "Kaufangebot senden" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferFormModal;
