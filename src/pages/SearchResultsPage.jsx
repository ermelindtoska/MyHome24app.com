import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ListingCard from "../components/ListingCard";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  FaSearch,
  FaEuroSign,
  FaBed,
  FaBath,
  FaHome,
  FaSortAmountDown,
  FaUndo,
  FaMapMarkedAlt,
} from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SearchResultsPage() {
  const { t, i18n } = useTranslation("search");
  const navigate = useNavigate();
  const qs = useQuery();

  const [query, setQuery] = useState(qs.get("query") || "");
  const [minPrice, setMinPrice] = useState(qs.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(qs.get("maxPrice") || "");
  const [beds, setBeds] = useState(qs.get("beds") || "");
  const [baths, setBaths] = useState(qs.get("baths") || "");
  const [type, setType] = useState(qs.get("type") || "");
  const [sort, setSort] = useState(qs.get("sort") || "newest");

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(Number(qs.get("page") || 1));
  const perPage = 12;

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/search`;

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    if (type) params.set("type", type);
    if (sort) params.set("sort", sort);
    if (page) params.set("page", String(page));

    navigate({ pathname: "/search", search: params.toString() }, { replace: true });
  }, [query, minPrice, maxPrice, beds, baths, type, sort, page, navigate]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "listings"));
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) setAll(docs);
      } catch (e) {
        console.error("Error fetching listings:", e);
        if (isMounted) setAll([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase();

    const mPrice = Number(minPrice) || null;
    const MPrice = Number(maxPrice) || null;
    const minB = Number(beds) || null;
    const minBa = Number(baths) || null;
    const tt = (type || "").toLowerCase();

    let items = all.filter((l) => {
      const title = (l.title || "").toLowerCase();
      const city = (l.city || "").toLowerCase();
      const address =
        typeof l.address === "string"
          ? l.address.toLowerCase()
          : (l.address?.street || "").toLowerCase();
      const zip = (l.zipCode || "").toLowerCase();

      const matchesQ =
        !q || title.includes(q) || city.includes(q) || address.includes(q) || zip.includes(q);

      const priceOk =
        (mPrice == null || (l.price ?? 0) >= mPrice) &&
        (MPrice == null || (l.price ?? 0) <= MPrice);

      const bedsOk = minB == null || (l.bedrooms ?? l.beds ?? 0) >= minB;
      const bathsOk = minBa == null || (l.bathrooms ?? l.baths ?? 0) >= minBa;
      const typeOk = !tt || (l.type || "").toLowerCase() === tt;

      return matchesQ && priceOk && bedsOk && bathsOk && typeOk;
    });

    items.sort((a, b) => {
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);

      const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.parse(a.createdAt || 0);
      const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.parse(b.createdAt || 0);
      return (bT || 0) - (aT || 0);
    });

    return items;
  }, [all, query, minPrice, maxPrice, beds, baths, type, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleClear = () => {
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setBaths("");
    setType("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 text-slate-900 dark:bg-slate-950 dark:text-slate-50 relative">
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
      />

      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <button
          onClick={() => navigate("/map")}
          className="w-full rounded-full bg-blue-600 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
        >
          {t("mapSearch", { ns: "navbar", defaultValue: "Map" })}
        </button>
      </div>

      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-500/10 p-6 md:p-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                <FaSearch className="mr-2 text-[10px]" />
                {t("badge", { defaultValue: "Immobiliensuche" })}
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t("resultsFor", { defaultValue: "Suchergebnisse für" })}{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  "{query || qs.get("query") || t("searchResults")}"
                </span>
              </h1>

              <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
                {t("description", {
                  defaultValue:
                    "Filtern Sie aktive Immobilienanzeigen nach Preis, Typ, Zimmeranzahl und weiteren Kriterien."
                })}
              </p>

              <div className="mt-5 inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
                {t("resultsFound", { count: filtered.length, defaultValue: `${filtered.length} Einträge gefunden` })} • {t("pageInfo", {
                  current: currentPage,
                  total: totalPages,
                  defaultValue: `Seite ${currentPage} von ${totalPages}`
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {t("filters.title", { defaultValue: "Suchfilter" })}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("filters.subtitle", { defaultValue: "Passen Sie die Suche an Ihre Wünsche an." })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            <FilterField icon={<FaSearch />} label={t("searchTitle", { defaultValue: "Suche" })}>
              <input
                className="input-search-results"
                placeholder={t("searchPlaceholder", { defaultValue: "Stadt, Postleitzahl, Adresse oder Bundesland" })}
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
              />
            </FilterField>

            <FilterField icon={<FaEuroSign />} label={t("filters.minPriceLabel", { defaultValue: "Mindestpreis" })}>
              <input
                className="input-search-results"
                type="number"
                min="0"
                placeholder={t("filters.minPricePlaceholder", { defaultValue: "Min €" })}
                value={minPrice}
                onChange={(e) => {
                  setPage(1);
                  setMinPrice(e.target.value);
                }}
              />
            </FilterField>

            <FilterField icon={<FaEuroSign />} label={t("filters.maxPriceLabel", { defaultValue: "Höchstpreis" })}>
              <input
                className="input-search-results"
                type="number"
                min="0"
                placeholder={t("filters.maxPricePlaceholder", { defaultValue: "Max €" })}
                value={maxPrice}
                onChange={(e) => {
                  setPage(1);
                  setMaxPrice(e.target.value);
                }}
              />
            </FilterField>

            <FilterField icon={<FaBed />} label={t("bedrooms", { defaultValue: "Schlafzimmer" })}>
              <select
                className="input-search-results"
                value={beds}
                onChange={(e) => {
                  setPage(1);
                  setBeds(e.target.value);
                }}
              >
                <option value="">{t("filters.bedsOptions.any", { defaultValue: "Beliebig" })}</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </FilterField>

            <FilterField icon={<FaBath />} label={t("cards.baths", { defaultValue: "Bäder" })}>
              <select
                className="input-search-results"
                value={baths}
                onChange={(e) => {
                  setPage(1);
                  setBaths(e.target.value);
                }}
              >
                <option value="">{t("filters.bedsOptions.any", { defaultValue: "Beliebig" })}</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </FilterField>

            <FilterField icon={<FaHome />} label={t("type", { defaultValue: "Immobilientyp" })}>
              <select
                className="input-search-results"
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value);
                }}
              >
                <option value="">{t("filters.typeOptions.any", { defaultValue: "Alle Typen" })}</option>
                <option value="apartment">{t("apartment", { defaultValue: "Wohnung" })}</option>
                <option value="house">{t("house", { defaultValue: "Haus" })}</option>
                <option value="commercial">Commercial</option>
              </select>
            </FilterField>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="min-w-[220px]">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">
                  <FaSortAmountDown />
                </span>
                {t("sortBy", { defaultValue: "Sortieren nach" })}
              </label>
              <select
                className="input-search-results"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">{t("sortNewest", { defaultValue: "Neueste zuerst" })}</option>
                <option value="price_asc">{t("sortPriceLowHigh", { defaultValue: "Preis: aufsteigend" })}</option>
                <option value="price_desc">{t("sortPriceHighLow", { defaultValue: "Preis: absteigend" })}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClear}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <FaUndo className="mr-2" />
                {t("resetFilters", { defaultValue: "Filter zurücksetzen" })}
              </button>
            </div>

            <div className="flex items-end md:ml-auto">
              <button
                onClick={() => navigate("/map")}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <FaMapMarkedAlt className="mr-2" />
                {t("visibleOnMap", { defaultValue: "Sichtbar auf der Karte" })}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <StateBox
              title={t("states.loadingTitle", { defaultValue: "Immobilien werden geladen" })}
              text={t("states.loadingText", { defaultValue: "Bitte warten Sie einen Moment, während passende Immobilien geladen werden." })}
            />
          ) : filtered.length === 0 ? (
            <StateBox
              title={t("states.emptyTitle", { defaultValue: "Keine passenden Immobilien gefunden" })}
              text={t("states.emptyText", { defaultValue: "Passen Sie Ihre Suchfilter an, um weitere Treffer zu erhalten." })}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {pageItems.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
                  <button
                    onClick={goPrev}
                    disabled={currentPage === 1}
                    className="rounded-full bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    {t("previous", { defaultValue: "Zurück" })}
                  </button>

                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t("pageInfo", {
                      current: currentPage,
                      total: totalPages,
                      defaultValue: `Seite ${currentPage} von ${totalPages}`,
                    })}
                  </span>

                  <button
                    onClick={goNext}
                    disabled={currentPage === totalPages}
                    className="rounded-full bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    {t("next", { defaultValue: "Weiter" })}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style>{`
        .input-search-results {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 1rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          color: rgb(15 23 42);
          outline: none;
          transition: all 0.2s ease;
        }
        .input-search-results:focus {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .dark .input-search-results {
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

function StateBox({ title, text }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}