// src/components/SubmitOfferModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const SubmitOfferModal = ({ isOpen, onClose, listing }) => {
  const { t } = useTranslation("offer");
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState("");
  const [financing, setFinancing] = useState("none");
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const resetForm = () => {
    setAmount("");
    setFinancing("none");
    setMoveInDate("");
    setMessage("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error(t("amountRequired"));
      return;
    }

    if (!currentUser) {
      toast.error(t("loginRequired"));
      return;
    }

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, "offers"), {
        listingId: listing.id,
        listingTitle: listing.title || "",
        listingCity: listing.city || "",
        listingAddress: listing.address || "",
        ownerId: listing.ownerId || listing.userId || null,

        buyerId: currentUser.uid,
        buyerEmail: currentUser.email || "",
        buyerName: currentUser.displayName || "",

        amount: numericAmount,
        financing,
        moveInDate: moveInDate || null,
        message: message.trim(),

        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(t("success"));
      resetForm();
      onClose();
    } catch (err) {
      console.error("[SubmitOfferModal] error:", err);
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{t("title")}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t("intro")}
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              {listing.title || "—"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {listing.address || listing.city || ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Betrag */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("amountLabel")}
            </label>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                €
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("amountPlaceholder")}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Finanzierung */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("financingLabel")}
            </label>
            <select
              value={financing}
              onChange={(e) => setFinancing(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="none">{t("financingOptions.none")}</option>
              <option value="cash">{t("financingOptions.cash")}</option>
              <option value="mortgageApproved">
                {t("financingOptions.mortgageApproved")}
              </option>
              <option value="mortgagePlanned">
                {t("financingOptions.mortgagePlanned")}
              </option>
            </select>
          </div>

          {/* Einzugsdatum */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("moveInDateLabel")}
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Nachricht */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("messageLabel")}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "…" : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

SubmitOfferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  listing: PropTypes.object,
};

export default SubmitOfferModal;
