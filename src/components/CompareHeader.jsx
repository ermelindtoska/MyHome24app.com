import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FiBarChart2, FiHome, FiMapPin } from "react-icons/fi";

const CompareHeader = ({ selectedListings = [] }) => {
  const { t } = useTranslation("compare");

  const stats = useMemo(() => {
    const count = selectedListings.length;

    const prices = selectedListings
      .map((l) => Number(l.price))
      .filter((p) => !isNaN(p));

    const avgPrice =
      prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

    const maxSize = Math.max(
      ...selectedListings.map((l) => Number(l.size) || 0),
      0
    );

    const cities = new Set(selectedListings.map((l) => l.city)).size;

    return { count, avgPrice, maxSize, cities };
  }, [selectedListings]);

  const formatPrice = (value) => {
    if (!value) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 md:p-8 shadow-sm">

      {/* TOP */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* TEXT */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-3">
            <FiBarChart2 size={14} />
            {t("hero.badge", { defaultValue: "Vergleichszentrale" })}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("hero.title", {
              defaultValue: "Immobilien professionell vergleichen",
            })}
          </h1>

          <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500">
              {t("stats.selected")}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.count}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500">
              {t("stats.avgPrice")}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatPrice(stats.avgPrice)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500">
              {t("stats.largest")}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.maxSize ? `${stats.maxSize} m²` : "—"}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500">
              {t("stats.cities")}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.cities}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
          {t("actions.addListings")}
        </button>

        <button className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          {t("actions.copySummary")}
        </button>

        <button className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          {t("actions.refresh")}
        </button>

        <button className="px-4 py-2 rounded-full border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          {t("actions.clearAll")}
        </button>
      </div>
    </div>
  );
};

export default CompareHeader;