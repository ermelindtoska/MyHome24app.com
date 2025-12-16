// src/components/ContactOwnerModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function dispatchMiniToast(message) {
  try {
    window.dispatchEvent(new CustomEvent("mh24:toast", { detail: { message } }));
  } catch {
    // ignore
  }
}

const ContactOwnerModal = ({ isOpen, onClose, ownerEmail, listing }) => {
  const { t } = useTranslation("contact");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  const listingId = useMemo(
    () => listing?.id || listing?.listingId || null,
    [listing]
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  // open -> preset + focus
  useEffect(() => {
    if (!isOpen) return;

    setForm((prev) => ({
      ...prev,
      name: currentUser?.displayName || prev.name || "",
      email: currentUser?.email || prev.email || "",
      message:
        prev.message ||
        t("defaults.message", {
          defaultValue:
            "Hallo, ich interessiere mich für diese Immobilie. Können wir einen Besichtigungstermin vereinbaren?",
        }),
    }));

    const tmr = setTimeout(() => firstInputRef.current?.focus?.(), 50);
    return () => clearTimeout(tmr);
  }, [isOpen, currentUser, t]);

  // ESC close + lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  const validate = () => {
    if (!form.message?.trim()) return "message";
    if (!form.email?.trim()) return "email";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Zillow-like: wenn nicht eingeloggt -> soft redirect + toast
    if (!currentUser) {
      dispatchMiniToast(
        t("errors.loginRequired", {
          defaultValue: "Bitte einloggen, um eine Nachricht zu senden.",
        })
      );
      onClose?.();
      navigate("/login");
      return;
    }

    const invalid = validate();
    if (invalid) {
      dispatchMiniToast(
        t(`errors.${invalid}`, {
          defaultValue:
            invalid === "message"
              ? "Bitte Nachricht eingeben."
              : "Bitte E-Mail eingeben.",
        })
      );
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "contacts"), {
        listingId,
        listingTitle: listing?.title || "",
        ownerEmail: ownerEmail || listing?.ownerEmail || null,
        ownerId: listing?.ownerId || listing?.userId || null,
        userId: currentUser?.uid || null,

        name: form.name?.trim() || "",
        email: form.email?.trim() || "",
        phone: form.phone?.trim() || "",
        message: form.message?.trim() || "",

        sentAt: serverTimestamp(),
        status: "new", // future-ready fürs Admin/Owner Inbox
        source: "listingDetailsModal",
      });

      dispatchMiniToast(
        t("successToast", {
          defaultValue: "Nachricht gesendet. Der:die Anbieter:in meldet sich bald.",
        })
      );

      onClose?.();
      // optional: form reset
      setForm((p) => ({ ...p, message: "" }));
    } catch (err) {
      console.error("[ContactOwnerModal] Fehler beim Senden:", err);
      dispatchMiniToast(
        t("errorToast", { defaultValue: "Senden fehlgeschlagen. Bitte später erneut versuchen." })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full md:max-w-lg bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                {t("title", { defaultValue: "Anbieter:in kontaktieren" })}
              </h2>
              <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {listing?.title
                  ? listing.title
                  : t("subtitle", {
                      defaultValue: "Stelle eine Frage oder frage eine Besichtigung an.",
                    })}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 grid place-items-center"
              aria-label={t("buttons.close", { defaultValue: "Schließen" })}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-4 md:px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t("fields.name", { defaultValue: "Name" })}
              </label>
              <input
                ref={firstInputRef}
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t("fields.email", { defaultValue: "E-Mail" })}
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {t("fields.phone", { defaultValue: "Telefon (optional)" })}
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {t("fields.message", { defaultValue: "Nachricht" })}
            </label>
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/40"
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {t("hint", {
                defaultValue:
                  "Tipp: Frage nach Besichtigungsterminen, Nebenkosten oder Dokumenten.",
              })}
            </p>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-full border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-900 transition font-semibold"
            >
              {t("buttons.cancel", { defaultValue: "Abbrechen" })}
            </button>

            <button
              type="submit"
              disabled={sending}
              className="h-11 px-5 rounded-full bg-blue-600 text-white font-extrabold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {sending
                ? t("buttons.sending", { defaultValue: "Senden..." })
                : t("buttons.send", { defaultValue: "Nachricht senden" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactOwnerModal;
