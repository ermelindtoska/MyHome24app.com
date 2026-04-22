import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaHome,
  FaBed,
  FaMapMarkerAlt,
  FaEuroSign,
  FaUndo,
  FaLayerGroup,
} from "react-icons/fa";
import { db } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";

const COLLECTION = "listings";

export default function SearchPage() {
  const { t, i18n } = useTranslation("searchPage");

  const [all, setAll] = useState([]);
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [purpose, setPurpose] = useState("rent");
  const [type, setType] = useState("any");
  const [beds, setBeds] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity] = useState("");

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/homes`;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setFetchError("");

      try {
        const baseQ = query(
          collection(db, COLLECTION),
          where("status", "==", "active"),
          orderBy("createdAt", "desc"),
          limit(200)
        );

        const snap = await getDocs(baseQ);
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAll(arr);
      } catch (e) {
        console.error("[SearchPage] load error:", e);
        setFetchError(
          t("states.errorText", {
            defaultValue: "Die Immobilien konnten nicht geladen werden.",
          })
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [t]);

  useEffect(() => {
    const f = all.filter((it) => {
      if (purpose !== "any" && it.purpose !== purpose) return false;
      if (type !== "any" && it.type !== type) return false;
      if (beds > 0 && Number(it.beds || 0) < beds) return false;

      const p = Number(it.price || 0);
      if (minPrice && p < Number(minPrice)) return false;
      if (maxPrice && p > Number(maxPrice)) return false;

      const itemCity =
        String(it?.address?.city || it?.city || "").toLowerCase();

      if (city && itemCity !== city.toLowerCase()) return false;

      return true;
    });

    setHits(f);
  }, [all, purpose, type, beds, minPrice, maxPrice, city]);

  const resultsLabel = useMemo(() => {
    return t("resultsCount", {
      count: hits.length,
      defaultValue: "{{count}} Ergebnisse",
    });
  }, [hits.length, t]);

  const handleReset = () => {
    setPurpose("rent");
    setType("any");
    setBeds(0);
    setMinPrice("");
    setMaxPrice("");
    setCity("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Helmet>
        <title>{t("metaTitle")} – MyHome24App</title>
      </Helmet>

      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-500/10 p-6 md:p-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                <FaSearch className="mr-2 text-[10px]" />
                {t("badge")}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                {t("title")}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                {t("description")}
              </p>

              <div className="mt-6 inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                {resultsLabel}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {t("filters.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("filters.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            <FilterField icon={<FaLayerGroup />} label={t("filters.purposeLabel")}>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="input-search"
              >
                <option value="rent">{t("filters.purposeOptions.rent")}</option>
                <option value="sale">{t("filters.purposeOptions.sale")}</option>
                <option value="any">{t("filters.purposeOptions.any")}</option>
              </select>
            </FilterField>

            <FilterField icon={<FaHome />} label={t("filters.typeLabel")}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-search"
              >
                <option value="any">{t("filters.typeOptions.any")}</option>
                <option value="apartment">{t("filters.typeOptions.apartment")}</option>
                <option value="house">{t("filters.typeOptions.house")}</option>
                <option value="condo">{t("filters.typeOptions.condo")}</option>
              </select>
            </FilterField>

            <FilterField icon={<FaBed />} label={t("filters.bedsLabel")}>
              <select
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="input-search"
              >
                <option value="0">{t("filters.bedsOptions.any")}</option>
                <option value="1">{t("filters.bedsOptions.one")}</option>
                <option value="2">{t("filters.bedsOptions.two")}</option>
                <option value="3">{t("filters.bedsOptions.three")}</option>
                <option value="4">{t("filters.bedsOptions.four")}</option>
              </select>
            </FilterField>

            <FilterField icon={<FaMapMarkerAlt />} label={t("filters.cityLabel")}>
              <input
                className="input-search"
                placeholder={t("filters.cityPlaceholder")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </FilterField>

            <FilterField icon={<FaEuroSign />} label={t("filters.minPriceLabel")}>
              <input
                className="input-search"
                placeholder={t("filters.minPricePlaceholder")}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                inputMode="numeric"
              />
            </FilterField>

            <FilterField icon={<FaEuroSign />} label={t("filters.maxPriceLabel")}>
              <input
                className="input-search"
                placeholder={t("filters.maxPricePlaceholder")}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                inputMode="numeric"
              />
            </FilterField>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <FaUndo className="mr-2" />
              {t("filters.reset")}
            </button>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <StateBox title={t("states.loadingTitle")} text={t("states.loadingText")} />
          ) : fetchError ? (
            <StateBox title={t("states.errorTitle")} text={fetchError} danger />
          ) : hits.length === 0 ? (
            <StateBox title={t("states.emptyTitle")} text={t("states.emptyText")} />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {hits.map((h) => (
                <article
                  key={h.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {h.title || t("cards.untitled")}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {(h?.address?.city || h?.city || "—")} · {h.type || "—"}
                      </p>
                    </div>

                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {h.purpose || "—"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span>
                      {Number(h.beds ?? 0)} {t("cards.beds")}
                    </span>
                    <span>
                      {Number(h.baths ?? 0)} {t("cards.baths")}
                    </span>
                    <span>
                      {h.sizeSqm ?? "—"} m²
                    </span>
                  </div>

                  <div className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-50">
                    € {Number(h.price || 0).toLocaleString(lang === "de" ? "de-DE" : "en-US")}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .input-search {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 1rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          color: rgb(15 23 42);
          outline: none;
          transition: all 0.2s ease;
        }
        .input-search:focus {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .dark .input-search {
          background: rgb(30 41 59);
          border-color: rgb(71 85 105);
          color: rgb(248 250 252);
        }
      `}</style>
    </div>
  );
}

function FilterField({ label, children, icon }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function StateBox({ title, text, danger = false }) {
  return (
    <div
      className={`rounded-[28px] border p-8 shadow-sm ${
        danger
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      }`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}