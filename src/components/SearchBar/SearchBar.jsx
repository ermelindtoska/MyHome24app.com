import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiSearch } from "react-icons/hi";
import { FiMapPin } from "react-icons/fi";

const SearchBar = ({ placeholder = "searchPlaceholder" }) => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-0">
      <div
        className="
          group flex items-center overflow-hidden rounded-full
          border border-gray-300 bg-white shadow-sm transition
          focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10
          dark:border-slate-700 dark:bg-slate-900
        "
      >
        {/* Left Icon */}
        <div className="hidden pl-4 text-gray-400 sm:flex dark:text-slate-500">
          <FiMapPin className="h-5 w-5" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(placeholder, { defaultValue: "Stadt, Adresse oder Region suchen" })}
          className="
            flex-1 bg-transparent px-4 py-3.5 text-base text-gray-900 outline-none
            placeholder:text-gray-500 dark:text-white dark:placeholder:text-slate-400
            sm:text-lg
          "
          aria-label={t(placeholder, { defaultValue: "Suche" })}
        />

        {/* Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="
            inline-flex items-center justify-center gap-2
            rounded-full bg-blue-600 px-5 py-3 text-white transition
            hover:bg-blue-700 active:scale-[0.98]
            m-1.5 min-w-[52px]
          "
          aria-label={t("searchButton", { defaultValue: "Suchen" })}
          title={t("searchButton", { defaultValue: "Suchen" })}
        >
          <HiSearch className="h-5 w-5" />
          <span className="hidden text-sm font-semibold sm:inline">
            {t("searchButton", { defaultValue: "Suchen" })}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;