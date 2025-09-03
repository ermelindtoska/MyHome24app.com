import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError(t('emailNotVerified') || 'Please verify your email before logging in.');
        await signOut(auth);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(t('loginError') || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-gray-800 text-white shadow rounded">
      <Helmet>
        <title>Login – MyHome24App</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-center">{t('loginTitle') || 'Login'}</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded placeholder-gray-400"
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 pr-10 border border-gray-600 bg-gray-700 text-white rounded placeholder-gray-400"
          />
          <div className="absolute right-2 top-2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (<EyeOffIcon className="h-5 w-5" />) : (<EyeIcon className="h-5 w-5" />)}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">{t('stayLoggedIn') || 'Stay logged in'}</span>
          </label>
          <a href="/forgot-password" className="text-blue-400 hover:underline">
            {t('forgotPassword') || 'Forgot password?'}
          </a>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          {t('loginButton') || 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
