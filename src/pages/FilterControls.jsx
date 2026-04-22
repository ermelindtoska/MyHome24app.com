// src/pages/FilterControls.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MdClear, MdLocationOn, MdHomeWork, MdTune } from "react-icons/md";

export default function FilterControls({
  filterCity,
  setFilterCity,
  filterType,
  setFilterType,
  filterPurpose,
  setFilterPurpose,
  onClear,
}) {
  const { t } = useTranslation(["filterBar", "listing"]);

  const typeOptions = useMemo(
    () => [
      { value: "", label: t("filterBar:allTypes", { defaultValue: "Alle Typen" }) },
      { value: "apartment", label: t("listing:apartment", { defaultValue: "Wohnung" }) },
      { value: "house", label: t("listing:house", { defaultValue: "Haus" }) },
    ],
    [t]
  );

  const purposeOptions = useMemo(
    () => [
      { value: "", label: t("filterBar:allPurposes", { defaultValue: "Alle Zwecke" }) },
      { value: "rent", label: t("listing:rent", { defaultValue: "Mieten" }) },
      { value: "buy", label: t("listing:buy", { defaultValue: "Kaufen" }) },
    ],
    [t]
  );

  const clear = () => {
    setFilterCity("");
    setFilterType("");
    setFilterPurpose("");
    onClear?.();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-950/40 dark:border-slate-800">
            <MdTune className="text-xl" />
          </span>
          <div>
            <div className="text-sm font-extrabold">
              {t("filterBar:title", { defaultValue: "Filter" })}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("filterBar:subtitle", { defaultValue: "Suche schneller nach passenden Listings." })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          <MdClear className="mr-2 text-base" />
          {t("filterBar:clear", { defaultValue: "Zurücksetzen" })}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {/* City */}
        <div className="relative">
          <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder={t("filterBar:cityPlaceholder", { defaultValue: "Stadt / PLZ" })}
            className="
              w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm
              outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              dark:bg-slate-950 dark:border-slate-700
            "
          />
        </div>

        {/* Type */}
        <div className="relative">
          <MdHomeWork className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="
              w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm
              outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              dark:bg-slate-950 dark:border-slate-700
            "
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        {/* Purpose */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            €
          </span>
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            className="
              w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm
              outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              dark:bg-slate-950 dark:border-slate-700
            "
          >
            {purposeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>
      </div>
    </div>
  );
}