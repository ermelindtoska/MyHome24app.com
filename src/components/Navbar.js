// src/components/Navbar.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.png';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { doc, getDoc } from 'firebase/firestore';




const Navbar = () => {
  const { t } = useTranslation('navbar');
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const roleDoc = await getDoc(doc(db, 'roles', user.uid));
        const userRole = roleDoc.exists() ? roleDoc.data().role : null;
        setCurrentUser({ ...user, role: userRole });
      } else {
        setCurrentUser(null);
        if (user && !user.emailVerified) {
          console.warn('User email not verified. Signing out.');
          await signOut(auth);
        }
      }
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
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 300);
  };

  

  const leftMenus = [
    {
      title: t('buy'),
      to: '/buy',
      items: [
        { label: 'Neubau', to: '/new-construction' },
        { label: 'Zwangsversteigerungen', to: '/buy/foreclosures' },
        { label: 'Direkt vom Eigentümer', to: '/buy/owner' },
      ],
    },
    {
      title: t('rent'),
      to: '/rent',
      items: [
        { label: 'Wohnung', to: '/rent/apartment' },
        { label: 'Haus', to: '/rent/house' },
        { label: 'Büro / Gewerbe', to: '/rent/office' },
      ],
    },
    {
      title: t('mortgage'),
      to: '/mortgage',
      items: [
        { label: 'Rechner', to: '/mortgage/calculator' },
        { label: 'Bankpartner', to: '/mortgage/partners' },
      ],
    },
    {
      title: t('findAgent'),
      to: '/agents',
      items: [
        { label: 'Maklersuche', to: '/agent/search' },
        { label: 'Makler bewerten', to: '/agent/rate' },
      ],
    },
  ];

  const rightMenus = [
    {
      title: t('manage'),
      items: [
        { label: 'Meine Immobilien', to: '/manage/properties' },
        { label: 'Neue Anzeige', to: '/manage/add' },
      ],
    },
    {
      title: t('advertise'),
      items: [
        { label: 'Bannerwerbung', to: '/advertise/banner' },
        { label: 'Premium-Listing', to: '/advertise/premium' },
      ],
    },
    {
      title: currentUser ? (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              currentUser.email?.[0]?.toUpperCase()
            )}
          </div>
          <span className="text-sm hidden sm:inline">{currentUser.email}</span>
        </div>
      ) : (
        t('login')
      ),
     items: currentUser
  ? [
      {
        label: t('dashboard'),
        to: currentUser.role === 'owner' ? '/dashboard/owner' : '/dashboard',
      },
      { label: t('logout'), to: '#', onClick: handleLogout },
    ]
  : [
      { label: 'Login', to: '/login' },
      { label: 'Registrieren', to: '/register' },
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
      <a
        href={menu.to}
        className="relative cursor-pointer px-2 py-1 transition text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
      >
        {menu.title}
      </a>
      {menu.items && openMenu === index && (
        <div
          className={`absolute ${align}-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50`}
        >
          {menu.items.map((item, idx) =>
            item.onClick ? (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full text-left block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {item.label}
              </button>
            ) : (
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
              
            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow">
      <nav className="hidden md:flex justify-between items-center px-6 py-4 w-full">
        <div className="flex gap-12 text-sm font-medium text-gray-900 dark:text-gray-100">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, 'left'))}
        </div>
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
        <div className="flex items-center gap-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          {rightMenus.map((menu, index) => renderDropdown(menu, index + 100, 'right'))}

          {currentUser && (
  <div title={currentUser.email} className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-300">
    {currentUser.photoURL ? (
      <img
        src={currentUser.photoURL}
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 flex items-center justify-center text-sm">
        👤
      </div>
    )}
  </div>
)}

          {currentUser?.role === 'owner' && (
            <a
              href="/publish"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300 rounded-full hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition"
            >
              ➕ {t('publishProperty')}
            </a>
          )}

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

      {/* Mobile */}
      <nav className="flex md:hidden justify-between items-center px-4 py-3 w-full">
        <button
          onClick={() => {
            navigate('/');
            setTimeout(() => window.location.reload(), 50);
          }}
          className="flex items-center gap-2 focus:outline-none"
        >
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-blue-800 dark:text-blue-300">MyHome24App</span>
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-800 dark:text-gray-100 text-2xl"
        >
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 w-full px-4 pb-4 shadow">
          <div className="flex flex-col space-y-2 mt-2">

            {currentUser && (
  <div className="flex items-center mt-3 space-x-2">
    <div title={currentUser.email} className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-300">
      {currentUser.photoURL ? (
        <img
          src={currentUser.photoURL}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 flex items-center justify-center text-sm">
          👤
        </div>
      )}
    </div>
    <span className="text-sm text-gray-800 dark:text-gray-100">{currentUser.email}</span>
  </div>
)}

         {currentUser?.role === 'owner' && (
        <a
          href="/publish"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300 rounded-full hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition">{t('publishProperty')}</a>
         )}

            {leftMenus.concat(rightMenus).map((menu, idx) => (

          
              <div key={idx} className="flex flex-col">
                <span className="text-gray-900 dark:text-gray-100 font-semibold">{menu.title}</span>
                {menu.items?.map((item, j) =>
                  item.onClick ? (
                    <button
                      key={j}
                      onClick={() => {
                        setMobileOpen(false);
                        item.onClick();
                      }}
                      className="text-left pl-4 py-1 text-gray-700 dark:text-gray-300"
                    >
                      {item.label}
                    </button>
                  ) : (
                <button
                  key={j}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(item.to);
                  }}
                  className="text-left pl-4 py-1 text-gray-700 dark:text-gray-300"
                >
                  {item.label}
                </button>
                  )
                )}
              </div>
            ))}
            <a
              href="/compare"
              className="inline-flex items-center px-4 py-2 mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-700 dark:border-blue-300 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 hover:text-white transition"
            >
              {t('compare')}
            </a>
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 mt-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded"
            >
              <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
