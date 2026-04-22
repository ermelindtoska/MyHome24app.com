import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiUser, FiMessageSquare } from "react-icons/fi";

function dispatchMiniToast(message) {
  try {
    window.dispatchEvent(
      new CustomEvent("mh24:toast", { detail: { message } })
    );
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

  const defaultMessage = useMemo(
    () =>
      t("defaults.message", {
        defaultValue:
          "Hallo, ich interessiere mich für diese Immobilie. Können wir einen Besichtigungstermin vereinbaren?",
      }),
    [t]
  );

  const initialForm = useMemo(
    () => ({
      name: currentUser?.displayName || "",
      email: currentUser?.email || "",
      phone: "",
      message: defaultMessage,
    }),
    [currentUser, defaultMessage]
  );

  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: currentUser?.displayName || "",
      email: currentUser?.email || "",
      phone: "",
      message: defaultMessage,
    });

    const timer = setTimeout(() => {
      firstInputRef.current?.focus?.();
    }, 80);

    return () => clearTimeout(timer);
  }, [isOpen, currentUser, defaultMessage]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current && !sending) {
      onClose?.();
    }
  };

  const validate = () => {
    if (!form.name?.trim()) return "name";
    if (!form.email?.trim()) return "email";
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) return "emailInvalid";
    if (!form.message?.trim()) return "message";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const invalidField = validate();
    if (invalidField) {
      dispatchMiniToast(
        t(`errors.${invalidField}`, {
          defaultValue:
            invalidField === "name"
              ? "Bitte Namen eingeben."
              : invalidField === "email"
              ? "Bitte E-Mail eingeben."
              : invalidField === "emailInvalid"
              ? "Bitte eine gültige E-Mail-Adresse eingeben."
              : "Bitte Nachricht eingeben.",
        })
      );
      return;
    }

    setSending(true);

    try {
      await addDoc(collection(db, "contacts"), {
        listingId,
        listingTitle: listing?.title || "",
        listingCity: listing?.city || "",
        listingAddress: listing?.address || "",
        ownerEmail: ownerEmail || listing?.ownerEmail || null,
        ownerId: listing?.ownerId || listing?.userId || null,
        userId: currentUser?.uid || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || "",
        message: form.message.trim(),
        sentAt: serverTimestamp(),
        status: "new",
        source: "contact-owner-modal",
      });

      dispatchMiniToast(
        t("successToast", {
          defaultValue:
            "Nachricht gesendet. Der:die Anbieter:in meldet sich bald.",
        })
      );

      setForm(initialForm);
      onClose?.();
    } catch (err) {
      console.error("[ContactOwnerModal] Fehler beim Senden:", err);
      dispatchMiniToast(
        t("errorToast", {
          defaultValue:
            "Senden fehlgeschlagen. Bitte später erneut versuchen.",
        })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 md:max-w-xl md:rounded-3xl">
        <div className="border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <FiMail />
                {t("badge", {
                  defaultValue: "Kontaktformular",
                })}
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white md:text-2xl">
                {t("title", { defaultValue: "Anbieter:in kontaktieren" })}
              </h2>

              <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300 md:text-sm">
                {listing?.title
                  ? listing.title
                  : t("subtitle", {
                      defaultValue:
                        "Stelle eine Frage oder frage eine Besichtigung an.",
                    })}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              aria-label={t("buttons.close", { defaultValue: "Schließen" })}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t("fields.name", { defaultValue: "Name" })}
              </label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={firstInputRef}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-600/30 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder={t("placeholders.name", {
                    defaultValue: "Ihr Name",
                  })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t("fields.email", { defaultValue: "E-Mail" })}
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-600/30 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("fields.phone", { defaultValue: "Telefon (optional)" })}
            </label>
            <div className="relative">
              <FiPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-600/30 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                placeholder={t("placeholders.phone", {
                  defaultValue: "+49 ...",
                })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("fields.message", { defaultValue: "Nachricht" })}
            </label>
            <div className="relative">
              <FiMessageSquare className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 pl-10 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-600/30 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                placeholder={t("placeholders.message", {
                  defaultValue: "Ihre Nachricht …",
                })}
              />
            </div>

            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {t("hint", {
                defaultValue:
                  "Tipp: Fragen Sie nach Besichtigungsterminen, Nebenkosten oder Unterlagen.",
              })}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="h-11 rounded-full border border-gray-200 px-4 font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {t("buttons.cancel", { defaultValue: "Abbrechen" })}
            </button>

            <button
              type="submit"
              disabled={sending}
              className="h-11 rounded-full bg-blue-600 px-5 font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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