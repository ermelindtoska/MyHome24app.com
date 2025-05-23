// src/components/Navbar.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Navbar = ({ user, onLogout, onLanguageChange }) => {
  const { t, i18n } = useTranslation();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">MyHome24.de</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => onLanguageChange('de')} className="text-sm px-2 py-1 border rounded">🇩🇪 Deutsch</button>
          <button onClick={() => onLanguageChange('en')} className="text-sm px-2 py-1 border rounded">🇬🇧 English</button>
          {user ? (
            <>
              <span className="text-sm text-gray-600">👤 {user}</span>
              <button onClick={onLogout} className="text-red-600 text-sm underline">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
