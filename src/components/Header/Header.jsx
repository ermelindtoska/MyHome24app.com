import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t, i18n } = useTranslation('header');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">MyHome24App</Link>

        <nav className="space-x-6 text-sm font-medium">
          <Link to="/buy" className="hover:underline">{t('nav.buy')}</Link>
          <Link to="/rent" className="hover:underline">{t('nav.rent')}</Link>
          <Link to="/mortgage" className="hover:underline">{t('nav.mortgage')}</Link>
          <Link to="/agents" className="hover:underline">{t('nav.findAgent')}</Link>
          <Link to="/compare" className="hover:underline">{t('nav.compare')}</Link>
        </nav>

        <div className="flex gap-4 items-center text-sm">
          <button onClick={() => changeLanguage('de')} className="hover:underline">Deutsch</button>
          <button onClick={() => changeLanguage('en')} className="hover:underline">English</button>
          <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
