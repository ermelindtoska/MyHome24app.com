import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.png';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const { t } = useTranslation('navbar');
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
      className="relative"
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={menu.to || '#'}
        className="cursor-pointer hover:text-blue-700 transition-colors duration-200"
      >
        {menu.title}
      </Link>

      {menu.items && openMenu === index && (
        <div
          className={`absolute ${align}-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50 transition-opacity duration-300`}
        >
          {menu.items.map((item, idx) =>
            item.onClick ? (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full text-left block px-4 py-2 text-gray-800 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={idx}
                to={item.to}
                className="block px-4 py-2 text-gray-800 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 shadow-md">
      <nav className="flex justify-between items-center px-6 py-4 w-full">
        <div className="flex gap-12 text-sm font-medium text-gray-900">
          {leftMenus.map((menu, index) => renderDropdown(menu, index, 'left'))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-14 w-auto" />
            <span className="text-2xl font-bold text-blue-800">MyHome24App</span>
          </Link>
          <Link to="/explore/germany" className="nav-link">Explore Germany</Link>
        </div>

        <div className="flex items-center gap-12 text-sm font-medium text-gray-900">
          {rightMenus.map((menu, index) => renderDropdown(menu, index + 100, 'right'))}
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
