import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiMenu, FiX, FiGlobe } from "react-icons/fi";

const Header = () => {
  const { t, i18n } = useTranslation("header");
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-extrabold tracking-tight text-blue-600 dark:text-blue-400"
        >
          MyHome24App
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 dark:text-slate-200 md:flex">
          <Link to="/buy" className="hover:text-blue-600">
            {t("nav.buy")}
          </Link>
          <Link to="/rent" className="hover:text-blue-600">
            {t("nav.rent")}
          </Link>
          <Link to="/mortgage" className="hover:text-blue-600">
            {t("nav.mortgage")}
          </Link>
          <Link to="/agents" className="hover:text-blue-600">
            {t("nav.findAgent")}
          </Link>
          <Link to="/compare" className="hover:text-blue-600">
            {t("nav.compare")}
          </Link>
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
            <FiGlobe />
            <button
              onClick={() => changeLanguage("de")}
              className={`font-medium ${
                i18n.language === "de"
                  ? "text-blue-600"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              DE
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => changeLanguage("en")}
              className={`font-medium ${
                i18n.language === "en"
                  ? "text-blue-600"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              EN
            </button>
          </div>

          {/* Login */}
          <Link
            to="/login"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t("nav.login")}
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="text-2xl text-slate-700 dark:text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link to="/buy" onClick={() => setMenuOpen(false)}>
              {t("nav.buy")}
            </Link>
            <Link to="/rent" onClick={() => setMenuOpen(false)}>
              {t("nav.rent")}
            </Link>
            <Link to="/mortgage" onClick={() => setMenuOpen(false)}>
              {t("nav.mortgage")}
            </Link>
            <Link to="/agents" onClick={() => setMenuOpen(false)}>
              {t("nav.findAgent")}
            </Link>
            <Link to="/compare" onClick={() => setMenuOpen(false)}>
              {t("nav.compare")}
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => changeLanguage("de")}
                className="rounded-full border px-3 py-1 text-sm dark:border-slate-700"
              >
                DE
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className="rounded-full border px-3 py-1 text-sm dark:border-slate-700"
              >
                EN
              </button>
            </div>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-4 inline-flex justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {t("nav.login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default React.memo(Header);