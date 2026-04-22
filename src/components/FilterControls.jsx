import React from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiHome, FiTag } from "react-icons/fi";

const FilterControls = ({
  filterCity,
  setFilterCity,
  filterType,
  setFilterType,
  filterPurpose,
  setFilterPurpose,
}) => {
  const { t } = useTranslation(["filterBar", "listing", "userDashboard"]);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2">
        <FiSearch className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-100">
          {t("filterTitle", {
            ns: "filterBar",
            defaultValue: "Filter",
          })}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Stadt / Suche */}
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="autocomplete"
            type="text"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder={t("searchPlaceholder", {
              ns: "filterBar",
              defaultValue: "Suche nach Stadt, PLZ, Region oder Stichwort",
            })}
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Typ */}
        <div className="relative">
          <FiHome className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {t("allTypes", {
                ns: "userDashboard",
                defaultValue: "Alle Typen",
              })}
            </option>
            <option value="apartment">
              {t("fields.apartment", {
                ns: "userDashboard",
                defaultValue: "Wohnung",
              })}
            </option>
            <option value="house">
              {t("fields.house", {
                ns: "userDashboard",
                defaultValue: "Haus",
              })}
            </option>
            <option value="office">
              {t("typeOptions.office", {
                ns: "userDashboard",
                defaultValue: "Büro / Gewerbe",
              })}
            </option>
          </select>
        </div>

        {/* Zweck */}
        <div className="relative">
          <FiTag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {t("allPurposes", {
                ns: "userDashboard",
                defaultValue: "Alle Zwecke",
              })}
            </option>
            <option value="rent">
              {t("fields.rent", {
                ns: "userDashboard",
                defaultValue: "Mieten",
              })}
            </option>
            <option value="buy">
              {t("fields.buy", {
                ns: "userDashboard",
                defaultValue: "Kaufen",
              })}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;