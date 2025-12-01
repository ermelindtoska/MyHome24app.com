// src/components/Navbar.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
import { toast } from "sonner";

const Navbar = () => {
  const { t, i18n } = useTranslation("navbar");
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);     // index i menus që është hapur
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const HOVER_CLOSE_MS = 320;
const hoverTimer = useRef(null);

  const { currentUser, loading: loadingAuth } =
    useAuth() ?? { currentUser: null, loading: true };

  const { role, setRoleLocal } = useRole();
  const effectiveRole = role || "user";
  console.log("[Navbar] role aus Context:", role);
  console.log("[Navbar] effectiveRole:", effectiveRole);


  // Lock body kur hapet menu mobile
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

  useEffect(() => {
    // mbyll çdo dropdown kur ndryshon rruga
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleChangeRole = async (newRole) => {
    if (!currentUser) {
      toast.error(
        i18n.t("roleChange.loginFirst", {
          ns: "navbar",
          defaultValue: "Bitte zuerst anmelden.",
        })
      );
      return;
    }
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
      setRoleLocal(newRole);
      setAccountOpen(false);
      toast.success(
        i18n.t("roleChange.updated", { ns: "navbar", defaultValue: "Rolle wurde aktualisiert." })
      );
      navigate("/dashboard");
    } catch (e) {
      console.error("Error updating role:", e);
      toast.error(
        i18n.t("roleChange.failed", {
          ns: "navbar",
          defaultValue: "Rolle konnte nicht aktualisiert werden. Bitte erneut versuchen.",
        })
      );
    }
  };

  // Menutë
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
               // "Meine Immobilien" zeigt auf das echte Dashboard:
       { label: t("myProperties"), to: "/owner-dashboard" },
      // Neues Inserat: direkt zur echten Publish-Seite
       { label: t("newListing"), to: "/publish" },
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

  // Dropdown — i qëndrueshëm në hover, me SPA Link
const renderDropdown = (menu, index, align = "left") => {
  const isOpen = openMenu === index;
  const hasChildren = !!menu.items?.length;

  const openNow = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpenMenu(index);
  };
  const closeWithDelay = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(null), HOVER_CLOSE_MS);
  };

  return (
    <div
      key={index}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeWithDelay}
    >
      {/* ✅ Klikimi te titulli NAVIGON (p.sh. /buy, /rent). Hover hap dropdown. */}
      <Link
        to={menu.to || "#"}
        className="px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center"
        aria-haspopup={hasChildren ? "true" : "false"}
        aria-expanded={isOpen}
      >
        {menu.title}
        {hasChildren && <span className="ml-1 select-none">▾</span>}
      </Link>

      {hasChildren && isOpen && (
        <div
          className={`absolute top-full ${align}-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50`}
          onMouseEnter={openNow}
          onMouseLeave={closeWithDelay}
        >
          {menu.items.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              onClick={() => setOpenMenu(null)}
              className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};



  const roleText =
    ({ user: t("user"), owner: t("owner"), agent: t("agent") }[effectiveRole]) ||
    effectiveRole;

  return (
   <header className="fixed md:sticky top-0 left-0 right-0 z-[10000] bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow">
      {/* DESKTOP */}
      <nav className="hidden md:flex justify-between items-center px-6 py-4 w-full">
        <div className="flex gap-12 text-sm font-medium text-gray-900 dark:text-gray-100">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, "left"))}
        </div>

        <Link to="/" className="flex items-center gap-4 focus:outline-none">
          <img src={logo} alt="Logo" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            MyHome24App
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          {rightMenus.map((menu, index) =>
            renderDropdown(menu, index + 100, "right")
          )}

          {!loadingAuth && !currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-gray-900 dark:text-gray-100 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {t("login", { defaultValue: "Anmelden" })}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("register", { defaultValue: "Registrieren" })}
              </Link>
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
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div
                    className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/profile");
                    }}
                    title={t("profile", { defaultValue: "Profil" })}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("signedInAs", { defaultValue: "Angemeldet als" })}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                                  <div className="py-1">
                                      {/* Owner-Dashboard */}
                <Link
                  to="/owner-dashboard"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {t("myProperties", { defaultValue: "Meine Immobilien" })}
                </Link>
                  {/* 🔐 Vetëm për admin: Admin-Dashboard */}
                  {effectiveRole === "admin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/admin-dashboard");
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                    >
                      {t("adminDashboard", { defaultValue: "Admin-Dashboard" })}
                    </button>
                  )}

                  
                  

                  {/* Immobilie veröffentlichen */}
                  <Link
                    to="/publish"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    onClick={() => setAccountOpen(false)}
                  >
                    {t("publishProperty", {
                      defaultValue: "Immobilie veröffentlichen",
                    })}
                  </Link>
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

                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {t("profile", { defaultValue: "Profil" })}
                  </Link>

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
        <Link to="/" className="flex items-center gap-2 focus:outline-none">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </Link>
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
          currentUser={currentUser}
          role={effectiveRole}
          onChangeRole={handleChangeRole}
        />
      )}
    </header>
  );
};

export default Navbar;
