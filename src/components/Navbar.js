import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation('navbar');

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 shadow-sm">
      <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">MyHome24App</div>
        <div className="flex items-center gap-10">
          <ul className="flex gap-6 text-sm font-medium text-gray-700">
            <li><Link to="/buy">{t('buy')}</Link></li>
            <li><Link to="/rent">{t('rent')}</Link></li>
            <li><Link to="/sell">{t('sell')}</Link></li>
            <li><Link to="/mortgage">{t('mortgage')}</Link></li>
            <li><Link to="/agent">{t('findAgent')}</Link></li>
            <li><Link to="/careers">{t('careers')}</Link></li>  
            <li><Link to="/newsletter">{t('newsletter')}</Link></li> 
            <li><Link to="/partners">{t('partners')}</Link></li>
            <li><Link to="/blog">{t('blog')}</Link></li>
          </ul>
          <ul className="flex gap-4 text-sm font-medium text-gray-700">
            <li><Link to="/manage">{t('manage')}</Link></li>
            <li><Link to="/advertise">{t('advertise')}</Link></li>
            <li><Link to="/help">{t('help')}</Link></li>
            <li><Link to="/login">{t('login')}</Link></li>
          </ul>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
