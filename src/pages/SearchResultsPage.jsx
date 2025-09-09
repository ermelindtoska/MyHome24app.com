// src/pages/SearchResultsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ListingCard from "../components/ListingCard";
import { useTranslation } from "react-i18next";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SearchResultsPage() {
  const { t } = useTranslation("search");
  const navigate = useNavigate();
  const qs = useQuery();

  // 1) URL → state
  const [query, setQuery] = useState(qs.get("query") || "");
  const [minPrice, setMinPrice] = useState(qs.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(qs.get("maxPrice") || "");
  const [beds, setBeds] = useState(qs.get("beds") || "");
  const [baths, setBaths] = useState(qs.get("baths") || "");
  const [type, setType] = useState(qs.get("type") || "");
  const [sort, setSort] = useState(qs.get("sort") || "newest");

  // 2) data
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3) pagination
  const [page, setPage] = useState(Number(qs.get("page") || 1));
  const perPage = 12;

  // Sync state -> URL (pa eslint-disable)
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

  // Fetch listings (client-side filter)
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

  // 4) filtrimi
  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase();

    const mPrice = Number(minPrice) || null;
    const MPrice = Number(maxPrice) || null;
    const minB = Number(beds) || null;
    const minBa = Number(baths) || null;
    const t = (type || "").toLowerCase();

    let items = all.filter((l) => {
      // përshtat emrat e fushave nëse i ke ndryshe
      const title = (l.title || "").toLowerCase();
      const city = (l.city || "").toLowerCase();
      const address = (l.address || "").toLowerCase();
      const zip = (l.zipCode || "").toLowerCase();

      const matchesQ =
        !q || title.includes(q) || city.includes(q) || address.includes(q) || zip.includes(q);

      const priceOk =
        (mPrice == null || (l.price ?? 0) >= mPrice) &&
        (MPrice == null || (l.price ?? 0) <= MPrice);

      const bedsOk = minB == null || (l.bedrooms ?? l.beds ?? 0) >= minB;
      const bathsOk = minBa == null || (l.bathrooms ?? l.baths ?? 0) >= minBa;
      const typeOk = !t || (l.type || "").toLowerCase() === t;

      return matchesQ && priceOk && bedsOk && bathsOk && typeOk;
    });

    // 5) renditja
    items.sort((a, b) => {
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      // newest by createdAt
      const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.parse(a.createdAt || 0);
      const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.parse(b.createdAt || 0);
      return (bT || 0) - (aT || 0);
    });

    return items;
  }, [all, query, minPrice, maxPrice, beds, baths, type, sort]);

  // 6) pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 7) UI e filtrave
  const FilterBar = (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
      <input
        className="border rounded px-3 py-2"
        placeholder="Search city / address"
        value={query}
        onChange={(e) => {
          setPage(1);
          setQuery(e.target.value);
        }}
      />
      <input
        className="border rounded px-3 py-2"
        type="number"
        min="0"
        placeholder="Min €"
        value={minPrice}
        onChange={(e) => {
          setPage(1);
          setMinPrice(e.target.value);
        }}
      />
      <input
        className="border rounded px-3 py-2"
        type="number"
        min="0"
        placeholder="Max €"
        value={maxPrice}
        onChange={(e) => {
          setPage(1);
          setMaxPrice(e.target.value);
        }}
      />
      <select
        className="border rounded px-3 py-2"
        value={beds}
        onChange={(e) => {
          setPage(1);
          setBeds(e.target.value);
        }}
      >
        <option value="">Beds</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>
      <select
        className="border rounded px-3 py-2"
        value={baths}
        onChange={(e) => {
          setPage(1);
          setBaths(e.target.value);
        }}
      >
        <option value="">Baths</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
      </select>
      <select
        className="border rounded px-3 py-2"
        value={type}
        onChange={(e) => {
          setPage(1);
          setType(e.target.value);
        }}
      >
        <option value="">Type</option>
        <option value="apartment">Apartment</option>
        <option value="house">House</option>
        <option value="commercial">Commercial</option>
      </select>

      <div className="md:col-span-6 flex gap-3">
        <select
          className="border rounded px-3 py-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
        <button
          onClick={() => {
            setQuery("");
            setMinPrice("");
            setMaxPrice("");
            setBeds("");
            setBaths("");
            setType("");
            setSort("newest");
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-24 relative">
      {/* Mobile Map button */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <button
          onClick={() => navigate("/map")}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {t("mapSearch", { ns: "navbar", defaultValue: "Map" })}
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          {t("resultsFor", { defaultValue: "Results for" })} "
          {query || qs.get("query") || ""}"
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {filtered.length} results • page {currentPage}/{totalPages}
        </p>

        {FilterBar}

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t("loading") || "Loading"}…
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t("noResults") || "No results"}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pageItems.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-4">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t("previous") || "Previous"}
                </button>

                <span className="text-gray-700 dark:text-gray-300">
                  {t("pageInfo", { current: currentPage, total: totalPages }) ||
                    `Page ${currentPage} of ${totalPages}`}
                </span>

                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t("next") || "Next"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
