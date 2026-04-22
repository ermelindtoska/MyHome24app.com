// src/pages/Contact.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaQuestionCircle,
} from "react-icons/fa";

const FORMSPREE_URL = "https://formspree.io/f/mdkgrndd";

const Contact = () => {
  const { t, i18n } = useTranslation("contact");
  const [searchParams] = useSearchParams();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/contact`;

  const topicFromQuery = (searchParams.get("topic") || "").trim();

  const topics = useMemo(() => {
    const raw = t("form.topics", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const findInitialTopic = () => {
    if (!topicFromQuery) return "general";
    const normalized = topicFromQuery.toLowerCase();
    const match = topics.find((x) => String(x?.value).toLowerCase() === normalized);
    return match?.value || "general";
  };

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    topic: "general",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" }); // type: success|error|info

  useEffect(() => {
    // apply topic from query param when topics loaded
    setFormState((prev) => ({
      ...prev,
      topic: findInitialTopic(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFromQuery, topics.length]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormState((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append("name", formState.name);
      data.append("email", formState.email);
      data.append("topic", formState.topic);
      data.append("subject", formState.subject);
      data.append("message", formState.message);

      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setStatus({
          type: "success",
          text: t("status.success", {
            defaultValue: "Danke! Deine Nachricht wurde gesendet.",
          }),
        });
        setFormState((p) => ({
          ...p,
          subject: "",
          message: "",
        }));
      } else {
        setStatus({
          type: "error",
          text: t("status.error", {
            defaultValue: "Ups! Etwas ist schiefgelaufen. Bitte erneut versuchen.",
          }),
        });
      }
    } catch (err) {
      console.error("[contact] submit error:", err);
      setStatus({
        type: "error",
        text: t("status.errorNetwork", {
          defaultValue: "Netzwerkfehler. Bitte prüfe deine Verbindung und versuche es erneut.",
        }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBox = () => {
    if (!status?.text) return null;

    const isSuccess = status.type === "success";
    const isError = status.type === "error";

    return (
      <div
        className={[
          "rounded-2xl border px-4 py-3 text-sm flex items-start gap-2",
          isSuccess
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            : "",
          isError ? "border-red-500/40 bg-red-500/10 text-red-200" : "",
          !isSuccess && !isError ? "border-slate-700 bg-slate-900/40 text-slate-200" : "",
        ].join(" ")}
      >
        <span className="mt-0.5">
          {isSuccess ? <FaCheckCircle /> : isError ? <FaExclamationTriangle /> : <FaQuestionCircle />}
        </span>
        <span className="leading-relaxed">{status.text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("meta.title", { defaultValue: "Kontakt – MyHome24App" })}
        description={t("meta.description", {
          defaultValue: "Kontaktiere uns für Support, Partnerschaften oder Feedback.",
        })}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-contact.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {/* HERO */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900/60 dark:border-slate-800">
            <div className="p-6 md:p-8">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                {t("hero.badge", { defaultValue: "Support & Kontakt" })}
              </span>

              <h1 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight">
                {t("hero.title", { defaultValue: "Wir sind für dich da." })}
              </h1>

              <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                {t("hero.subtitle", {
                  defaultValue:
                    "Schreib uns bei Fragen zu Listings, Konto, Partnerschaften oder Feedback. Wir antworten normalerweise innerhalb von 1–2 Werktagen.",
                })}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoCard
                  icon={<FaEnvelope className="text-emerald-300" />}
                  title={t("info.emailTitle", { defaultValue: "E-Mail" })}
                  value={t("info.emailValue", { defaultValue: "kontakt@myhome24app.com" })}
                />
                <InfoCard
                  icon={<FaPhoneAlt className="text-emerald-300" />}
                  title={t("info.phoneTitle", { defaultValue: "Telefon" })}
                  value={t("info.phoneValue", { defaultValue: "+49 (0) 000 000000" })}
                />
                <InfoCard
                  icon={<FaClock className="text-emerald-300" />}
                  title={t("info.hoursTitle", { defaultValue: "Öffnungszeiten" })}
                  value={t("info.hoursValue", { defaultValue: "Mo–Fr · 09:00–17:00" })}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                {t("hero.note", {
                  defaultValue:
                    "Bitte sende keine sensiblen Daten (z. B. Ausweisnummern) über dieses Formular.",
                })}
              </div>
            </div>
          </section>

          {/* FORM */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <div className="p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-bold">
                {t("form.title", { defaultValue: "Nachricht senden" })}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t("form.subtitle", {
                  defaultValue: "Fülle das Formular aus – wir melden uns so schnell wie möglich.",
                })}
              </p>

              <div className="mt-4">
                <StatusBox />
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t("form.nameLabel", { defaultValue: "Name" })}
                    required
                  >
                    <input
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={onChange}
                      required
                      autoComplete="name"
                      className={inputClass}
                      placeholder={t("form.namePlaceholder", { defaultValue: "Dein Name" })}
                    />
                  </Field>

                  <Field
                    label={t("form.emailLabel", { defaultValue: "E-Mail" })}
                    required
                  >
                    <input
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={onChange}
                      required
                      autoComplete="email"
                      className={inputClass}
                      placeholder={t("form.emailPlaceholder", { defaultValue: "name@email.de" })}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("form.topicLabel", { defaultValue: "Thema" })}>
                    <select
                      name="topic"
                      value={formState.topic}
                      onChange={onChange}
                      className={inputClass}
                    >
                      {(topics.length ? topics : defaultTopics).map((x) => (
                        <option key={x.value} value={x.value}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("form.subjectLabel", { defaultValue: "Betreff" })}>
                    <input
                      type="text"
                      name="subject"
                      value={formState.subject}
                      onChange={onChange}
                      className={inputClass}
                      placeholder={t("form.subjectPlaceholder", { defaultValue: "Worum geht es?" })}
                    />
                  </Field>
                </div>

                <Field label={t("form.messageLabel", { defaultValue: "Nachricht" })} required>
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={onChange}
                    required
                    rows={6}
                    className={inputClass}
                    placeholder={t("form.messagePlaceholder", {
                      defaultValue: "Beschreibe kurz dein Anliegen…",
                    })}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  <FaPaperPlane className="mr-2" />
                  {submitting
                    ? t("form.sending", { defaultValue: "Sende…" })
                    : t("form.send", { defaultValue: "Senden" })}
                </button>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  {t("form.privacyNote", {
                    defaultValue:
                      "Mit dem Absenden stimmst du der Verarbeitung deiner Daten gemäß Datenschutz zu.",
                  })}
                </p>
              </form>
            </div>
          </section>
        </div>

        {/* Bottom CTA / Help links */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold">
                {t("bottom.title", { defaultValue: "Schnellere Hilfe?" })}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t("bottom.text", {
                  defaultValue:
                    "Schau in unsere Hilfeseiten oder starte direkt eine Suche nach Listings.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/help"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("bottom.help", { defaultValue: "Hilfe" })}
              </a>
              <a
                href="/buy"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t("bottom.search", { defaultValue: "Zur Suche" })}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none " +
  "placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 " +
  "dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-500 dark:focus:border-emerald-500";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
      {label} {required ? <span className="text-emerald-500">*</span> : null}
    </label>
    {children}
  </div>
);

const InfoCard = ({ icon, title, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
    <div className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
          {value}
        </div>
      </div>
    </div>
  </div>
);

const defaultTopics = [
  { value: "general", label: "Allgemein" },
  { value: "listing", label: "Listing / Anzeige" },
  { value: "account", label: "Konto / Login" },
  { value: "partner-finance", label: "Partner (Finanzierung)" },
  { value: "business", label: "Business / Werbung" },
];

export default Contact;