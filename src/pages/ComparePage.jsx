// src/pages/ComparePage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  FaFilter, FaCopy, FaSync, FaMoon, FaTrash, FaSun
} from "react-icons/fa";

import logo from "../assets/logo.png";
import SiteMeta from "../components/SEO/SiteMeta";
import { useTranslation } from "react-i18next";

// utils
import { formatPrice } from "../utils/compareUtils";

const ComparePage = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation("compare");

  // ✅ SEO meta (me string, jo me key)
  const title = t("metaTitle", {
    defaultValue: "Immobilienvergleich – MyHome24App",
  });
  const description = t("metaDescription", {
    defaultValue:
      "Vergleiche bis zu 3 Immobilien nebeneinander: Preis, Fläche, Bewertung dhe më shumë – si te Zillow, lokalizuar për DE.",
  });

  const [listings, setListings] = useState(() => {
    const stored = localStorage.getItem("compareListings");
    return stored ? JSON.parse(stored) : location.state?.listings || [];
  });

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [minSizeFilter, setMinSizeFilter] = useState("");
  const [maxSizeFilter, setMaxSizeFilter] = useState("");
  const [copiedText, setCopiedText] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("compareListings", JSON.stringify(listings));
  }, [listings]);

  const resetFilters = () => {
    setCityFilter("");
    setMaxPriceFilter("");
    setMinRatingFilter("");
    setMinSizeFilter("");
    setMaxSizeFilter("");
  };

  const refreshData = () => {
    const reloaded = localStorage.getItem("compareListings");
    if (reloaded) setListings(JSON.parse(reloaded));
  };

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const clearAllListings = () => {
    setListings([]);
    localStorage.removeItem("compareListings");
  };

  const copySummary = () => {
    const summary = listings
      .map((item) => `${item.title} - ${item.city} - ${formatPrice(item.price)}€`)
      .join("\n");
    navigator.clipboard.writeText(summary);
    setCopiedText(t("copied"));
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredListings = listings.filter((item) => {
    const matchesCity = cityFilter
      ? item.city?.toLowerCase().includes(cityFilter.toLowerCase())
      : true;
    const matchesPrice = maxPriceFilter
      ? Number(item.price) <= Number(maxPriceFilter)
      : true;
    const matchesRating = minRatingFilter
      ? (Number(item.avgRating) || 0) >= Number(minRatingFilter)
      : true;
    const matchesMinSize = minSizeFilter
      ? Number(item.size) >= Number(minSizeFilter)
      : true;
    const matchesMaxSize = maxSizeFilter
      ? Number(item.size) <= Number(maxSizeFilter)
      : true;

    return (
      matchesCity &&
      matchesPrice &&
      matchesRating &&
      matchesMinSize &&
      matchesMaxSize
    );
  });

  const chartData = filteredListings.map((item) => ({
    name: item.title,
    Preis: Number(item.price) || 0,
    Bewertung: Number(item.avgRating) || 0,
    Fläche: Number(item.size) || 0,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen pt-20 px-4 print:px-0`}
    >
      {/* ✅ SEO për këtë faqe */}
      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}/compare`}
        ogImage={`${window.location.origin}/og/og-compare.jpg`}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow text-sm text-gray-700 dark:text-gray-200 py-2 px-4 flex items-center gap-2 print:hidden transition-all duration-300 ease-in-out">
        <img src={logo} alt="MyHome24App Logo" className="h-6" />
        <span>{t("home")} / {t("title")}</span>

        <button
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto"
        >
          <FaFilter /> {t("actions.toggleFilters")}
        </button>

        <button
          onClick={copySummary}
          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 transition duration-200"
        >
          <FaCopy /> {t("actions.copy")}
        </button>

        {copiedText && <span className="text-green-500 ml-2">{copiedText}</span>}
      </nav>

      {filtersVisible && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-md print:hidden mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder={t("filters.city")}
              className="border px-3 py-2 rounded w-40 hover:border-blue-500"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <input
              type="number"
              placeholder={t("filters.price")}
              className="border px-3 py-2 rounded w-40 hover:border-blue-500"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
            />
            <input
              type="number"
              placeholder={t("filters.rooms")}
              className="border px-3 py-2 rounded w-40 hover:border-blue-500"
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(e.target.value)}
            />
            <input
              type="number"
              placeholder={t("filters.size")}
              className="border px-3 py-2 rounded w-40 hover:border-blue-500"
              value={minSizeFilter}
              onChange={(e) => setMinSizeFilter(e.target.value)}
            />
            <input
              type="number"
              placeholder={t("filters.size")}
              className="border px-3 py-2 rounded w-40 hover:border-blue-500"
              value={maxSizeFilter}
              onChange={(e) => setMaxSizeFilter(e.target.value)}
            />

            <button
              className="text-blue-600 hover:text-blue-800 underline transition duration-200"
              onClick={resetFilters}
            >
              {t("actions.resetFilters")}
            </button>

            <button
              onClick={refreshData}
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 transition duration-200"
            >
              <FaSync /> {t("actions.refresh")}
            </button>

            <button
              onClick={toggleDarkMode}
              className="text-yellow-600 hover:text-yellow-400 underline flex items-center gap-1 transition duration-200"
            >
              {darkMode ? <FaSun /> : <FaMoon />}{" "}
              {darkMode ? t("actions.lightMode") : t("actions.darkMode")}
            </button>

            <button
              onClick={clearAllListings}
              className="text-red-600 hover:text-red-800 underline flex items-center gap-1 transition duration-200"
            >
              <FaTrash /> {t("actions.clearAll")}
            </button>
          </div>
        </div>
      )}

      {filteredListings.length === 0 ? (
        <p className="text-center text-gray-500">{t("noData")}</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded mb-8">
          <h3 className="text-lg font-semibold mb-4">{t("chartTitle")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="Preis" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="Bewertung" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <h3 className="text-lg font-semibold mt-10 mb-4">{t("lineChart")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Fläche" stroke="#8884d8" />
              <Line type="monotone" dataKey="Preis" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>

          <h3 className="text-lg font-semibold mt-10 mb-4">{t("pieChart")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="Fläche"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
