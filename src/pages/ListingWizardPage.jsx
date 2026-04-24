import React from "react";
import { useTranslation } from "react-i18next";
import ListingWizard from "../components/listing/ListingWizard";

export default function ListingWizardPage() {
  const { t } = useTranslation("publish");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {t("page.badge", { defaultValue: "Listing Wizard" })}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
            {t("page.title", {
              defaultValue: "Immobilie professionell veröffentlichen",
            })}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t("page.subtitle", {
              defaultValue:
                "Erstellen Sie Ihre Anzeige Schritt für Schritt – mit Basisdaten, Standort, Fotos und abschließender Prüfung.",
            })}
          </p>
        </div>

        <ListingWizard />
      </div>
    </main>
  );
}