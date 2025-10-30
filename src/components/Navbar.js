import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiMenu } from "react-icons/hi";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "../assets/logo.png";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../roles/RoleContext";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import MobileMenu from "./mobile/MobileMenu";

const Navbar = () => {
  const { t } = useTranslation("navbar");
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, loading: loadingAuth } =
    useAuth() ?? { currentUser: null, loading: true };

  // Role Context: jetzt inklusive setRoleLocal
  const { role, setRoleLocal } = useRole();
  const effectiveRole = role || "user";

  // Body lock, wenn Mobile-Drawer offen ist
  useEffect(() => {
    const body = document.body;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
    };
    if (mobileOpen) {
      const scrollY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = prev.overflow || "";
        body.style.position = prev.position || "";
        const prevTop = prev.top || "";
        body.style.top = prevTop;
        body.style.left = prev.left || "";
        body.style.right = prev.right || "";
        const y = parseInt((prevTop || "0").replace("-", "")) || scrollY;
        window.scrollTo(0, y);
      };
    } else {
      body.style.overflow = prev.overflow || "";
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // <<< WICHTIG: Rollenwechsel — schreibt in users & roles, updatet Context & navigiert
  const handleChangeRole = async (newRole) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    try {
      await Promise.all([
        setDoc(
          doc(db, "users", uid),
          { role: newRole, roleUpdatedAt: serverTimestamp() },
          { merge: true }
        ),
        setDoc(
          doc(db, "roles", uid),
          {
            role: newRole,
            email: currentUser.email || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
      ]);

      // sofort im UI / Guards sichtbar
      setRoleLocal(newRole);

      setAccountOpen(false);

      // optional: direkt ins Dashboard
      navigate("/dashboard");
    } catch (e) {
      console.error("Error updating role:", e);
      alert("Rolle konnte nicht aktualisiert werden. Bitte erneut versuchen.");
    }
  };

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 300);
  };

  useEffect(() => {
    setOpenMenu(null);
    setAccountOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  const leftMenus = [
    {
      title: t("buy"),
      to: "/buy",
      items: [
        { label: t("newConstruction"), to: "/new-construction" },
        { label: t("foreclosures"), to: "/buy/foreclosures" },
        { label: t("directFromOwner"), to: "/buy/owner" },
      ],
    },
    {
      title: t("rent"),
      to: "/rent",
      items: [
        { label: t("apartment"), to: "/rent/apartment" },
        { label: t("house"), to: "/rent/house" },
        { label: t("officeCommercial"), to: "/rent/office" },
      ],
    },
    {
      title: t("mortgage"),
      to: "/mortgage",
      items: [
        { label: t("calculator"), to: "/mortgage/calculator" },
        { label: t("bankPartners"), to: "/mortgage/partners" },
      ],
    },
    {
      title: t("findAgent"),
      to: "/agents",
      items: [
        { label: t("agentSearch"), to: "/agent/search" },
        { label: t("rateAgent"), to: "/agent/rate" },
      ],
    },
  ];

  const rightMenus = [
    {
      title: t("manage"),
      items: [
        { label: t("myProperties"), to: "/manage/properties" },
        { label: t("newListing"), to: "/manage/add" },
      ],
    },
    {
      title: t("advertise"),
      items: [
        { label: t("bannerAds"), to: "/advertise/banner" },
        { label: t("premiumListing"), to: "/advertise/premium" },
      ],
    },
    {
      title: t("help"),
      items: [
        { label: t("support"), to: "/support" },
        { label: t("howItWorks"), to: "/how-it-works" },
      ],
    },
  ];

  const renderDropdown = (menu, index, align = "left") => (
    <div
      key={index}
      className="relative group"
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={menu.to}
        className="relative cursor-pointer px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
        aria-haspopup="true"
        aria-expanded={openMenu === index}
        onClick={() => setOpenMenu(null)}
      >
        {menu.title}
      </a>

      {menu.items && openMenu === index && (
        <div
          className={`absolute ${align}-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-[2100]`}
        >
          {menu.items.map((item, idx) => (
            <a
              key={idx}
              href={item.to}
              onClick={() => setOpenMenu(null)}
              className="w-full text-left block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const roleText =
    ({ user: t("user"), owner: t("owner"), agent: t("agent") }[effectiveRole]) ||
    effectiveRole;

  return (
    <header className="sticky top-0 z-[2000] bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow">
      {/* DESKTOP */}
      <nav className="hidden md:flex justify-between items-center px-6 py-4 w-full">
        <div className="flex gap-12 text-sm font-medium text-gray-900 dark:text-gray-100">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, "left"))}
        </div>

        <a href="/" className="flex items-center gap-4 focus:outline-none">
          <img src={logo} alt="Logo" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            MyHome24App
          </span>
        </a>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          {rightMenus.map((menu, index) =>
            renderDropdown(menu, index + 100, "right")
          )}

          {/* AUTH / PROFILE */}
          {!loadingAuth && !currentUser ? (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-gray-900 dark:text-gray-100 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {t("login", { defaultValue: "Anmelden" })}
              </a>
              <a
                href="/register"
                className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("register", { defaultValue: "Registrieren" })}
              </a>
            </div>
          ) : (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                title={currentUser?.email || "Account"}
              >
                <img
                  src={
                    currentUser?.photoURL ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(currentUser?.email || "U") +
                      "&background=0D8ABC&color=fff&size=64"
                  }
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden lg:flex flex-col items-start leading-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("role", { defaultValue: "Rolle" })}: {roleText}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
                    {currentUser?.email}
                  </span>
                </div>
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[2100] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("signedInAs", { defaultValue: "Angemeldet als" })}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {t("dashboard", { defaultValue: "Verwaltung" })}
                    </a>
                    <a
                      href="/publish"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {t("publishProperty", {
                        defaultValue: "Immobilie veröffentlichen",
                      })}
                    </a>
                  </div>

                  <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                    <p className="px-4 pt-2 pb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t("switchRole", { defaultValue: "Rolle wechseln" })}
                    </p>
                    <button
                      onClick={() => handleChangeRole("user")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {t("user", { defaultValue: "Benutzer:in" })}
                    </button>
                    <button
                      onClick={() => handleChangeRole("owner")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {t("owner", { defaultValue: "Eigentümer:in" })}
                    </button>
                    <button
                      onClick={() => handleChangeRole("agent")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {t("agent", { defaultValue: "Makler:in" })}
                    </button>
                  </div>

                  <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      {t("logout", { defaultValue: "Abmelden" })}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
            title={isDark ? "Light" : "Dark"}
          >
            <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BAR */}
      <nav className="flex md:hidden justify-between items-center px-4 py-3 w-full">
        <a href="/" className="flex items-center gap-2 focus:outline-none">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-blue-800 dark:text-blue-300">
            MyHome24App
          </span>
        </a>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-800 dark:text-gray-100 text-2xl"
          aria-label="Menu"
        >
          <HiMenu />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}
    </header>
  );
};

export default Navbar;
