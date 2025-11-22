// src/components/HeroSearch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

  // Debounced suggestions nga Nominatim për Gjermani
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=de&addressdetails=1&limit=5`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "de,en;q=0.8",
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching suggestions:", err);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSuggestionClick = (item) => {
    setQuery(item.display_name);
    setShowSuggestions(false);
    navigate(
      `/search?query=${encodeURIComponent(item.display_name)}`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) params.append("query", query.trim());
    if (propertyType !== "all") params.append("type", propertyType);
    if (priceMin) params.append("priceMin", priceMin);
    if (priceMax) params.append("priceMax", priceMax);
    if (sizeMin) params.append("sizeMin", sizeMin);
    if (sizeMax) params.append("sizeMax", sizeMax);

    navigate(`/search?${params.toString()}`);
  };

  const clearAll = () => {
    setQuery("");
    setPropertyType("all");
    setPriceMin("");
    setPriceMax("");
    setSizeMin("");
    setSizeMax("");
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    if (query === "") {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [query]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search Input with Autocomplete */}
      <div className="relative">
        <input
          type="text"
          placeholder={t("searchLocation")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() =>
            setTimeout(() => setShowSuggestions(false), 200)
          }
          className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-auto">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(item);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800"
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Property Type */}
      <div className="flex flex-wrap gap-2">
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="all">{t("allTypes")}</option>
          <option value="apartment">{t("apartment")}</option>
          <option value="house">{t("house")}</option>
          <option value="office">{t("office")}</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder={t("minPrice")}
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <input
          type="number"
          placeholder={t("maxPrice")}
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>

      {/* Size Range */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder={t("minSize")}
          value={sizeMin}
          onChange={(e) => setSizeMin(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <input
          type="number"
          placeholder={t("maxSize")}
          value={sizeMax}
          onChange={(e) => setSizeMax(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={clearAll}
          className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-400 rounded-lg transition"
        >
          {t("clear")}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-white text-blue-700 hover:bg-gray-100 rounded-lg font-medium transition"
        >
          {t("search")}
        </button>
      </div>
    </form>
  );
};

export default HeroSearch;
