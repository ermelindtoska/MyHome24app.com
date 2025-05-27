import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          {t('Myhome24app')}
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm hover:underline">🏠 {t('navbar.home')}</Link>
          <Link to="/dashboard" className="text-sm hover:underline">📋 {t('navbar.dashboard')}</Link>
          <Link to="/owner-dashboard" className="text-sm hover:underline">🏘️ My Listings</Link>

          {!user && (
            <>
              <Link to="/register" className="text-blue-600 hover:underline">Create Account</Link>
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline text-sm"
            >
              Logout
            </button>
          )}

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
