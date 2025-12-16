// src/components/Map/MapFilters.jsx
import React, { useMemo, useState } from "react";
import { useSearchState } from "../../state/useSearchState";
import { useTranslation } from "react-i18next";

// util
const cx = (...a) => a.filter(Boolean).join(" ");

const money = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString();
};

const PRICE_PRESETS = [
  { key: "any", min: "", max: "" },
  { key: "0-500", min: "0", max: "500" },
  { key: "500-1000", min: "500", max: "1000" },
  { key: "1000-1500", min: "1000", max: "1500" },
  { key: "1500-2000", min: "1500", max: "2000" },
  { key: "2000+", min: "2000", max: "" },
];

const BEDS = ["", "1", "2", "3", "4", "5+"];
const BATHS = ["", "1", "2", "3", "4", "5+"];

const TYPES = [
  { key: "", value: "", i18n: "allTypes" },
  { key: "apartment", value: "apartment", i18n: "apartment" },
  { key: "house", value: "house", i18n: "house" },
  { key: "commercial", value: "commercial", i18n: "commercial" },
];

export default function MapFilters() {
  const { t } = useTranslation(["filterBar"]);
  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    search,
    setSearch,
  } = useSearchState();

  const [open, setOpen] = useState(null); // "price" | "beds" | "type" | "more" | null

  const update = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetAll = () => {
    setSearch("");
    setSortBy("");
    setFilters({
      city: "",
      type: "",
      priceMin: "",
      priceMax: "",
      bedsMin: "",
      bathsMin: "",
      petsAllowed: false,
      furnished: false,
      parking: false,
      newOnly: false,
      verifiedOnly: false,
    });
  };

  // Labels (si Zillow)
  const priceLabel = useMemo(() => {
    const min = filters.priceMin;
    const max = filters.priceMax;
    if (!min && !max) return t("price", { defaultValue: "Preis" });
    if (min && max) return `€${money(min)} - €${money(max)}`;
    if (min && !max) return `€${money(min)}+`;
    return `≤ €${money(max)}`;
  }, [filters.priceMin, filters.priceMax, t]);

  const bedsLabel = useMemo(() => {
    const b = filters.bedsMin;
    const ba = filters.bathsMin;
    if (!b && !ba) return t("bedsBaths", { defaultValue: "Betten & Bäder" });
    const bTxt = b ? `${b}+ ${t("bedsShort", { defaultValue: "bd" })}` : "";
    const baTxt = ba ? `${ba}+ ${t("bathsShort", { defaultValue: "ba" })}` : "";
    return [bTxt, baTxt].filter(Boolean).join(" · ");
  }, [filters.bedsMin, filters.bathsMin, t]);

  const typeLabel = useMemo(() => {
    if (!filters.type) return t("homeType", { defaultValue: "Immobilientyp" });
    return t(filters.type, { defaultValue: filters.type });
  }, [filters.type, t]);

  const moreCount = useMemo(() => {
    const keys = ["petsAllowed", "furnished", "parking", "newOnly", "verifiedOnly"];
    return keys.reduce((acc, k) => (filters?.[k] ? acc + 1 : acc), 0);
  }, [filters]);

  // UI atoms
  const barWrap =
    "relative rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/92 dark:bg-gray-950/80 backdrop-blur shadow-lg";
  const inputBase =
    "w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60";
  const pill =
    "h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition inline-flex items-center gap-2";
  const dropdown =
    "absolute mt-2 w-full max-w-[520px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-2xl p-4";

  return (
    <div className={barWrap}>
      {/* TOP ROW: search + pills */}
      <div className="p-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-center">
          {/* Search input */}
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchLocation", {
                defaultValue: "Adresse, Stadt oder PLZ",
              })}
              className={inputBase}
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              ⌕
            </div>
          </div>

          {/* Pills row */}
          <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
            <button
              type="button"
              className={pill}
              onClick={() => setOpen(open === "price" ? null : "price")}
              aria-expanded={open === "price"}
            >
              {priceLabel} <span className="text-gray-400">▾</span>
            </button>

            <button
              type="button"
              className={pill}
              onClick={() => setOpen(open === "beds" ? null : "beds")}
              aria-expanded={open === "beds"}
            >
              {bedsLabel} <span className="text-gray-400">▾</span>
            </button>

            <button
              type="button"
              className={pill}
              onClick={() => setOpen(open === "type" ? null : "type")}
              aria-expanded={open === "type"}
            >
              {typeLabel} <span className="text-gray-400">▾</span>
            </button>

            <button
              type="button"
              className={pill}
              onClick={() => setOpen(open === "more" ? null : "more")}
              aria-expanded={open === "more"}
            >
              {t("more", { defaultValue: "Mehr" })}
              {moreCount > 0 ? (
                <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-blue-600 text-white text-xs">
                  {moreCount}
                </span>
              ) : null}
              <span className="text-gray-400">▾</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
              aria-label={t("sort", { defaultValue: "Sortieren" })}
            >
              <option value="">{t("default", { defaultValue: "Standard" })}</option>
              <option value="priceAsc">{t("priceAsc", { defaultValue: "Preis ↑" })}</option>
              <option value="priceDesc">{t("priceDesc", { defaultValue: "Preis ↓" })}</option>
              <option value="newest">{t("newest", { defaultValue: "Neueste" })}</option>
            </select>

            <button
              type="button"
              onClick={resetAll}
              className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {t("reset", { defaultValue: "Zurücksetzen" })}
            </button>
          </div>
        </div>
      </div>

      {/* DROPDOWNS */}
      <div className="relative px-3 pb-3">
        {/* Price */}
        {open === "price" && (
          <div className={dropdown}>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("price", { defaultValue: "Preis" })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={filters.priceMin}
                onChange={(e) => update({ priceMin: e.target.value })}
                placeholder={t("minPrice", { defaultValue: "Min" })}
                className={inputBase}
              />
              <input
                type="number"
                inputMode="numeric"
                value={filters.priceMax}
                onChange={(e) => update({ priceMax: e.target.value })}
                placeholder={t("maxPrice", { defaultValue: "Max" })}
                className={inputBase}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => update({ priceMin: p.min, priceMax: p.max })}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
                >
                  {p.key === "any"
                    ? t("any", { defaultValue: "Beliebig" })
                    : p.max
                    ? `€${money(p.min)} - €${money(p.max)}`
                    : `€${money(p.min)}+`}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                {t("done", { defaultValue: "Fertig" })}
              </button>
            </div>
          </div>
        )}

        {/* Beds & Baths */}
        {open === "beds" && (
          <div className={dropdown}>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("bedsBaths", { defaultValue: "Betten & Bäder" })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {t("beds", { defaultValue: "Betten" })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {BEDS.map((b) => (
                    <button
                      key={`b-${b || "any"}`}
                      type="button"
                      onClick={() => update({ bedsMin: b })}
                      className={cx(
                        "px-3 py-2 rounded-xl border text-sm",
                        filters.bedsMin === b
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                      )}
                    >
                      {b ? b : t("any", { defaultValue: "Beliebig" })}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {t("baths", { defaultValue: "Bäder" })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {BATHS.map((b) => (
                    <button
                      key={`ba-${b || "any"}`}
                      type="button"
                      onClick={() => update({ bathsMin: b })}
                      className={cx(
                        "px-3 py-2 rounded-xl border text-sm",
                        filters.bathsMin === b
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                      )}
                    >
                      {b ? b : t("any", { defaultValue: "Beliebig" })}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                {t("done", { defaultValue: "Fertig" })}
              </button>
            </div>
          </div>
        )}

        {/* Home Type */}
        {open === "type" && (
          <div className={dropdown}>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("homeType", { defaultValue: "Immobilientyp" })}
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPES.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => update({ type: it.value })}
                  className={cx(
                    "px-3 py-2 rounded-xl border text-sm",
                    filters.type === it.value
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  )}
                >
                  {t(it.i18n, { defaultValue: it.i18n })}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                {t("done", { defaultValue: "Fertig" })}
              </button>
            </div>
          </div>
        )}

        {/* More */}
        {open === "more" && (
          <div className={dropdown}>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("moreFilters", { defaultValue: "Weitere Filter" })}
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: "petsAllowed", label: t("petsAllowed", { defaultValue: "Haustiere erlaubt" }) },
                { k: "furnished", label: t("furnished", { defaultValue: "Möbliert" }) },
                { k: "parking", label: t("parking", { defaultValue: "Parkplatz" }) },
                { k: "newOnly", label: t("newOnly", { defaultValue: "Nur neu" }) },
                { k: "verifiedOnly", label: t("verifiedOnly", { defaultValue: "Nur verifiziert" }) },
              ].map((x) => (
                <label
                  key={x.k}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(filters?.[x.k])}
                    onChange={(e) => update({ [x.k]: e.target.checked })}
                  />
                  {x.label}
                </label>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                {t("done", { defaultValue: "Fertig" })}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* click-away overlay (lightweight) */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-0 cursor-default"
          onClick={() => setOpen(null)}
          aria-label="Close"
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
}
