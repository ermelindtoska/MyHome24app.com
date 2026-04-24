import React from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ContactSection = () => {
  const { t } = useTranslation("home");

  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 dark:bg-slate-950">
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-700/20" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/20" />

      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 md:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="text-center md:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/80 dark:text-blue-300">
                <FaShieldAlt />
                {t("contactSection.badge", { defaultValue: "Support & Kontakt" })}
              </div>

              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {t("contactSection.title", {
                  defaultValue: "Haben Sie Fragen zu MyHome24App?",
                })}
              </h3>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                {t("contactSection.text", {
                  defaultValue:
                    "Unser Team hilft Ihnen gerne bei Fragen zu Immobilienanzeigen, Konten, Rollen, Kontaktanfragen oder technischen Anliegen.",
                })}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  {t("contactSection.primaryButton", {
                    defaultValue: "Kontaktformular öffnen",
                  })}
                  <FaArrowRight className="text-xs" />
                </Link>

                <a
                  href="mailto:kontakt@myhome24app.com"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-blue-900/50 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
                >
                  <FaEnvelope />
                  kontakt@myhome24app.com
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <FaEnvelope className="text-2xl" />
              </div>

              <h4 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                {t("contactSection.cardTitle", {
                  defaultValue: "Schnelle Unterstützung",
                })}
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {t("contactSection.cardText", {
                  defaultValue:
                    "Schreiben Sie uns direkt oder nutzen Sie das Kontaktformular. Wir melden uns so schnell wie möglich zurück.",
                })}
              </p>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
                {t("contactSection.responseHint", {
                  defaultValue: "Antwort in der Regel innerhalb kurzer Zeit.",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ContactSection);