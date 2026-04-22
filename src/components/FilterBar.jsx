import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiHome, FiTag, FiDollarSign } from "react-icons/fi";

const FilterBar = ({ onFilterChange }) => {
  const { t } = useTranslation(["filterBar", "listing"]);

  const [filters, setFilters] = useState({
    city: "",
    maxPrice: "",
    type: "",
    purpose: "",
  });

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        
        {/* City */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder={t("searchPlaceholder", {
              ns: "filterBar",
              defaultValue: "Stadt oder Ort suchen",
            })}
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Price */}
        <div className="relative">
          <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder={t("maxPrice", {
              ns: "filterBar",
              defaultValue: "Max. Preis",
            })}
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Type */}
        <div className="relative">
          <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {t("allTypes", {
                ns: "listing",
                defaultValue: "Alle Typen",
              })}
            </option>
            <option value="Apartment">
              {t("apartment", { ns: "listing", defaultValue: "Wohnung" })}
            </option>
            <option value="House">
              {t("house", { ns: "listing", defaultValue: "Haus" })}
            </option>
          </select>
        </div>

        {/* Purpose */}
        <div className="relative">
          <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            name="purpose"
            value={filters.purpose}
            onChange={handleChange}
            className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {t("allPurposes", {
                ns: "listing",
                defaultValue: "Alle Zwecke",
              })}
            </option>
            <option value="Rent">
              {t("rent", { ns: "listing", defaultValue: "Mieten" })}
            </option>
            <option value="Buy">
              {t("buy", { ns: "listing", defaultValue: "Kaufen" })}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;