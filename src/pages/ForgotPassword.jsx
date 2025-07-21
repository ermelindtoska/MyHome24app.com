import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t('resetEmailSent') || 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError(t('userNotFound') || 'Benutzer wurde nicht gefunden.');
      } else if (err.code === 'auth/invalid-email') {
        setError(t('invalidEmail') || 'Ungültige E-Mail-Adresse.');
      } else {
        setError(t('resetFailed') || 'Zurücksetzen fehlgeschlagen.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 mt-10 bg-white shadow-md rounded">
      <Helmet>
        <title>{t('forgotPasswordTitle') || 'Passwort zurücksetzen'}</title>
        <meta name="description" content="Passwort zurücksetzen für MyHome24App" />
      </Helmet>

      <h2 className="text-4xl font-bold mb-10 text-center">
        {t('forgotPassword') || 'Passwort vergessen'}
      </h2>

      {message && <p className="text-green-900 mb-10">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleReset} className="space-y-6">
        <div>
          <label className="block mb-4">{t('email') || 'E-Mail'}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {t('sendResetLink') || 'Zurücksetzen-Link senden'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
