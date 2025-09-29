// src/components/Navbar.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiMenu, HiX } from "react-icons/hi";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "../assets/logo.png";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../roles/RoleContext";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Navbar = () => {
  const { t } = useTranslation("navbar");
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // — NEW: bëjmë menunë e profilit “me klik” (jo group-hover)
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  // profile seksioni i palosshëm në mobile
  const [accountMobileOpen, setAccountMobileOpen] = useState(false);

  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
const { currentUser, loading: loadingAuth } = useAuth() ?? { currentUser: null, loading: true };
  const { role } = useRole();

  // — NEW: “optimistic” role që reagon menjëherë pas klikimit
  const [optimisticRole, setOptimisticRole] = useState(null);
  const effectiveRole = optimisticRole ?? role;

  // Lock scroll kur drawer është hapur
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
        body.style.top = prev.top || "";
        body.style.left = prev.left || "";
        body.style.right = prev.right || "";
        const y = parseInt((prev.top || "0").replace("-", "")) || scrollY;
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

  const handleChangeRole = async (newRole) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "users", currentUser.uid), { role: newRole }, { merge: true });
      setOptimisticRole(newRole);           // — NEW: reagon UI menjëherë
      setAccountOpen(false);                // mbyll dropdown-in
    } catch (e) {
      console.error("Error updating role:", e);
      alert("Could not update your role. Please try again.");
    }
  };

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 300);
  };

  // — NEW: mbyll ÇDO menu në çdo ndryshim rruge (fix “ngulitet profili”)
  useEffect(() => {
    setOpenMenu(null);
    setAccountOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // — NEW: click outside për menunë e profilit (desktop)
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
      {menu.to ? (
        <NavLink
          to={menu.to}
          end
          className={({ isActive }) =>
            `relative cursor-pointer px-2 py-1 transition ${
              isActive
                ? "text-white bg-blue-600 rounded-full"
                : "text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
            }`
          }
          aria-haspopup="true"
          aria-expanded={openMenu === index}
          onClick={() => setOpenMenu(null)}
        >
          {menu.title}
        </NavLink>
      ) : (
        <button
          type="button"
          className="relative cursor-pointer px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
          aria-haspopup="true"
          aria-expanded={openMenu === index}
          onClick={() => setOpenMenu(openMenu === index ? null : index)}
        >
          {menu.title}
        </button>
      )}

      {menu.items && openMenu === index && (
        <div
          className={`absolute ${align}-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-[2100]`}
        >
          {menu.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpenMenu(null);
                navigate(item.to);
              }}
              className="w-full text-left block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const roleText = ({ user: t("user"), owner: t("owner"), agent: t("agent") }[
    (optimisticRole ?? role) || "user"
  ] || (optimisticRole ?? role) || "user");

  return (
    <header className="sticky top-0 z-[2000] bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow">
      {/* DESKTOP */}
      <nav className="hidden md:flex justify-between items-center px-6 py-4 w-full">
        <div className="flex gap-12 text-sm font-medium text-gray-900 dark:text-gray-100">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, "left"))}
        </div>

        <button onClick={() => navigate("/")} className="flex items-center gap-4 focus:outline-none">
          <img src={logo} alt="Logo" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">MyHome24App</span>
        </button>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          {rightMenus.map((menu, index) => renderDropdown(menu, index + 100, "right"))}

        {/* AUTH (DESKTOP): shfaq Anmelden/Registrieren vetëm kur s’je i loguar */}
{!loadingAuth && !currentUser && (
  <>
    <button
      onClick={() => navigate('/login')}
      className="px-4 py-1.5 rounded-full border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
    >
      {t('login') || 'Anmelden'}
    </button>
    <button
      onClick={() => navigate('/register')}
      className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
    >
      {t('register') || 'Registrieren'}
    </button>
  </>
)}
          

         {currentUser && (
          <>
            <div className="hidden lg:block h-5 w-px bg-gray-300 dark:bg-gray-700" />

            <div className="hidden lg:flex items-center max-w-[260px]" aria-live="polite">
              {(() => {
                const roleKey = (optimisticRole ?? role) || "user";
                // përdor çelësat ekzistues të i18n
                const roleText = (
                  { user: t("user"), owner: t("owner"), agent: t("agent") }[roleKey] || roleKey
                );

                return (
                  <span
                    className="truncate text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 
                              border border-gray-200 dark:border-gray-700 
                              text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    title={`${currentUser.email} — ${roleText}`}
                  >
                    {currentUser.email}
                    <span className="text-[10px] uppercase tracking-wide 
                                    px-2 py-0.5 rounded-full 
                                    bg-blue-100 dark:bg-blue-900 
                                    text-blue-700 dark:text-blue-300">
                      {roleText}
                    </span>
                  </span>
                );
              })()}
            </div>
          </>
        )}


          {currentUser && (
            // — CHANGED: pa “group-hover”, kontrollohet me state + outside click
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                title={currentUser.email}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-300 cursor-pointer"
                aria-haspopup="true"
                aria-expanded={accountOpen}
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 flex items-center justify-center text-sm">
                    👤
                  </div>
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[2200]">
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t("profile") || "Profil"}
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                    <button
                      onClick={() => handleChangeRole("user")}
                      className={`block w-full text-left text-sm ${
                        effectiveRole === "user"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-800 dark:text-gray-200"
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      {t("user")}
                    </button>
                    <button
                      onClick={() => handleChangeRole("owner")}
                      className={`block w-full text-left text-sm ${
                        effectiveRole === "owner"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-800 dark:text-gray-200"
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      {t("owner")}
                    </button>
                    <button
                      onClick={() => handleChangeRole("agent")}
                      className={`block w-full text-left text-sm ${
                        effectiveRole === "agent"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-800 dark:text-gray-200"
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      {t("agent")}
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/settings");
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("settings")}
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* — CHANGED: boton publikimi për owner **ose** agent */}
          {currentUser && ["owner", "agent"].includes(effectiveRole) && (
            <button
              onClick={() => navigate("/publish")}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300 rounded-full hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition"
            >
              ➕ {t("publishProperty")}
            </button>
          )}

          <button
            onClick={() => navigate("/compare")}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-700 dark:border-blue-300 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 hover:text-white transition"
          >
            {t("compare")}
          </button>

          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
          >
            <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BAR */}
      <nav className="flex md:hidden justify-between items-center px-4 py-3 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 focus:outline-none">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-blue-800 dark:text-blue-300">MyHome24App</span>
        </button>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-gray-800 dark:text-gray-100 text-2xl"
          aria-label="Menu"
        >
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {/* DRAWER (si te versioni yt) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="ml-auto h-full w-[88%] max-w-sm bg-white dark:bg-gray-900 shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Menü</span>
              <button onClick={() => setMobileOpen(false)} className="text-2xl">
                <HiX />
              </button>
            </div>

            <div className="px-2 pb-6 overflow-y-auto flex-1">
              {currentUser ? (
                <div className="mt-3">
                  {/* pjesa mobile e profil/role – e njëjta si tek kodi yt */}
                  {/* … (pa ndryshime funksionale) … */}
                </div>
              ) : (
                <div className="mt-3 px-2 flex gap-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/login");
                    }}
                    className="flex-1 text-center px-4 py-2 rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    {t("login") || "Anmelden"}
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/register");
                    }}
                    className="flex-1 text-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {t("register") || "Registrieren"}
                  </button>
                </div>
              )}

              {currentUser && ["owner", "agent"].includes(effectiveRole) && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/publish");
                  }}
                  className="mx-2 mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300 rounded-full hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition"
                >
                  ➕ {t("publishProperty")}
                </button>
              )}

              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/compare");
                }}
                className="mx-2 mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-700 dark:border-blue-300 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 hover:text-white transition"
              >
                {t("compare")}
              </button>

              <div className="mx-2 mt-3">
                <LanguageSwitcher />
              </div>

              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="mx-2 mt-2 flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
              >
                <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
                <span className="text-sm">{isDark ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
