import React from "react";
import { useTranslation } from "react-i18next";
import { FiCheckCircle, FiGlobe, FiType } from "react-icons/fi";

const TranslationTest = () => {
  const { t, i18n } = useTranslation("compare");

  const items = [
    {
      label: "filters.city",
      value: t("filters.city", { defaultValue: "Stadt" }),
    },
    {
      label: "actions.copy",
      value: t("actions.copy", { defaultValue: "Kopieren" }),
    },
    {
      label: "copied",
      value: t("copied", { defaultValue: "Kopiert" }),
    },
    {
      label: "noData",
      value: t("noData", { defaultValue: "Keine Daten verfügbar" }),
    },
    {
      label: "title",
      value: t("title", { defaultValue: "Vergleich" }),
    },
  ];

  return (
    <section className="w-full max-w-3xl mx-auto rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 dark:border-slate-800 px-5 py-4 md:px-6 md:py-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3">
              <FiGlobe className="text-sm" />
              i18n Test
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Übersetzungs-Test
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
              Prüfung des Namespace <span className="font-semibold">compare</span> in der aktuellen Sprache.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1">
              Aktive Sprache
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {i18n.language || "de"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 md:px-6 md:py-6">
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50 px-4 py-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiType className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 break-all">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TranslationTest;