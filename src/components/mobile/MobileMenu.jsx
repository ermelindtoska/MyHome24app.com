import React, { useEffect, useState } from "react";
import { HiX, HiChevronDown } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRole } from "../../roles/RoleContext";
import LanguageSwitcher from "../LanguageSwitcher";
import { createPortal } from "react-dom";

export default function MobileMenu({ onClose, isDark, toggleTheme }) {
  const { t } = useTranslation("navbar");
  const navigate = useNavigate();
  const { currentUser } = useAuth() ?? { currentUser: null };
  const { role } = useRole();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);

    // ngrij scroll-in e faqes
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const scrollY = window.scrollY;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;

    return () => {
      clearTimeout(timer);
      body.style.overflow = prevOverflow || "";
      body.style.position = prevPosition || "";
      body.style.top = prevTop || "";
      window.scrollTo(0, scrollY);
    };
  }, []);

 const handleNavigate = (path) => {
  onClose();
  navigate(path);
  // Truko e vogël për Mapbox: vonesë dhe resize
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 600); // mjafton 0.6s për animacionin e drawer-it
};


  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999999]">
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* drawer */}
      <aside
        className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        } flex flex-col overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {t("menu") || "Menü"}
          </span>
          <button
            onClick={onClose}
            className="text-2xl text-gray-800 dark:text-gray-100"
          >
            <HiX />
          </button>
        </div>

        {/* Përmbajtja e menusë */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">

          {/* --- Kaufen --- */}
          <div>
            <button
              onClick={() => toggleSubmenu("buy")}
              className="w-full flex justify-between items-center px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
            >
              {t("buy")}
              <HiChevronDown
                className={`transition-transform ${
                  openSubmenu === "buy" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSubmenu === "buy" && (
              <div className="ml-6 mt-1 space-y-2 text-gray-700 dark:text-gray-300">
                <button onClick={() => handleNavigate("/buy/wohnung-verkauf")} className="block w-full text-left hover:text-blue-600">
                  {t("apartmentsForSale")}
                </button>
                <button onClick={() => handleNavigate("/buy/haus-verkauf")} className="block w-full text-left hover:text-blue-600">
                  {t("housesForSale")}
                </button>
              </div>
            )}
          </div>

          {/* --- Mieten --- */}
          <div>
            <button
              onClick={() => toggleSubmenu("rent")}
              className="w-full flex justify-between items-center px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
            >
              {t("rent")}
              <HiChevronDown
                className={`transition-transform ${
                  openSubmenu === "rent" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSubmenu === "rent" && (
              <div className="ml-6 mt-1 space-y-2 text-gray-700 dark:text-gray-300">
                <button onClick={() => handleNavigate("/rent/wohnung-miete")} className="block w-full text-left hover:text-blue-600">
                  {t("apartmentsForRent")}
                </button>
                <button onClick={() => handleNavigate("/rent/haus-miete")} className="block w-full text-left hover:text-blue-600">
                  {t("housesForRent")}
                </button>
              </div>
            )}
          </div>

          {/* --- Finanzieren --- */}
          <button
            onClick={() => handleNavigate("/mortgage")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("mortgage")}
          </button>

          {/* --- Makler:innen finden --- */}
          <button
            onClick={() => handleNavigate("/agents")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("findAgent")}
          </button>

          {/* --- Blog --- */}
          <button
            onClick={() => handleNavigate("/blog")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("blog")}
          </button>

          {/* --- Karte --- */}
          <button
            onClick={() => handleNavigate("/map")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("map")}
          </button>

          {/* --- Vergleichen --- */}
          <button
            onClick={() => handleNavigate("/compare")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("compare")}
          </button>

          {/* --- Kontakt --- */}
          <button
            onClick={() => handleNavigate("/contact")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("contact")}
          </button>

          {/* --- User Section --- */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

          {!currentUser ? (
            <>
              <button
                onClick={() => handleNavigate("/login")}
                className="w-full text-center px-4 py-2 rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                {t("login")}
              </button>
              <button
                onClick={() => handleNavigate("/register")}
                className="w-full text-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {t("register")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate("/profile")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {t("profile")}
              </button>

              <button
                onClick={() => handleNavigate("/dashboard")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {t("dashboard")}
              </button>

              {["owner", "agent"].includes(role) && (
                <>
                  <button
                    onClick={() => handleNavigate("/publish")}
                    className="block w-full text-left px-4 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-300"
                  >
                    ➕ {t("publishProperty")}
                  </button>
                  <button
                    onClick={() => handleNavigate("/my-listings")}
                    className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                  >
                    {t("myListings")}
                  </button>
                </>
              )}

              <button
                onClick={() => handleNavigate("/settings")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {t("settings")}
              </button>

              <button
                onClick={() => handleNavigate("/logout")}
                className="block w-full text-left px-4 py-2 rounded text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t("logout")}
              </button>
            </>
          )}

          {/* --- Language + Theme --- */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
            <span>{isDark ? "Light" : "Dark"}</span>
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
