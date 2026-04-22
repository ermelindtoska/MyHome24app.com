import React, { useEffect, useMemo, useState } from "react";
import {
  HiX,
  HiChevronDown,
  HiHome,
  HiOfficeBuilding,
  HiCurrencyEuro,
  HiUserGroup,
  HiMap,
  HiScale,
  HiPhone,
  HiUser,
  HiCog,
  HiLogout,
  HiShieldCheck,
  HiSparkles,
} from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRole } from "../../roles/RoleContext";
import LanguageSwitcher from "../LanguageSwitcher";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { requestOrChangeRole } from "../../roles/changeRole";

export default function MobileMenu({
  onClose,
  isDark,
  toggleTheme,
  onChangeRole: onChangeRoleProp,
}) {
  const { t } = useTranslation("navbar");
  const navigate = useNavigate();

  const authCtx = useAuth() ?? {};
  const { currentUser, logout } = authCtx;

  const { role: ctxRole } = useRole();
  const role = ctxRole || "user";

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(enterTimer);
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 220);
  };

  const handleNavigate = (path) => {
    handleClose();
    setTimeout(() => {
      navigate(path);
      setTimeout(() => window.dispatchEvent(new Event("resize")), 450);
    }, 220);
  };

  const toggleSubmenu = (menu) => {
    setOpenSubmenu((prev) => (prev === menu ? null : menu));
  };

  const onChangeRole = async (targetRole) => {
    try {
      if (onChangeRoleProp) {
        const ok = await onChangeRoleProp(targetRole);
        if (ok === false) {
          toast.error(
            t("roleChangeError", {
              defaultValue: "Rolle konnte nicht aktualisiert werden.",
            })
          );
          return;
        }
        toast.success(
          t("roleUpdated", {
            defaultValue: "Rolle wurde aktualisiert.",
          })
        );
      } else {
        const res = await requestOrChangeRole(targetRole);
        if (!res?.ok) {
          toast.error(
            t("roleChangeError", {
              defaultValue: "Rolle konnte nicht aktualisiert werden.",
            })
          );
          return;
        }

        toast.success(
          res.requested
            ? t("upgradeRequested", {
                defaultValue:
                  "Antrag gesendet. Die/der Admin wird es bald prüfen.",
              })
            : t("roleUpdated", {
                defaultValue: "Rolle wurde aktualisiert.",
              })
        );
      }

      handleClose();
      setTimeout(() => navigate("/dashboard"), 220);
    } catch (e) {
      console.error("[MobileMenu] onChangeRole error:", e);
      toast.error(
        t("roleChangeError", {
          defaultValue: "Rolle konnte nicht aktualisiert werden.",
        })
      );
    }
  };

  const roleItemCls =
    "w-full rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition " +
    "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800";

  const panelBase =
    "rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm " +
    "dark:border-gray-700 dark:bg-gray-900/80";

  const menuButtonBase =
    "w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition " +
    "text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800";

  const simpleLinkBase =
    "w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition " +
    "text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800";

  const userName = useMemo(() => {
    return (
      currentUser?.displayName ||
      currentUser?.email ||
      t("account", { defaultValue: "Mein Konto" })
    );
  }, [currentUser, t]);

  return createPortal(
    <div className="fixed inset-0 z-[50000]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("close", { defaultValue: "Schließen" })}
        className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("menu", { defaultValue: "Menü" })}
        className={`
          absolute right-0 top-0 h-full w-[88%] max-w-[390px]
          transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-200
          dark:border-gray-700 dark:bg-gray-950
          ${visible ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 pb-4 pt-2 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                  {t("menu", { defaultValue: "Menü" })}
                </div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  MyHome24App
                </div>
              </div>

              <button
                onClick={handleClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label={t("close", { defaultValue: "Schließen" })}
              >
                <HiX className="text-2xl" />
              </button>
            </div>

            {currentUser ? (
              <div className={`mt-4 p-3 ${panelBase}`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <HiUser className="text-xl" />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {userName}
                    </div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {role === "admin"
                        ? t("admin", { defaultValue: "Admin" })
                        : role === "owner"
                        ? t("owner", { defaultValue: "Eigentümer:in" })
                        : role === "agent"
                        ? t("agent", { defaultValue: "Makler:in" })
                        : t("user", { defaultValue: "Benutzer:in" })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Scroll content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {/* Discover */}
              <section className={panelBase}>
                <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  {t("discover", { defaultValue: "Entdecken" })}
                </div>

                <div className="px-2 pb-3">
                  {/* Buy */}
                  <div>
                    <button
                      onClick={() => toggleSubmenu("buy")}
                      className={menuButtonBase}
                    >
                      <span className="flex items-center gap-3">
                        <HiHome className="text-lg text-blue-600 dark:text-blue-400" />
                        {t("buy")}
                      </span>
                      <HiChevronDown
                        className={`text-xl text-gray-400 transition-transform ${
                          openSubmenu === "buy" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openSubmenu === "buy" && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-4 dark:border-gray-700">
                        <button
                          onClick={() => handleNavigate("/buy")}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          {t("apartmentsForSale")}
                        </button>
                        <button
                          onClick={() => handleNavigate("/buy")}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          {t("housesForSale")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rent */}
                  <div>
                    <button
                      onClick={() => toggleSubmenu("rent")}
                      className={menuButtonBase}
                    >
                      <span className="flex items-center gap-3">
                        <HiOfficeBuilding className="text-lg text-blue-600 dark:text-blue-400" />
                        {t("rent")}
                      </span>
                      <HiChevronDown
                        className={`text-xl text-gray-400 transition-transform ${
                          openSubmenu === "rent" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openSubmenu === "rent" && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-4 dark:border-gray-700">
                        <button
                          onClick={() => handleNavigate("/rent")}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          {t("apartmentsForRent")}
                        </button>
                        <button
                          onClick={() => handleNavigate("/rent")}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          {t("housesForRent")}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavigate("/mortgage")}
                    className={simpleLinkBase}
                  >
                    <HiCurrencyEuro className="text-lg text-blue-600 dark:text-blue-400" />
                    {t("mortgage")}
                  </button>

                  <button
                    onClick={() => handleNavigate("/agents")}
                    className={simpleLinkBase}
                  >
                    <HiUserGroup className="text-lg text-blue-600 dark:text-blue-400" />
                    {t("findAgent")}
                  </button>

                  <button
                    onClick={() => handleNavigate("/how-it-works")}
                    className={simpleLinkBase}
                  >
                    <HiSparkles className="text-lg text-blue-600 dark:text-blue-400" />
                    {t("guide", { defaultValue: "Ratgeber" })}
                  </button>

                  <button
                    onClick={() => handleNavigate("/map")}
                    className={simpleLinkBase}
                  >
                    <HiMap className="text-lg text-blue-600 dark:text-blue-400" />
                    {t("map")}
                  </button>

                  <button
                    onClick={() => handleNavigate("/compare")}
                    className={simpleLinkBase}
                  >
                    <HiScale className="text-lg text-blue-600 dark:text-blue-400" />
                    {t("compare")}
                  </button>

                  <button
                    onClick={() => handleNavigate("/contact")}
                    className={simpleLinkBase}
                  >
                    <HiPhone className="text-lg text-blue-600 dark:text-blue-400" />
                    {t("contact")}
                  </button>
                </div>
              </section>

              {/* Account */}
              {!currentUser ? (
                <section className={panelBase}>
                  <div className="p-3 space-y-3">
                    <button
                      onClick={() => handleNavigate("/login")}
                      className="w-full rounded-2xl border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      {t("login")}
                    </button>

                    <button
                      onClick={() => handleNavigate("/register")}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {t("register")}
                    </button>
                  </div>
                </section>
              ) : (
                <>
                  <section className={panelBase}>
                    <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                      {t("account", { defaultValue: "Konto" })}
                    </div>

                    <div className="px-2 pb-3">
                      <button
                        onClick={() => handleNavigate("/profile")}
                        className={simpleLinkBase}
                      >
                        <HiUser className="text-lg text-gray-500 dark:text-gray-400" />
                        {t("profile")}
                      </button>

                      {role === "admin" && (
                        <button
                          onClick={() => handleNavigate("/admin-dashboard")}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-amber-700 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20"
                        >
                          <HiShieldCheck className="text-lg" />
                          {t("adminDashboard", {
                            defaultValue: "Admin-Dashboard",
                          })}
                        </button>
                      )}

                      <button
                        onClick={() => handleNavigate("/owner-dashboard")}
                        className={simpleLinkBase}
                      >
                        <HiOfficeBuilding className="text-lg text-gray-500 dark:text-gray-400" />
                        {t("myListings", { defaultValue: "Meine Immobilien" })}
                      </button>

                      {["owner", "agent"].includes(role) && (
                        <button
                          onClick={() => handleNavigate("/publish")}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                        >
                          <HiSparkles className="text-lg" />
                          {t("publishProperty")}
                        </button>
                      )}

                      <button
                        onClick={() => handleNavigate("/settings")}
                        className={simpleLinkBase}
                      >
                        <HiCog className="text-lg text-gray-500 dark:text-gray-400" />
                        {t("settings")}
                      </button>
                    </div>
                  </section>

                  {/* Switch Role */}
                  <section className={panelBase}>
                    <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                      {t("switchRole", { defaultValue: "Rolle wechseln" })}
                    </div>

                    <div className="space-y-2 px-3 pb-3">
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
                  </section>

                  {/* Logout */}
                  <section className={panelBase}>
                    <div className="p-3">
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            handleClose();
                            setTimeout(() => navigate("/"), 220);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                      >
                        <HiLogout className="text-lg" />
                        {t("logout")}
                      </button>
                    </div>
                  </section>
                </>
              )}

              {/* Language + Theme */}
              <section className={panelBase}>
                <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  {t("preferences", { defaultValue: "Einstellungen" })}
                </div>

                <div className="space-y-3 px-3 pb-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                    <LanguageSwitcher />
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
                    <span>{isDark ? "Light" : "Dark"}</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}