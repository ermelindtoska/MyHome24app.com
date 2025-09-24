// src/components/Navbar.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.png';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../roles/RoleContext';
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const { t } = useTranslation('navbar');
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { role, loading: roleLoading } = useRole();

  // Lock scroll when drawer open
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
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflow = 'hidden';
      return () => {
        body.style.overflow = prev.overflow || '';
        body.style.position = prev.position || '';
        body.style.top = prev.top || '';
        body.style.left = prev.left || '';
        body.style.right = prev.right || '';
        const y = parseInt((prev.top || '0').replace('-', '')) || scrollY;
        window.scrollTo(0, y);
      };
    } else {
      body.style.overflow = prev.overflow || '';
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleChangeRole = async (newRole) => {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { role: newRole },
        { merge: true }
      );
      // s’ka nevojë reload; RoleContext do e reflektojë vetë
    } catch (e) {
      console.error('Error updating role:', e);
      alert('Could not update your role. Please try again.');
    }
  };

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 300);
  };

  const leftMenus = [
    {
      title: t('buy'),
      to: '/buy',
      items: [
        { label: t('newConstruction'), to: '/new-construction' },
        { label: t('foreclosures'), to: '/buy/foreclosures' },
        { label: t('directFromOwner'), to: '/buy/owner' },
      ],
    },
    {
      title: t('rent'),
      to: '/rent',
      items: [
        { label: t('apartment'), to: '/rent/apartment' },
        { label: t('house'), to: '/rent/house' },
        { label: t('officeCommercial'), to: '/rent/office' },
      ],
    },
    {
      title: t('mortgage'),
      to: '/mortgage',
      items: [
        { label: t('calculator'), to: '/mortgage/calculator' },
        { label: t('bankPartners'), to: '/mortgage/partners' },
      ],
    },
    {
      title: t('findAgent'),
      to: '/agents',
      items: [
        { label: t('agentSearch'), to: '/agent/search' },
        { label: t('rateAgent'), to: '/agent/rate' },
      ],
    },
  ];

  const rightMenus = [
    {
      title: t('manage'),
      items: [
        { label: t('myProperties'), to: '/manage/properties' },
        { label: t('newListing'), to: '/manage/add' },
      ],
    },
    {
      title: t('advertise'),
      items: [
        { label: t('bannerAds'), to: '/advertise/banner' },
        { label: t('premiumListing'), to: '/advertise/premium' },
      ],
    },
    {
      title: t('help'),
      items: [
        { label: t('support'), to: '/support' },
        { label: t('howItWorks'), to: '/how-it-works' },
      ],
    },
  ];

  const renderDropdown = (menu, index, align = 'left') => (
  <div
    key={index}
    className="relative group"
    onMouseEnter={() => handleMouseEnter(index)}
    onMouseLeave={handleMouseLeave}
  >
    {/* Nëse menu ka 'to' (p.sh. /buy, /rent) → NavLink; ndryshe thjesht buton */}
    {menu.to ? (
      <NavLink
        to={menu.to}
        end
        className={({ isActive }) =>
          `relative cursor-pointer px-2 py-1 transition ${
            isActive
              ? 'text-white bg-blue-600 rounded-full'
              : 'text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300'
          }`
        }
        aria-haspopup="true"
        aria-expanded={openMenu === index}
      >
        {menu.title}
      </NavLink>
    ) : (
      <button
        type="button"
        className="relative cursor-pointer px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
        aria-haspopup="true"
        aria-expanded={openMenu === index}
      >
        {menu.title}
      </button>
    )}

    {menu.items && openMenu === index && (
      <div
        className={`absolute ${align}-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50`}
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


  return (
    <header className="sticky top-0 z-[1000] bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow">
      <nav className="hidden md:flex justify-between items-center px-6 py-4 w-full">
        <div className="flex gap-12 text-sm font-medium text-gray-900 dark:text-gray-100">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, 'left'))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-4 focus:outline-none"
        >
          <img src={logo} alt="Logo" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            MyHome24App
          </span>
        </button>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          {rightMenus.map((menu, index) => renderDropdown(menu, index + 100, 'right'))}

          {/* kur s’je i loguar -> shfaq LOGIN / REGISTER (desktop) */}
          {!currentUser && (
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

          {/* kur je i loguar -> avatar + menu */}
          {currentUser && (
            <div className="relative group">
              <div
                onClick={() => navigate('/profile')}
                title={currentUser.email}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-300 cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 flex items-center justify-center text-sm">
                    👤
                  </div>
                )}
              </div>

             <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[1100]">
                <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                  {currentUser.email}
                </div>

                {/* Roles */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                  <button
                    onClick={() => handleChangeRole('user')}
                    className={`block w-full text-left text-sm ${
                      role === 'user' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    {t('user')}
                  </button>
                  <button
                    onClick={() => handleChangeRole('owner')}
                    className={`block w-full text-left text-sm ${
                      role === 'owner' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    {t('owner')}
                  </button>
                  <button
                    onClick={() => handleChangeRole('agent')}
                    className={`block w-full text-left text-sm ${
                      role === 'agent' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    {t('agent')}
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                  <button
                    onClick={() => navigate('/settings')}
                    className="block w-full text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('settings')}
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentUser && role === 'owner' && (
            <button
              onClick={() => navigate('/publish')}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300 rounded-full hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition"
            >
              ➕ {t('publishProperty')}
            </button>
          )}

          <button
            onClick={() => navigate('/compare')}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-700 dark:border-blue-300 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 hover:text-white transition"
          >
            {t('compare')}
          </button>

          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
          >
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BAR */}
      <nav className="flex md:hidden justify-between items-center px-4 py-3 w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 focus:outline-none"
        >
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

      {/* DRAWER */}
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
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-300">
                        {currentUser.photoURL ? (
                          <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 flex items-center justify-center text-sm">
                            👤
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-100 truncate max-w-[180px]">
                        {currentUser.email}
                      </span>
                    </div>
                    <span className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {accountOpen && (
                    <div className="pl-12 pr-3 py-2 space-y-2">
                      <button
                        onClick={() => handleChangeRole('user')}
                        className={`block w-full text-left text-sm px-2 py-1 rounded ${
                          role === 'user' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t('user') || 'Benutzer'}
                      </button>
                      <button
                        onClick={() => handleChangeRole('owner')}
                        className={`block w-full text-left text-sm px-2 py-1 rounded ${
                          role === 'owner' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t('owner') || 'Eigentümer'}
                      </button>
                      <button
                        onClick={() => handleChangeRole('agent')}
                        className={`block w-full text-left text-sm px-2 py-1 rounded ${
                          role === 'agent' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t('agent') || 'Makler'}
                      </button>

                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                      <button
                        onClick={() => { setMobileOpen(false); navigate('/settings'); }}
                        className="block w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {t('settings') || 'Einstellungen'}
                      </button>
                      <button
                        onClick={async () => { setMobileOpen(false); await handleLogout(); }}
                        className="block w-full text-left text-sm px-2 py-1 rounded text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {t('logout') || 'Abmelden'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 px-2 flex gap-2">
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/login'); }}
                    className="flex-1 text-center px-4 py-2 rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    {t('login') || 'Anmelden'}
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/register'); }}
                    className="flex-1 text-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {t('register') || 'Registrieren'}
                  </button>
                </div>
              )}

              {currentUser && role === 'owner' && (
                <button
                  onClick={() => { setMobileOpen(false); navigate('/publish'); }}
                  className="mx-2 mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300 rounded-full hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition"
                >
                  ➕ {t('publishProperty')}
                </button>
              )}

              <div className="mt-4 space-y-3">
                {[...leftMenus, ...rightMenus].map((menu, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="px-2 text-gray-900 dark:text-gray-100 font-semibold">{menu.title}</span>
                    {menu.items?.map((item, j) => (
                      <button
                        key={j}
                        onClick={() => { setMobileOpen(false); navigate(item.to); }}
                        className="text-left pl-6 pr-2 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setMobileOpen(false); navigate('/compare'); }}
                className="mx-2 mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-700 dark:border-blue-300 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 hover:text-white transition"
              >
                {t('compare')}
              </button>

              <div className="mx-2 mt-3"><LanguageSwitcher /></div>

              <button
                onClick={() => { toggleTheme(); }}
                className="mx-2 mt-2 flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
              >
                <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
                <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
