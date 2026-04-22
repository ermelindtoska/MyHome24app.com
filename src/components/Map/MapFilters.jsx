import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSearchState } from "../../state/useSearchState";
import { useTranslation } from "react-i18next";
import {
  FiChevronDown,
  FiHome,
  FiSliders,
  FiCheck,
} from "react-icons/fi";

const cx = (...a) => a.filter(Boolean).join(" ");

const money = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("de-DE");
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
  const rootRef = useRef(null);

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
    setOpen(null);
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(null);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(null);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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
    const bTxt = b ? `${b}+ ${t("bedsShort", { defaultValue: "Zi." })}` : "";
    const baTxt = ba ? `${ba}+ ${t("bathsShort", { defaultValue: "Bad" })}` : "";
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

  const pillBase =
    "inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition";
  const pillStyle =
    "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800";
  const activePill =
    "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200";

  const inputBase =
    "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500";

  const dropdownBase =
    "absolute left-0 top-full z-[80] mt-3 w-[min(520px,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950";

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="flex flex-wrap items-center gap-2">
        {/* Price */}
        <div className="relative">
          <button
            type="button"
            className={cx(
              pillBase,
              pillStyle,
              open === "price" && activePill
            )}
            onClick={() => setOpen(open === "price" ? null : "price")}
            aria-expanded={open === "price"}
          >
            {priceLabel}
            <FiChevronDown
              className={cx(
                "transition",
                open === "price" && "rotate-180"
              )}
            />
          </button>

          {open === "price" && (
            <div className={dropdownBase}>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("price", { defaultValue: "Preis" })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
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

              <div className="mt-4 flex flex-wrap gap-2">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => update({ priceMin: p.min, priceMax: p.max })}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {p.key === "any"
                      ? t("any", { defaultValue: "Beliebig" })
                      : p.max
                      ? `€${money(p.min)} - €${money(p.max)}`
                      : `€${money(p.min)}+`}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => update({ priceMin: "", priceMax: "" })}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t("reset", { defaultValue: "Zurücksetzen" })}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t("done", { defaultValue: "Fertig" })}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Beds & Baths */}
        <div className="relative">
          <button
            type="button"
            className={cx(
              pillBase,
              pillStyle,
              open === "beds" && activePill
            )}
            onClick={() => setOpen(open === "beds" ? null : "beds")}
            aria-expanded={open === "beds"}
          >
            {bedsLabel}
            <FiChevronDown
              className={cx(
                "transition",
                open === "beds" && "rotate-180"
              )}
            />
          </button>

          {open === "beds" && (
            <div className={dropdownBase}>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("bedsBaths", { defaultValue: "Betten & Bäder" })}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("beds", { defaultValue: "Betten" })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BEDS.map((b) => (
                      <button
                        key={`b-${b || "any"}`}
                        type="button"
                        onClick={() => update({ bedsMin: b })}
                        className={cx(
                          "rounded-2xl border px-3 py-2 text-sm transition",
                          filters.bedsMin === b
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200"
                            : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        )}
                      >
                        {b ? b : t("any", { defaultValue: "Beliebig" })}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("baths", { defaultValue: "Bäder" })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BATHS.map((b) => (
                      <button
                        key={`ba-${b || "any"}`}
                        type="button"
                        onClick={() => update({ bathsMin: b })}
                        className={cx(
                          "rounded-2xl border px-3 py-2 text-sm transition",
                          filters.bathsMin === b
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200"
                            : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        )}
                      >
                        {b ? b : t("any", { defaultValue: "Beliebig" })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => update({ bedsMin: "", bathsMin: "" })}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t("reset", { defaultValue: "Zurücksetzen" })}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t("done", { defaultValue: "Fertig" })}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Type */}
        <div className="relative">
          <button
            type="button"
            className={cx(
              pillBase,
              pillStyle,
              open === "type" && activePill
            )}
            onClick={() => setOpen(open === "type" ? null : "type")}
            aria-expanded={open === "type"}
          >
            <FiHome className="opacity-70" />
            {typeLabel}
            <FiChevronDown
              className={cx(
                "transition",
                open === "type" && "rotate-180"
              )}
            />
          </button>

          {open === "type" && (
            <div className={dropdownBase}>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("homeType", { defaultValue: "Immobilientyp" })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TYPES.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => update({ type: it.value })}
                    className={cx(
                      "rounded-2xl border px-3 py-3 text-sm transition",
                      filters.type === it.value
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200"
                        : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    )}
                  >
                    {t(it.i18n, { defaultValue: it.i18n })}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => update({ type: "" })}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t("reset", { defaultValue: "Zurücksetzen" })}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t("done", { defaultValue: "Fertig" })}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* More */}
        <div className="relative">
          <button
            type="button"
            className={cx(
              pillBase,
              pillStyle,
              open === "more" && activePill
            )}
            onClick={() => setOpen(open === "more" ? null : "more")}
            aria-expanded={open === "more"}
          >
            <FiSliders className="opacity-70" />
            {t("more", { defaultValue: "Mehr" })}
            {moreCount > 0 ? (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
                {moreCount}
              </span>
            ) : null}
            <FiChevronDown
              className={cx(
                "transition",
                open === "more" && "rotate-180"
              )}
            />
          </button>

          {open === "more" && (
            <div className={dropdownBase}>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("moreFilters", { defaultValue: "Weitere Filter" })}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    k: "petsAllowed",
                    label: t("petsAllowed", { defaultValue: "Haustiere erlaubt" }),
                  },
                  {
                    k: "furnished",
                    label: t("furnished", { defaultValue: "Möbliert" }),
                  },
                  {
                    k: "parking",
                    label: t("parking", { defaultValue: "Parkplatz" }),
                  },
                  {
                    k: "newOnly",
                    label: t("newOnly", { defaultValue: "Nur neu" }),
                  },
                  {
                    k: "verifiedOnly",
                    label: t("verifiedOnly", { defaultValue: "Nur verifiziert" }),
                  },
                ].map((x) => (
                  <label
                    key={x.k}
                    className={cx(
                      "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                      filters?.[x.k]
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-200"
                        : "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    )}
                  >
                    <span>{x.label}</span>
                    <span
                      className={cx(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                        filters?.[x.k]
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-slate-300 text-transparent dark:border-slate-600"
                      )}
                    >
                      <FiCheck />
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(filters?.[x.k])}
                      onChange={(e) => update({ [x.k]: e.target.checked })}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    update({
                      petsAllowed: false,
                      furnished: false,
                      parking: false,
                      newOnly: false,
                      verifiedOnly: false,
                    })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t("reset", { defaultValue: "Zurücksetzen" })}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t("done", { defaultValue: "Fertig" })}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition hover:bg-slate-50 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-label={t("sort", { defaultValue: "Sortieren" })}
        >
          <option value="">{t("default", { defaultValue: "Standard" })}</option>
          <option value="priceAsc">{t("priceAsc", { defaultValue: "Preis ↑" })}</option>
          <option value="priceDesc">{t("priceDesc", { defaultValue: "Preis ↓" })}</option>
          <option value="newest">{t("newest", { defaultValue: "Neueste" })}</option>
        </select>

        {/* Reset */}
        <button
          type="button"
          onClick={resetAll}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("reset", { defaultValue: "Zurücksetzen" })}
        </button>
      </div>
    </div>
  );
}