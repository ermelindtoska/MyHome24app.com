import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FiX, FiHome, FiMapPin, FiSend, FiCalendar, FiCreditCard } from "react-icons/fi";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const OfferRequestModal = ({ isOpen, onClose, listing }) => {
  const { t } = useTranslation("offer");
  const { currentUser } = useAuth() || {};

  const [form, setForm] = useState({
    amount: "",
    financing: "",
    moveInDate: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const askingPrice = useMemo(() => {
    const n = Number(listing?.price || 0);
    if (!Number.isFinite(n) || n <= 0) return "€ —";
    return `€ ${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
  }, [listing]);

  if (!isOpen || !listing) return null;

  const resetForm = () => {
    setForm({
      amount: "",
      financing: "",
      moveInDate: "",
      message: "",
    });
  };

  const handleClose = () => {
    if (sending) return;
    resetForm();
    onClose?.();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error(
        t("loginRequired", {
          defaultValue: "Bitte melde dich an, um ein Angebot abzugeben.",
        })
      );
      return;
    }

    const amountNumber = Number(form.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error(
        t("amountRequired", {
          defaultValue: "Bitte gib einen gültigen Angebotsbetrag ein.",
        })
      );
      return;
    }

    if (listing.ownerId && currentUser.uid === listing.ownerId) {
      toast.error(
        t("ownListingError", {
          defaultValue: "Du kannst für dein eigenes Inserat kein Angebot abgeben.",
        })
      );
      return;
    }

    setSending(true);

    try {
      await addDoc(collection(db, "offers"), {
        listingId: listing.id,
        listingTitle: listing.title || "",
        listingCity: listing.city || "",
        listingAddress: listing.address || "",
        ownerId: listing.ownerId || listing.userId || null,
        ownerEmail: listing.ownerEmail || null,

        buyerId: currentUser.uid || null,
        buyerEmail: currentUser.email || null,
        buyerName: currentUser.displayName || "",

        amount: amountNumber,
        financing: form.financing.trim() || "",
        moveInDate: form.moveInDate || null,
        message: form.message.trim(),

        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(
        t("submitSuccess", {
          defaultValue: "Dein Angebot wurde erfolgreich übermittelt.",
        })
      );

      resetForm();
      onClose?.();
    } catch (err) {
      console.error("[OfferRequestModal] error:", err);
      toast.error(
        t("submitError", {
          defaultValue: "Fehler beim Senden des Angebots.",
        })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={handleClose}
          disabled={sending}
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

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
            {t("intro", {
              defaultValue:
                "Gib hier ein unverbindliches Kaufangebot für diese Immobilie ab.",
            })}
          </p>

          <div className="mt-5 grid gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 dark:border-gray-700 dark:bg-gray-800/80 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <FiHome size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {listing.title || "—"}
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
                  {listing.address || ""}
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
                  {t("fields.amount", { defaultValue: "Angebotspreis (€)" })}
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder={t("amountPlaceholder", { defaultValue: "z. B. 450000" })}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.financing", { defaultValue: "Finanzierung" })}
                </label>
                <input
                  name="financing"
                  value={form.financing}
                  onChange={handleChange}
                  placeholder={t("fields.financingPlaceholder", {
                    defaultValue: "z. B. 20 % Eigenkapital, Rest Finanzierung…",
                  })}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.moveInDate", {
                    defaultValue: "Gewünschter Einzugstermin",
                  })}
                </label>
                <input
                  name="moveInDate"
                  type="date"
                  value={form.moveInDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("fields.message", { defaultValue: "Nachricht (optional)" })}
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t("placeholders.message", {
                    defaultValue: "Stell dich kurz vor und erkläre dein Angebot…",
                  })}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={sending}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {t("cancel", { defaultValue: "Abbrechen" })}
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSend size={16} />
                  {sending
                    ? t("sending", { defaultValue: "Wird gesendet…" })
                    : t("submit", { defaultValue: "Angebot senden" })}
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
                  {t("summary.askingPrice", { defaultValue: "Inseratspreis" })}
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
                  {form.financing || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <FiCalendar size={16} />
                  {t("summary.moveInDate", { defaultValue: "Einzug" })}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {form.moveInDate || "—"}
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

export default OfferRequestModal;