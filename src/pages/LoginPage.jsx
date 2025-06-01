// src/pages/LoginPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      
      {/* Titulli dhe përshkrimi sipër formës */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          {t('title') || 'Login'}
        </h1>
        <p className="text-gray-700">
          {t('subtitle') || 'Bitte melden Sie sich mit Ihren Zugangsdaten an.'}
        </p>
      </div>

      {/* Forma e Login-it */}
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm space-y-4">
        
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            {t('email') || 'E-Mail-Adresse'}
          </label>
          <input
            id="email"
            type="email"
            placeholder="E-Mail-Adresse"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            {t('login.password') || 'Passwort'}
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t('submit') || 'Anmelden'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
