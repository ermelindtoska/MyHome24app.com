import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { MdGavel } from "react-icons/md";

const fallbackSections = [
  {
    title: "1. Allgemeine Nutzung",
    text: "Die Nutzung erfolgt gemäß den geltenden gesetzlichen Bestimmungen.",
  },
  {
    title: "2. Inhalte und Inserate",
    text: "Für Inhalte sind ausschließlich die Nutzer:innen verantwortlich.",
  },
  {
    title: "3. Haftung",
    text: "MyHome24App haftet nur im Rahmen der gesetzlichen Vorschriften.",
  },
  {
    title: "4. Änderungen",
    text: "Wir behalten uns vor, diese Bedingungen jederzeit anzupassen.",
  },
];

const TermsPage = () => {
  const { t, i18n } = useTranslation("terms");

  const lang = i18n.language?.slice(0, 2) || "de";

  // ✅ SAFE: mos crash kur nuk ekziston sections
  const translatedSections = t("sections", { returnObjects: true });
  const sections = Array.isArray(translatedSections)
    ? translatedSections
    : fallbackSections;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-16 md:pt-0">
      <Helmet>
        <title>
          {t("metaTitle", { defaultValue: "Nutzungsbedingungen" })}
        </title>
        <meta
          name="description"
          content={t("metaDescription", {
            defaultValue: "Nutzungsbedingungen der Plattform",
          })}
        />
        <html lang={lang} />
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
            <MdGavel size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("title", { defaultValue: "Nutzungsbedingungen" })}
          </h1>
        </div>

        <p className="mb-10 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t("intro", {
            defaultValue:
              "Bitte lesen Sie diese Bedingungen sorgfältig durch.",
          })}
        </p>

        {/* SECTIONS */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        {/* FOOT NOTE */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-6 text-sm text-slate-500 dark:text-slate-400">
          {t("lastUpdated", {
            defaultValue: "Zuletzt aktualisiert: 2025",
          })}
        </div>
      </main>
    </div>
  );
};

export default TermsPage;