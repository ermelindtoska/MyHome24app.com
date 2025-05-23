import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          {t('Myhome24app')}
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm hover:underline">🏠 {t('navbar.home')}</Link>
          <Link to="/dashboard" className="text-sm hover:underline">📋 {t('navbar.dashboard')}</Link>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
