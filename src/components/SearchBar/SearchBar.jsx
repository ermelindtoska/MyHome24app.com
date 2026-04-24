import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiSearch } from "react-icons/hi";
import { FiMapPin, FiHome, FiKey } from "react-icons/fi";

const SearchBar = ({ placeholder = "searchPlaceholder" }) => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("buy");

  const handleSearch = () => {
    const trimmed = query.trim();
    const target = mode === "rent" ? "/rent" : "/buy";

    if (trimmed) {
      navigate(`/search?query=${encodeURIComponent(trimmed)}&purpose=${mode}`);
      return;
    }

    navigate(target);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-3 sm:px-0">
      <div className="mb-3 flex justify-center">
        <div className="inline-flex rounded-full border border-white/20 bg-black/35 p-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMode("buy")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "buy"
                ? "bg-white text-slate-900"
                : "text-white hover:bg-white/10"
            }`}
          >
            <FiHome />
            {t("searchBar.buy", { defaultValue: "Kaufen" })}
          </button>

          <button
            type="button"
            onClick={() => setMode("rent")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "rent"
                ? "bg-white text-slate-900"
                : "text-white hover:bg-white/10"
            }`}
          >
            <FiKey />
            {t("searchBar.rent", { defaultValue: "Mieten" })}
          </button>
        </div>
      </div>

      <div className="group flex flex-col overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-2xl transition focus-within:ring-4 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 sm:flex-row">
        <div className="flex flex-1 items-center">
          <div className="pl-5 text-slate-400 dark:text-slate-500">
            <FiMapPin className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(placeholder, {
              defaultValue: "Stadt, Adresse oder Region suchen",
            })}
            className="min-h-[58px] flex-1 bg-transparent px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 sm:text-lg"
            aria-label={t(placeholder, { defaultValue: "Suche" })}
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="m-2 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
          aria-label={t("searchButton", { defaultValue: "Suchen" })}
        >
          <HiSearch className="h-5 w-5" />
          <span>{t("searchButton", { defaultValue: "Suchen" })}</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(SearchBar);