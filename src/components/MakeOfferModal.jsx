import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FiX, FiHome, FiMapPin, FiSend, FiCalendar, FiCreditCard } from "react-icons/fi";
import { toast } from "sonner";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const MakeOfferModal = ({ isOpen, onClose, listing, ownerId, ownerEmail }) => {
  const { t } = useTranslation("offer");
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [financingType, setFinancingType] = useState("mortgagePlanned");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const askingPrice = useMemo(() => {
    const n = Number(listing?.price || 0);
    if (!Number.isFinite(n) || n <= 0) return "€ —";
    return `€ ${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
  }, [listing]);

  if (!isOpen || !listing) return null;

  const resetStateAndClose = () => {
    if (isSubmitting) return;
    setAmount("");
    setMessage("");
    setMoveInDate("");
    setFinancingType("mortgagePlanned");
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error(
        t("loginRequired", {
          defaultValue: "Bitte melde dich an, um ein Kaufangebot abzugeben.",
        })
      );
      return;
    }

    const finalOwnerId = ownerId || listing.ownerId || listing.userId || null;
    if (finalOwnerId && currentUser.uid === finalOwnerId) {
      toast.error(
        t("ownListingError", {
          defaultValue: "Du kannst für dein eigenes Inserat kein Angebot abgeben.",
        })
      );
      return;
    }

    const parsedAmount = Number(String(amount).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error(
        t("errors.invalidAmount", {
          defaultValue: "Bitte gib einen gültigen Betrag ein.",
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "offers"), {
        ownerId: finalOwnerId,
        ownerEmail: ownerEmail || listing.ownerEmail || listing.userEmail || null,

        listingId: listing.id,
        listingTitle: listing.title || "",
        listingCity: listing.city || "",
        listingAddress: listing.address || "",
        listingType: listing.type || "",
        listingPurpose: listing.purpose || "",

        buyerId: currentUser.uid,
        buyerName: currentUser.displayName || "",
        buyerEmail: currentUser.email || "",

        amount: Math.round(parsedAmount),
        currency: "EUR",
        financing: financingType,
        moveInDate: moveInDate || null,
        message: message.trim(),

        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(
        t("success", {
          defaultValue:
            "Dein Angebot wurde erfolgreich übermittelt. Die:der Anbieter:in wird sich bei dir melden.",
        })
      );

      resetStateAndClose();
    } catch (err) {
      console.error("[MakeOfferModal] Error creating offer:", err);
      toast.error(
        t("errors.generic", {
          defaultValue:
            "Beim Senden des Angebots ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <button
          type="button"
          onClick={resetStateAndClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label={t("close", { defaultValue: "Schließen" })}
        >
          <FiX size={18} />
        </button>

        <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50 px-6 py-6 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {t("badge", { defaultValue: "Angebot abgeben" })}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("title", { defaultValue: "Kaufangebot abgeben" })}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {t("subtitle", {
              defaultValue:
                "Sende ein verbindliches Kaufangebot an die:den Anbieter:in dieser Immobilie.",
            })}
          </p>

          <div className="mt-5 grid gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 dark:border-gray-700 dark:bg-gray-800/80 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <FiHome size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {listing.title || t("listingFallback", { defaultValue: "Inserat" })}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {listing.type || ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-rose-100 p-2 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                <FiMapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {listing.city || "—"}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {listing.zipCode ? `(${listing.zipCode})` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.amount", { defaultValue: "Dein Kaufpreis-Angebot" })}
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex items-center border-r border-gray-200 px-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    €
                  </span>
                  <input
                    type="text"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t("placeholders.amount", {
                      defaultValue: "z. B. 450.000",
                    })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.financingType", {
                    defaultValue: "Finanzierungsart",
                  })}
                </label>
                <select
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                  value={financingType}
                  onChange={(e) => setFinancingType(e.target.value)}
                >
                  <option value="mortgagePlanned">
                    {t("financingOptions.mortgagePlanned", {
                      defaultValue: "Finanzierung noch in Planung",
                    })}
                  </option>
                  <option value="mortgageApproved">
                    {t("financingOptions.mortgageApproved", {
                      defaultValue: "Finanzierung bereits zugesagt",
                    })}
                  </option>
                  <option value="cash">
                    {t("financingOptions.cash", {
                      defaultValue: "Bar / Eigenkapital",
                    })}
                  </option>
                  <option value="none">
                    {t("financingOptions.none", {
                      defaultValue: "Nicht angegeben",
                    })}
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.moveInDate", {
                    defaultValue: "Gewünschtes Einzugsdatum (optional)",
                  })}
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.message", {
                    defaultValue: "Nachricht an den:die Anbieter:in (optional)",
                  })}
                </label>
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("placeholders.message", {
                    defaultValue:
                      "Stell dich kurz vor und erkläre dein Angebot.",
                  })}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetStateAndClose}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {t("actions.cancel", { defaultValue: "Abbrechen" })}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSend size={16} />
                  {isSubmitting
                    ? t("actions.submitting", {
                        defaultValue: "Wird gesendet…",
                      })
                    : t("actions.submit", {
                        defaultValue: "Angebot senden",
                      })}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 dark:border-gray-700 dark:bg-gray-800/50 md:border-l md:border-t-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">
              {t("summary.title", { defaultValue: "Zusammenfassung" })}
            </h3>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("summary.askingPrice", {
                    defaultValue: "Aktueller Angebotspreis",
                  })}
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {askingPrice}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <FiCreditCard size={16} />
                  {t("summary.financing", { defaultValue: "Finanzierung" })}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {t(`financingOptions.${financingType}`, {
                    defaultValue: financingType || "—",
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <FiCalendar size={16} />
                  {t("summary.moveInDate", { defaultValue: "Einzug" })}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {moveInDate || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                {t("privacyHint", {
                  defaultValue:
                    "Dein Angebot wird direkt an den:die Anbieter:in übermittelt und in deinem Dashboard gespeichert.",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferModal;