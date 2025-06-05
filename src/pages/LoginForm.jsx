import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';

const LoginForm = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError(t('emailNotVerified') || 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        const userInfo = {
          uid: user.uid,
          email: user.email,
          role: userData.role || 'user',
        };

        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userInfo));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userInfo));
        }

        navigate('/dashboard');
      } else {
        setError(t('userDataNotFound') || 'Benutzerdaten wurden nicht gefunden.');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError(t('userNotFound') || 'Benutzer wurde nicht gefunden.');
      } else if (err.code === 'auth/wrong-password') {
        setError(t('wrongPassword') || 'Falsches Passwort.');
      } else if (err.code === 'auth/invalid-email') {
        setError(t('invalidEmail') || 'Ungültige E-Mail-Adresse.');
      } else {
        setError(t('loginFailed') || 'Anmeldung fehlgeschlagen.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10 bg-white shadow-md rounded">
      <Helmet>
        <title>Anmelden – MyHome24app</title>
        <meta name="description" content="Benutzeranmeldung für die MyHome24app-Plattform" />
      </Helmet>

      <h2 className="text-2xl font-bold mb-4 text-center">{t('loginTitle') || 'Anmelden'}</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">{t('email') || 'E-Mail'}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">{t('password') || 'Passwort'}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            {t('rememberMe')}
          </label>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
            {t('forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {t('loginButton') || 'Einloggen'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
