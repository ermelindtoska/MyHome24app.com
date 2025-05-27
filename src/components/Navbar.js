// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import logo from '../assets/logo.png';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="MyHome24App Logo" className="h-10 w-auto" />
        <span className="text-xl font-bold text-gray-800">MyHome24App</span>
      </Link>

      <nav className="space-x-4 text-sm flex items-center">
        <Link to="/" className="text-gray-700 hover:text-blue-600">{t('navbar.home')}</Link>
        <Link to="/listings" className="text-gray-700 hover:text-blue-600">{t('navbar.listings')}</Link>
        <Link to="/add" className="text-gray-700 hover:text-blue-600">{t('navbar.addListing')}</Link>

        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">{t('navbar.dashboard')}</Link>
            <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600">{t('navbar.logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">{t('navbar.login')}</Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">{t('navbar.register')}</Link>
          </>
        )}

        <LanguageSwitcher />
      </nav>
    </header>
  );
};

export default Navbar;
