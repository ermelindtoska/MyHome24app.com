// src/components/mobile/MobileMenu.jsx
import React, { useEffect, useState } from "react";
import { HiX, HiChevronDown } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRole } from "../../roles/RoleContext";
import LanguageSwitcher from "../LanguageSwitcher";
import { createPortal } from "react-dom";
import { toast } from "sonner";

// (opsionale) nëse e përdor te Navbar:
import { requestOrChangeRole } from "../../roles/changeRole";

export default function MobileMenu({
  onClose,
  isDark,
  toggleTheme,
  // opsionale: nëse Navbar të kalon këtë handler, ne e përdorim
  onChangeRole: onChangeRoleProp,
}) {
  const { t } = useTranslation("navbar");
  const navigate = useNavigate();

  // Nga konteksti yt ekzistues
  const { currentUser } = useAuth() ?? { currentUser: null };
  const { role: ctxRole } = useRole();
  const role = ctxRole || "user";
  const { logout } = useAuth();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
   const timer = setTimeout(() => setVisible(true), 10);
   return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
    // Triku i hartës (Mapbox/GL)
    setTimeout(() => window.dispatchEvent(new Event("resize")), 600);
  };

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  // Handler i unifikuar i ndërrimit të rolit:
  const onChangeRole = async (targetRole) => {
    try {
      if (onChangeRoleProp) {
        const ok = await onChangeRoleProp(targetRole);
        if (ok === false) {
          toast.error(t("roleChangeError", { defaultValue: "Rolle konnte nicht aktualisiert werden." }));
          return;
        }
        toast.success(t("roleUpdated", { defaultValue: "Rolle wurde aktualisiert." }));
      } else {
        const res = await requestOrChangeRole(targetRole);
        if (!res?.ok) {
          toast.error(t("roleChangeError", { defaultValue: "Rolle konnte nicht aktualisiert werden." }));
          return;
        }
        toast.success(
          res.requested
            ? t("upgradeRequested", { defaultValue: "Antrag gesendet. Die/der Admin wird es bald prüfen." })
            : t("roleUpdated", { defaultValue: "Rolle wurde aktualisiert." })
        );
      }
      onClose();
      navigate("/dashboard");
    } catch (e) {
      console.error("[MobileMenu] onChangeRole error:", e);
      toast.error(t("roleChangeError", { defaultValue: "Rolle konnte nicht aktualisiert werden." }));
    }
  };

  // ✅ Klasa të sigurta për Light/Dark për tre opsionet e rolit
  const roleItemCls =
    "w-full text-left rounded px-2 py-1 " +
    "text-gray-900 dark:text-gray-100 " +
    "hover:bg-gray-100 dark:hover:bg-gray-800";

  return createPortal(
    <div className="fixed inset-0 z-[50000] pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-[50000] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        } pointer-events-auto`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute top-0 right-0 z-[50001] w-[85%] max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        } flex flex-col overflow-y-auto pointer-events-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {t("menu", { defaultValue: "Menü" })}
          </span>
          <button
            onClick={onClose}
            className="text-2xl text-gray-800 dark:text-gray-100"
            aria-label="Schließen"
          >
            <HiX />
          </button>
        </div>

        {/* Përmbajtja */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* --- Kaufen --- */}
          <div>
            <button
              onClick={() => toggleSubmenu("buy")}
              className="w-full flex justify-between items-center px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
            >
              {t("buy")}
              <HiChevronDown className={`transition-transform ${openSubmenu === "buy" ? "rotate-180" : ""}`} />
            </button>

            {openSubmenu === "buy" && (
              <div className="ml-6 mt-1 space-y-2 text-gray-700 dark:text-gray-300">
                {/* të dyja shkojnë te /buy (si te desktop) */}
                <button onClick={() => handleNavigate("/buy")} className="block w-full text-left hover:text-blue-600">
                  {t("apartmentsForSale")}
                </button>
                <button onClick={() => handleNavigate("/buy")} className="block w-full text-left hover:text-blue-600">
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
              <HiChevronDown className={`transition-transform ${openSubmenu === "rent" ? "rotate-180" : ""}`} />
            </button>

            {openSubmenu === "rent" && (
              <div className="ml-6 mt-1 space-y-2 text-gray-700 dark:text-gray-300">
                {/* të dyja shkojnë te /rent (si te desktop) */}
                <button onClick={() => handleNavigate("/rent")} className="block w-full text-left hover:text-blue-600">
                  {t("apartmentsForRent")}
                </button>
                <button onClick={() => handleNavigate("/rent")} className="block w-full text-left hover:text-blue-600">
                  {t("housesForRent")}
                </button>
              </div>
            )}
          </div>

          {/* --- Finanzieren / Makler:innen --- */}
           <button
              onClick={() => handleNavigate("/mortgage")}
              className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
            >
              {t("mortgage")}
            </button>

          <button
            onClick={() => handleNavigate("/agents")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("findAgent")}
          </button>
          <button
          onClick={() => handleNavigate("/how-it-works")}
          className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
        >
          {t("guide", { defaultValue: "Ratgeber" })}
        </button>

          

          <button
            onClick={() => handleNavigate("/map")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("map")}
          </button>

          <button
            onClick={() => handleNavigate("/compare")}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            {t("compare")}
          </button>

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

             <button onClick={() => handleNavigate("/owner-dashboard")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100">
              {t("myListings", { defaultValue: "Meine Immobilien" })}
            </button>

              {["owner", "agent"].includes(role) && (
                <>
                  <button
                    onClick={() => handleNavigate("/publish")}
                    className="block w-full text-left px-4 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-300"
                  >
                    ➕ {t("publishProperty")}
                  </button>
                 
                </>
              )}

              {/* --- ROLLE WECHSELN (JASHTË butonit “Profil”) --- */}
              <div className="mt-2 px-4 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("switchRole", { defaultValue: "Rolle wechseln" })}
              </div>
              <div className="px-4 py-2 space-y-2">
                {/* ✅ Këto tre janë ndryshuar vetëm për ngjyrat Light/Dark */}
                <button onClick={() => onChangeRole("user")} className={roleItemCls}>
                  {t("user", { defaultValue: "Benutzer:in" })}
                </button>
                <button onClick={() => onChangeRole("owner")} className={roleItemCls}>
                  {t("owner", { defaultValue: "Eigentümer:in" })}
                </button>
                <button onClick={() => onChangeRole("agent")} className={roleItemCls}>
                  {t("agent", { defaultValue: "Makler:in" })}
                </button>
              </div>

              <button
                onClick={() => handleNavigate("/settings")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {t("settings")}
              </button>

              <button
                onClick={async () => {
                  try {
                    await logout();
                    onClose();
                    navigate("/"); // oder /login – wie du magst
                  } catch (e) {
                    console.error(e);
                  }
                }}
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
