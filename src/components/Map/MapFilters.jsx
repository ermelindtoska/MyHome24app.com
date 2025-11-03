// src/components/Map/MapFilters.jsx
import React from "react";
import { useSearchState } from "../../state/useSearchState";
import { useTranslation } from "react-i18next";

export default function MapFilters() {
  const { t } = useTranslation(["filterBar"]);
  const { filters, setFilters, sortBy, setSortBy, search, setSearch } = useSearchState();

  const onChange = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="rounded-xl bg-gray-900/80 dark:bg-gray-900/80 text-white px-4 py-3 shadow-xl border border-white/10">
      {/* Stadt */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <input
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder={t("city", { defaultValue: "Stadt" })}
          className="col-span-2 md:col-span-2 px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
        />

        {/* Typ */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">{t("allTypes", { defaultValue: "Alle Typen" })}</option>
          <option value="apartment">{t("apartment", { defaultValue: "Wohnung" })}</option>
          <option value="house">{t("house", { defaultValue: "Haus" })}</option>
          <option value="commercial">{t("commercial", { defaultValue: "Gewerbe" })}</option>
        </select>

        {/* Preis min/max */}
        <input
          type="number"
          inputMode="numeric"
          value={filters.priceMin}
          onChange={(e) => onChange({ priceMin: e.target.value })}
          placeholder={t("minPrice", { defaultValue: "Mindestpreis" })}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
        />
        <input
          type="number"
          inputMode="numeric"
          value={filters.priceMax}
          onChange={(e) => onChange({ priceMax: e.target.value })}
          placeholder={t("maxPrice", { defaultValue: "Höchstpreis" })}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="col-span-2 md:col-span-1 px-3 py-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">{t("default", { defaultValue: "Standard" })}</option>
          <option value="priceAsc">{t("priceAsc", { defaultValue: "Preis ⬆︎" })}</option>
          <option value="priceDesc">{t("priceDesc", { defaultValue: "Preis ⬇︎" })}</option>
        </select>
      </div>

      {/* Freitextsuche */}
      <div className="mt-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchLocation", { defaultValue: "Nach Stadt oder Adresse suchen…" })}
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Reset */}
      <div className="mt-2">
        <button
          onClick={() =>
            setFilters({ city: "", type: "", priceMin: "", priceMax: "" })
          }
          className="px-3 py-1.5 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
        >
          {t("reset", { defaultValue: "Zurücksetzen" })}
        </button>
      </div>
    </div>
  );
}
