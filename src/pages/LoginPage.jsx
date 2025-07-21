import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const LoginPage = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(t('loginError') || 'Anmeldung fehlgeschlagen.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Helmet>
        <title>{t('loginTitle') || 'Anmelden'} – MyHome24App</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 dark:text-white mb-6">
          {t('loginTitle') || 'Anmelden'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder={t('emailPlaceholder') || 'E-Mail'}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder') || 'Passwort'}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-300 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="mr-2" />
              {t('stayLoggedIn') || 'Angemeldet bleiben'}
            </label>
            <a href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              {t('forgotPassword') || 'Passwort vergessen?'}
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            {t('loginButton') || 'Einloggen'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          {t('noAccount') || 'Noch kein Konto?'}{' '}
          <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t('registerNow') || 'Jetzt registrieren'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
