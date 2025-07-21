import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // kyçi i saktë që lexon i18n
  };

  return (
    <div className="text-sm flex gap-3 items-center">
      <button
        onClick={() => changeLanguage('de')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition 
          ${i18n.language === 'de' 
            ? 'font-semibold underline text-blue-600 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'}`}
      >
        🇩🇪 Deutsch
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition 
          ${i18n.language === 'en' 
            ? 'font-semibold underline text-blue-600 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'}`}
      >
        🇬🇧 English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
