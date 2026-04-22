import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { FiUser, FiMail, FiMessageSquare, FiSend } from "react-icons/fi";

const ContactForm = ({ listingId, ownerEmail, listingTitle }) => {
  const { t } = useTranslation("contact");
  const { currentUser } = useAuth();

  const initialForm = useMemo(
    () => ({
      name: currentUser?.displayName || "",
      email: currentUser?.email || "",
      message: "",
    }),
    [currentUser]
  );

  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(initialForm);
  }, [initialForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!formData.name.trim()) {
      return t("contactForm.errors.nameRequired", {
        defaultValue: "Bitte geben Sie Ihren Namen ein.",
      });
    }

    if (!formData.email.trim()) {
      return t("contactForm.errors.emailRequired", {
        defaultValue: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
      });
    }

    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      return t("contactForm.errors.emailInvalid", {
        defaultValue: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      });
    }

    if (!formData.message.trim()) {
      return t("contactForm.errors.messageRequired", {
        defaultValue: "Bitte schreiben Sie eine Nachricht.",
      });
    }

    if (!listingId || !ownerEmail) {
      return t("contactForm.errors.missingListingData", {
        defaultValue: "Die Kontaktdaten zur Anzeige fehlen.",
      });
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSending(true);
      setError("");

      await addDoc(collection(db, "contacts"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        listingId,
        listingTitle: listingTitle || "",
        ownerEmail,
        userId: currentUser?.uid || null,
        sentAt: serverTimestamp(),
        status: "new",
        source: "contact-form",
      });

      setSubmitted(true);
      setFormData({
        name: currentUser?.displayName || "",
        email: currentUser?.email || "",
        message: "",
      });
    } catch (submitError) {
      console.error("Error sending contact message:", submitError);
      setError(
        t("contactForm.errors.submitFailed", {
          defaultValue:
            "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
        })
      );
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/10">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          {t("contactForm.successMessage", {
            defaultValue: "Ihre Nachricht wurde erfolgreich gesendet.",
          })}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t("contactForm.contactOwner", {
            defaultValue: "Anbieter:in kontaktieren",
          })}
          {listingTitle ? `: ${listingTitle}` : ""}
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t("contactForm.subtitle", {
            defaultValue:
              "Nutzen Sie das Formular, um Fragen zu stellen oder eine Besichtigung anzufragen.",
          })}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("contactForm.name", { defaultValue: "Name" })}
          </label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder={t("contactForm.placeholders.name", {
                defaultValue: "Ihr Name",
              })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("contactForm.email", { defaultValue: "E-Mail" })}
          </label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("contactForm.message", { defaultValue: "Nachricht" })}
          </label>
          <div className="relative">
            <FiMessageSquare className="pointer-events-none absolute left-3 top-3 text-gray-400" />
            <textarea
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder={t("contactForm.placeholders.message", {
                defaultValue: "Ihre Nachricht …",
              })}
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="pt-2">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSend />
            {sending
              ? t("contactForm.sending", { defaultValue: "Wird gesendet…" })
              : t("contactForm.send", { defaultValue: "Nachricht senden" })}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;