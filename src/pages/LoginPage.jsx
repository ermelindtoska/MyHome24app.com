// src/pages/LoginPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">{t('login.title')}</h1>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            {t('login.email')}
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="email" type="email" placeholder="Email" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            {t('login.password')}
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3" id="password" type="password" placeholder="********" />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {t('login.submit')}
        </button>
      </form>
    </div>
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Login</h1>
      <p className="text-gray-700 mb-4">Bitte melden Sie sich mit Ihren Zugangsdaten an.</p>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Passwort"
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Anmelden
        </button>
      </form>
    </div>
  );
};

export default LoginPage;