import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

export default function RegisterForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { firstName, lastName, email, confirmEmail, password, confirmPassword, role } =
        formData;

      // ✅ Validime bazike
      if (email !== confirmEmail) throw new Error(t('emailMismatch') || 'Emails do not match.');
      if (password !== confirmPassword) throw new Error(t('passwordMismatch') || 'Passwords do not match.');

      // ✅ Krijo user-in
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Ruaj në Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        role,
        createdAt: serverTimestamp(),
      });

      // ✅ Dergo email verifikimi (me redirect te login me një mesazh miqësor)
      const actionCodeSettings = {
        url: `${window.location.origin}/login?checkEmail=1`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);

      // (opsionale) mesazh i shkurtër para redirect
      setSuccessMessage(
        t('registerSuccessMessage') ||
          'A verification link has been sent to your email address.'
      );

      // ✅ Shko te login, që përdoruesi ta shohë mesazhin “check your email”
      navigate('/login?checkEmail=1', { replace: true });
    } catch (err) {
      console.error('Register error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t('emailInUse') || 'This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError(t('weakPassword') || 'Password is too weak.');
      } else {
        setError(err.message || (t('somethingWentWrong') || 'Something went wrong.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded">
      <Helmet>
        <title>Register – MyHome24App</title>
      </Helmet>

      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        {t('createAccount') || 'Create Account'}
      </h2>

      {successMessage && <p className="text-green-600 mb-4 text-sm">{successMessage}</p>}
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          placeholder={t('firstName') || 'First Name'}
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        <input
          name="lastName"
          placeholder={t('lastName') || 'Last Name'}
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        <input
          name="email"
          type="email"
          placeholder={t('email') || 'Email'}
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        <input
          name="confirmEmail"
          type="email"
          placeholder={t('confirmEmail') || 'Confirm Email'}
          value={formData.confirmEmail}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        >
          <option value="user">{t('roleUser') || 'User'}</option>
          <option value="owner">{t('roleOwner') || 'Owner'}</option>
          <option value="agent">{t('roleAgent') || 'Agent'}</option>
        </select>

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password') || 'Password'}
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          />
          <div
            className="absolute right-2 top-2.5 cursor-pointer text-gray-500 dark:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('confirmPassword') || 'Confirm Password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          />
          <div
            className="absolute right-2 top-2.5 cursor-pointer text-gray-500 dark:text-gray-300"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded flex items-center justify-center`}
        >
          {loading ? (t('creating') || 'Creating...') : (t('register') || 'Register')}
        </button>
      </form>
    </div>
  );
}
