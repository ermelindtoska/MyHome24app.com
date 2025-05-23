// src/App.js
import React from 'react';
import './index.css';
import './i18n';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';

function App() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">MyHome24.de</h1>
          <div className="space-x-2">
            <button onClick={() => changeLanguage('de')} className="text-sm px-2 py-1 border rounded">🇩🇪 Deutsch</button>
            <button onClick={() => changeLanguage('en')} className="text-sm px-2 py-1 border rounded">🇬🇧 English</button>
          </div>
        </div>
      </nav>

      <HomePage />
    </div>
  );
}

export default App;
