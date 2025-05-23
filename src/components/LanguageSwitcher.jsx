import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2 items-center">
      <button onClick={() => changeLanguage('de')} className="text-sm hover:underline">
        🇩🇪 Deutsch
      </button>
      <button onClick={() => changeLanguage('en')} className="text-sm hover:underline">
        🇬🇧 English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
