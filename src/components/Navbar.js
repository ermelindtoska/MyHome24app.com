import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.png';



const Navbar = () => {
  const { t } = useTranslation('navbar');
  const [openMenu, setOpenMenu] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 2000); // delay prej 900ms
  };
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 shadow-sm">
      <nav className="flex justify-between items-center px-6 py-4 w-full">
        
        {/* Majtas: Menutë kryesore */}
       
        <div className="flex gap-12 text-sm font-medium text-gray-900">
  {/* Kaufen */}
  <div className="relative group">
    <span className="cursor-pointer">{t('buy')}</span>
    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/buy/new" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Neubau</Link>
      <Link to="/buy/foreclosures" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Zwangsversteigerungen</Link>
      <Link to="/buy/owner" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Direkt vom Eigentümer</Link>
    </div>
  </div>

  {/* Mieten */}
  <div className="relative group">
    <span className="cursor-pointer">{t('rent')}</span>
    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/rent/apartment" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Wohnung</Link>
      <Link to="/rent/house" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Haus</Link>
      <Link to="/rent/office" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Büro / Gewerbe</Link>
    </div>
  </div>

  {/* Hypothek */}
  <div className="relative group">
    <span className="cursor-pointer">{t('mortgage')}</span>
    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/mortgage/calculator" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Rechner</Link>
      <Link to="/mortgage/partners" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Bankpartner</Link>
    </div>
  </div>

  {/* Makler finden */}
  <div className="relative group">
    <span className="cursor-pointer">{t('findAgent')}</span>
    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/agent/search" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Maklersuche</Link>
      <Link to="/agent/rate" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Makler bewerten</Link>
    </div>
  </div>
</div>

        {/* Qendra: Logo + Emri */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-9">
            <img src={logo} alt="Logo" className="h-14 w-auto" />
            <span className="text-2xl font-bold text-blue-800">MyHome24App</span>
          </Link>
        </div>

       <div className="flex items-center gap-12 text-sm font-medium text-gray-900">
  {/* Verwaltung */}
  <div className="relative group">
    <span className="cursor-pointer">{t('manage')}</span>
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/manage/properties" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Meine Immobilien</Link>
      <Link to="/manage/add" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Neue Anzeige</Link>
    </div>
  </div>

  {/* Werben */}
  <div className="relative group">
    <span className="cursor-pointer">{t('advertise')}</span>
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/advertise/banner" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Bannerwerbung</Link>
      <Link to="/advertise/premium" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Premium-Listing</Link>
    </div>
  </div>

  {/* Anmelden */}
  <div className="relative group">
    <span className="cursor-pointer">{t('login')}</span>
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/login" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Login</Link>
      <Link to="/register" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Registrieren</Link>
    </div>
  </div>

  {/* Hilfe */}
  <div className="relative group">
    <span className="cursor-pointer">{t('help')}</span>
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
      <Link to="/faq" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">FAQ</Link>
      <Link to="/contact" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Kontakt</Link>
      <Link to="/support" className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100">Support</Link>
    </div>
  </div>

  {/* Language Switcher */}
  <LanguageSwitcher />
</div>
        
        
      </nav>
    </header>
  );
};

export default Navbar;
