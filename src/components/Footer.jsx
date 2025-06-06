import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation('footer');

  return (
    <footer className="bg-gray-100 text-center text-sm text-gray-600 py-10">
      <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">MyHome24App</h4>
          <p className="text-gray-500">{t('rightsReserved')}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2">{t('about')}</h4>
          <ul className="space-y-1">
            <li><Link to="/about" className="hover:underline">{t('about')}</Link></li>
            <li><Link to="/careers" className="hover:underline">{t('careers')}</Link></li>
            <li><Link to="/contact" className="hover:underline">{t('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2">{t('help')}</h4>
          <ul className="space-y-1">
            <li><Link to="/faq" className="hover:underline">{t('faq')}</Link></li>
            <li><Link to="/privacy" className="hover:underline">{t('privacy')}</Link></li>
            <li><Link to="/terms" className="hover:underline">{t('terms')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2">{t('followUs')}</h4>
          <div className="flex gap-4 mt-2">
            <a href="#" className="text-blue-600 hover:text-blue-800"><FaFacebook /></a>
            <a href="#" className="text-blue-400 hover:text-blue-600"><FaTwitter /></a>
            <a href="#" className="text-pink-500 hover:text-pink-700"><FaInstagram /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
