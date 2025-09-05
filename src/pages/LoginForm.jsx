import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';

export default function LoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Show “check your email” message if redirected from registration
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('checkEmail') === '1') {
      setInfo(
        t('checkEmailMsg') ||
          'We have sent a verification link to your email. Please check your inbox/spam.'
      );
    }
  }, [location.search, t]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setInfo('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        // Re-send verification (nice UX)
        try {
          await sendEmailVerification(cred.user, {
            url: `${window.location.origin}/login?checkEmail=1`,
            handleCodeInApp: false,
          });
          setInfo(
            t('verifyResent') ||
              'Your email is not verified yet. We just sent the verification link again.'
          );
        } catch {
          setInfo(
            t('verifyPlease') ||
              'Your email is not verified yet. Please check your inbox for the verification link.'
          );
        }
        await signOut(auth);
        return;
      }

      // Logged in and verified → go home
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.code === 'auth/wrong-password'
          ? t('wrongPassword') || 'Incorrect password.'
          : err.code === 'auth/user-not-found'
          ? t('userNotFound') || 'No account found with that email.'
          : t('loginFailed') || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {info && <p className="text-blue-600 text-sm">{info}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('email') || 'Email'}
        required
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('password') || 'Password'}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded`}
      >
        {loading ? (t('loggingIn') || 'Signing in...') : (t('login') || 'Sign in')}
      </button>
    </form>
  );
}
