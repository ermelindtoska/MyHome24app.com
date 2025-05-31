// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    
  };

  return (
    <div className="text-sm flex gap-3 items-center">
      <button
        onClick={() => changeLanguage('de')}
        className={i18n.language === 'de' ? 'font-bold underline' : 'text-gray-600'}
      >
        Deutsch
      </button>
      |
      <button
        onClick={() => changeLanguage('en')}
        className={i18n.language === 'en' ? 'font-bold underline' : 'text-gray-600'}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
