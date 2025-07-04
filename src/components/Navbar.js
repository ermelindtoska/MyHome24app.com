// src/components/Navbar.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.png';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
  const { t } = useTranslation('navbar');
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    navigate('/');
  };

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 300);
  };

  const leftMenus = [
    {
      title: t('buy'),
      to: '/buy',
      items: [
        { label: 'Neubau', to: '/new-construction' },
        { label: 'Zwangsversteigerungen', to: '/buy/foreclosures' },
        { label: 'Direkt vom Eigentümer', to: '/buy/owner' }
      ]
    },
    {
      title: t('rent'),
      to: '/rent',
      items: [
        { label: 'Wohnung', to: '/rent/apartment' },
        { label: 'Haus', to: '/rent/house' },
        { label: 'Büro / Gewerbe', to: '/rent/office' }
      ]
    },
    {
      title: t('mortgage'),
      to: '/mortgage',
      items: [
        { label: 'Rechner', to: '/mortgage/calculator' },
        { label: 'Bankpartner', to: '/mortgage/partners' }
      ]
    },
    {
      title: t('findAgent'),
      to: '/agents',
      items: [
        { label: 'Maklersuche', to: '/agent/search' },
        { label: 'Makler bewerten', to: '/agent/rate' }
      ]
    }
  ];

  const rightMenus = [
    {
      title: t('manage'),
      items: [
        { label: 'Meine Immobilien', to: '/manage/properties' },
        { label: 'Neue Anzeige', to: '/manage/add' }
      ]
    },
    {
      title: t('advertise'),
      items: [
        { label: 'Bannerwerbung', to: '/advertise/banner' },
        { label: 'Premium-Listing', to: '/advertise/premium' }
      ]
    },
    {
      title: currentUser ? t('account') : t('login'),
      items: currentUser
        ? [
            { label: t('dashboard'), to: '/dashboard' },
            { label: t('logout'), to: '#', onClick: handleLogout }
          ]
        : [
            { label: 'Login', to: '/login' },
            { label: 'Registrieren', to: '/register' }
          ]
    },
    {
      title: t('help'),
      items: [
        { label: t('support'), to: '/support' },
        { label: t('howItWorks'), to: '/how-it-works' }
      ]
    }
  ];

  const renderDropdown = (menu, index, align = 'left') => (
    <div
      key={index}
      className="relative group"
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseLeave={handleMouseLeave}
    >
      {menu.to ? (
        <a
          href={menu.to}
          className="relative cursor-pointer px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {menu.title}
        </a>
      ) : (
        <span
          className="relative cursor-pointer px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {menu.title}
        </span>
      )}

      {menu.items && openMenu === index && (
        <div
          className={`absolute ${align}-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50`}
        >
          {menu.items.map((item, idx) =>
            item.onClick ? (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full text-left block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition"
            >
              {item.label}
            </button>
            ) : (
              <a
                key={idx}
                href={item.to}
                className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition"
              >
                {item.label}
              </a>

            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow overflow-x-hidden">

      <nav className="flex flex-wrap justify-between items-center px-6 py-4 w-full">

        <div className="flex gap-12 text-sm font-medium text-gray-900 dark:text-gray-100">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, 'left'))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => window.location.reload(), 50);
            }}
            className="flex items-center gap-4 focus:outline-none"
          >
            <img src={logo} alt="Logo" className="h-14 w-auto" />
            <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">MyHome24App</span>
          </button>
          <Link
  to="/explore/germany"
  className="nav-link text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"


          >
            Explore Germany
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          {rightMenus.map((menu, index) => renderDropdown(menu, index + 100, 'right'))}

     <a
  href="/compare"
  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-700 dark:border-blue-300 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 hover:text-white transition"
>

            {t('compare')}
          </a>

          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
          >
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
