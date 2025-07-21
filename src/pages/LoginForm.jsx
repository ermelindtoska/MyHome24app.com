// ... importet ekzistuese
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const LoginForm = () => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      setError(t('loginError') || 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-gray-800 text-white shadow rounded">
      <Helmet>
        <title>Anmelden – MyHome24App</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-center">{t('loginTitle') || 'Anmelden'}</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="E-Mail"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded placeholder-gray-400"
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Passwort"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 pr-10 border border-gray-600 bg-gray-700 text-white rounded placeholder-gray-400"
          />
          <div className="absolute right-2 top-2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (<EyeSlashIcon className="h-5 w-5" />) : (<EyeIcon className="h-5 w-5" />)}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">{t('stayLoggedIn') || 'Angemeldet bleiben'}</span>
          </label>
          <a href="/forgot-password" className="text-blue-400 hover:underline">
            {t('forgotPassword') || 'Passwort vergessen?'}
          </a>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          {t('loginButton') || 'Einloggen'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
