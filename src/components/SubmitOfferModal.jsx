import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FiCalendar, FiCheckCircle, FiDollarSign, FiHome, FiMessageSquare, FiX } from "react-icons/fi";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { logEvent } from "../utils/logEvent";

const SubmitOfferModal = ({ isOpen, onClose, listing }) => {
  const { t } = useTranslation("offer");
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState("");
  const [financing, setFinancing] = useState("none");
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = useMemo(() => Number(amount), [amount]);

  if (!isOpen || !listing) return null;

  const priceLabel =
    typeof listing?.price === "number"
      ? `€ ${listing.price.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`
      : listing?.price
      ? `€ ${listing.price}`
      : "—";

  const formatPreviewAmount = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return "—";
    return `€ ${num.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
  };

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const validate = () => {
    if (!currentUser) {
      toast.error(
        t("loginRequired", {
          defaultValue: "Bitte melde dich an, um ein Angebot abzugeben.",
        })
      );
      return false;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error(
        t("amountRequired", {
          defaultValue: "Bitte gib einen gültigen Angebotsbetrag ein.",
        })
      );
      return false;
    }

    if (listing?.ownerId && currentUser?.uid && listing.ownerId === currentUser.uid) {
      toast.error(
        t("ownListingError", {
          defaultValue: "Du kannst für dein eigenes Inserat kein Angebot abgeben.",
        })
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const ownerId = listing.ownerId || listing.userId || null;

      const docRef = await addDoc(collection(db, "offers"), {
        listingId: listing.id,
        listingTitle: listing.title || "",
        listingCity: listing.city || "",
        listingAddress: listing.address || "",
        ownerId,

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

      await logEvent({
        type: "offer.created",
        message: `Kaufangebot für "${listing.title || ""}" abgegeben.`,
        listingId: listing.id,
        offerId: docRef.id,
        ownerId,
        buyerId: currentUser.uid,
        extra: {
          amount: numericAmount,
          financing,
          moveInDate: moveInDate || null,
        },
      });

      toast.success(
        t("success", {
          defaultValue: "Dein Angebot wurde erfolgreich gesendet.",
        })
      );

      resetForm();
      onClose();
    } catch (err) {
      console.error("[SubmitOfferModal] error:", err);
      toast.error(
        t("error", {
          defaultValue: "Das Angebot konnte nicht gesendet werden.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 px-5 py-4 md:px-6 md:py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <FiDollarSign className="text-sm" />
              {t("badge", { defaultValue: "Angebot abgeben" })}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {t("title", { defaultValue: "Angebot senden" })}
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
              {t("intro", {
                defaultValue:
                  "Sende dem:der Anbieter:in ein konkretes Kaufangebot für dieses Inserat.",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition disabled:opacity-50"
            aria-label={t("close", { defaultValue: "Schließen" })}
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          {/* FORM */}
          <div className="px-5 py-5 md:px-6 md:py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {t("amountLabel", { defaultValue: "Angebotshöhe" })}
                </label>

                <div className="flex items-center overflow-hidden rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950">
                  <div className="flex h-12 items-center px-4 text-sm font-semibold text-gray-700 dark:text-slate-200 border-r border-gray-200 dark:border-slate-800">
                    €
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t("amountPlaceholder", {
                      defaultValue: "z. B. 450000",
                    })}
                    className="h-12 w-full bg-transparent px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                  {t("amountHint", {
                    defaultValue:
                      "Gib den Betrag ein, den du für diese Immobilie anbieten möchtest.",
                  })}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {t("financingLabel", { defaultValue: "Finanzierung" })}
                </label>

                <select
                  value={financing}
                  onChange={(e) => setFinancing(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">
                    {t("financingOptions.none", {
                      defaultValue: "Keine Angabe zur Finanzierung",
                    })}
                  </option>
                  <option value="cash">
                    {t("financingOptions.cash", {
                      defaultValue: "Kaufpreis wird bar / ohne Finanzierung bezahlt",
                    })}
                  </option>
                  <option value="mortgageApproved">
                    {t("financingOptions.mortgageApproved", {
                      defaultValue: "Finanzierung ist bereits zugesagt",
                    })}
                  </option>
                  <option value="mortgagePlanned">
                    {t("financingOptions.mortgagePlanned", {
                      defaultValue: "Finanzierung ist geplant",
                    })}
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {t("moveInDateLabel", { defaultValue: "Gewünschter Einzugstermin" })}
                </label>

                <div className="relative">
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <FiCalendar className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {t("messageLabel", { defaultValue: "Nachricht an den:die Anbieter:in" })}
                </label>

                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder", {
                    defaultValue:
                      "Schreibe hier zusätzliche Informationen, zum Beispiel zu deiner Finanzierung oder deinem gewünschten Ablauf.",
                  })}
                  className="w-full rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {t("cancel", { defaultValue: "Abbrechen" })}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? t("submitting", { defaultValue: "Wird gesendet…" })
                    : t("submit", { defaultValue: "Angebot senden" })}
                </button>
              </div>
            </form>
          </div>

          {/* SIDEBAR / SUMMARY */}
          <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/60 px-5 py-5 md:px-6 md:py-6">
            <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  <FiHome className="text-lg" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {listing.title || "—"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">
                    {listing.address || listing.city || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <SummaryRow
                  label={t("summary.askingPrice", { defaultValue: "Angebotspreis im Inserat" })}
                  value={priceLabel}
                />
                <SummaryRow
                  label={t("summary.yourOffer", { defaultValue: "Dein aktuelles Angebot" })}
                  value={formatPreviewAmount(amount)}
                  strong
                />
                <SummaryRow
                  label={t("summary.financing", { defaultValue: "Finanzierung" })}
                  value={t(`financingOptions.${financing}`, {
                    defaultValue: financing || "—",
                  })}
                />
                <SummaryRow
                  label={t("summary.moveInDate", { defaultValue: "Einzug" })}
                  value={moveInDate || "—"}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4">
                <div className="flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                  <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    {t("privacyHint", {
                      defaultValue:
                        "Dein Angebot wird direkt an den:die Anbieter:in übermittelt und in deinem Dashboard gespeichert.",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4">
                <div className="flex items-start gap-2">
                  <FiMessageSquare className="mt-0.5 text-blue-600 dark:text-blue-300" />
                  <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
                    {t("communicationHint", {
                      defaultValue:
                        "Eine klare und höfliche Nachricht erhöht die Chance auf eine schnelle Rückmeldung.",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500 dark:text-slate-400">{label}</span>
      <span
        className={`text-right ${
          strong
            ? "font-bold text-emerald-700 dark:text-emerald-300"
            : "font-medium text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  strong: PropTypes.bool,
};

SubmitOfferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  listing: PropTypes.object,
};

export default SubmitOfferModal;