import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiHome, FiSearch, FiRotateCcw } from "react-icons/fi";

const HeroSearch = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query.trim()
          )}&countrycodes=de&addressdetails=1&limit=5`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "de,en;q=0.8",
            },
          }
        );

        if (!res.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];

        setSuggestions(safeData);
        setShowSuggestions(safeData.length > 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[HeroSearch] Suggestion error:", err);
        }
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSuggestionClick = (item) => {
    const label = item?.display_name || "";
    setQuery(label);
    setShowSuggestions(false);

    const params = new URLSearchParams();
    if (label) params.set("query", label);
    if (propertyType !== "all") params.set("type", propertyType);
    if (priceMin) params.set("minPrice", priceMin);
    if (priceMax) params.set("maxPrice", priceMax);
    if (sizeMin) params.set("sizeMin", sizeMin);
    if (sizeMax) params.set("sizeMax", sizeMax);

    navigate(`/search?${params.toString()}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) params.set("query", query.trim());
    if (propertyType !== "all") params.set("type", propertyType);
    if (priceMin) params.set("minPrice", priceMin);
    if (priceMax) params.set("maxPrice", priceMax);
    if (sizeMin) params.set("sizeMin", sizeMin);
    if (sizeMax) params.set("sizeMax", sizeMax);

    navigate(`/search?${params.toString()}`);
  };

  const clearAll = () => {
    setQuery("");
    setPropertyType("all");
    setPriceMin("");
    setPriceMax("");
    setSizeMin("");
    setSizeMax("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      query || propertyType !== "all" || priceMin || priceMax || sizeMin || sizeMax
    );
  }, [query, propertyType, priceMin, priceMax, sizeMin, sizeMax]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" ref={wrapperRef}>
      {/* Location Search */}
      <div className="relative">
        <label className="mb-2 block text-sm font-medium text-white/90">
          {t("searchLocation", { defaultValue: "Ort, Adresse oder Region" })}
        </label>

        <div className="relative">
          <FiMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
          <input
            type="text"
            placeholder={t("searchLocation", { defaultValue: "Ort, Adresse oder Region" })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="w-full rounded-2xl border border-white/25 bg-white/15 py-3 pl-11 pr-4 text-white placeholder-white/70 backdrop-blur-md outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
          />
        </div>

        {showSuggestions && (
          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {loadingSuggestions ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {t("loadingSuggestions", { defaultValue: "Vorschläge werden geladen…" })}
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="max-h-72 overflow-auto">
                {suggestions.map((item, idx) => (
                  <li
                    key={`${item.place_id || idx}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(item);
                    }}
                    className="cursor-pointer px-4 py-3 text-sm text-gray-800 transition hover:bg-gray-100"
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                {t("noSuggestions", { defaultValue: "Keine Vorschläge gefunden." })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">
            {t("propertyType", { defaultValue: "Immobilientyp" })}
          </label>
          <div className="relative">
            <FiHome className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/25 bg-white/15 py-3 pl-11 pr-4 text-white backdrop-blur-md outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="text-gray-900">
                {t("allTypes", { defaultValue: "Alle Typen" })}
              </option>
              <option value="apartment" className="text-gray-900">
                {t("apartment", { defaultValue: "Wohnung" })}
              </option>
              <option value="house" className="text-gray-900">
                {t("house", { defaultValue: "Haus" })}
              </option>
              <option value="office" className="text-gray-900">
                {t("office", { defaultValue: "Büro" })}
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/90">
              {t("minPrice", { defaultValue: "Min. Preis" })}
            </label>
            <input
              type="number"
              min="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder={t("minPrice", { defaultValue: "Min. Preis" })}
              className="w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white placeholder-white/70 backdrop-blur-md outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/90">
              {t("maxPrice", { defaultValue: "Max. Preis" })}
            </label>
            <input
              type="number"
              min="0"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder={t("maxPrice", { defaultValue: "Max. Preis" })}
              className="w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white placeholder-white/70 backdrop-blur-md outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">
            {t("minSize", { defaultValue: "Min. Fläche" })}
          </label>
          <input
            type="number"
            min="0"
            value={sizeMin}
            onChange={(e) => setSizeMin(e.target.value)}
            placeholder={t("minSize", { defaultValue: "Min. Fläche" })}
            className="w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white placeholder-white/70 backdrop-blur-md outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">
            {t("maxSize", { defaultValue: "Max. Fläche" })}
          </label>
          <input
            type="number"
            min="0"
            value={sizeMax}
            onChange={(e) => setSizeMax(e.target.value)}
            placeholder={t("maxSize", { defaultValue: "Max. Fläche" })}
            className="w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white placeholder-white/70 backdrop-blur-md outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRotateCcw />
          {t("clear", { defaultValue: "Zurücksetzen" })}
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-gray-100"
        >
          <FiSearch />
          {t("search", { defaultValue: "Suchen" })}
        </button>
      </div>
    </form>
  );
};

export default HeroSearch;