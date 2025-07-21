// ... importet ekzistuese
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';



const RegisterForm = () => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, confirmEmail, password, confirmPassword, role } = formData;

    if (email !== confirmEmail) return setError(t('emailMismatch') || "E-Mail-Adressen stimmen nicht überein.");
    if (password !== confirmPassword) return setError(t('passwordMismatch') || "Passwörter stimmen nicht überein.");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        role,
        createdAt: serverTimestamp()
      });

      await sendEmailVerification(userCredential.user);
      navigate('/register-success');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError(t('emailInUse') || 'Email bereits registriert.');
      } else {
        console.error("Firebase error:", err);
        setError(err.message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow rounded transition-colors duration-300">
      <Helmet>
        <title>Registrieren – MyHome24app</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Konto erstellen</h2>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="Vorname" value={formData.firstName} onChange={handleChange} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" />
        <input name="lastName" placeholder="Nachname" value={formData.lastName} onChange={handleChange} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" />
        <input name="email" type="email" placeholder="E-Mail" value={formData.email} onChange={handleChange} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" />
        <input name="confirmEmail" type="email" placeholder="E-Mail bestätigen" value={formData.confirmEmail} onChange={handleChange} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" />

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Passwort"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
          />
          <div className="absolute right-2 top-2 cursor-pointer text-gray-500 dark:text-gray-300" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (<EyeSlashIcon className="h-5 w-5" />) : (<EyeIcon className="h-5 w-5" />)}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Passwort bestätigen"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
          />
          <div className="absolute right-2 top-2 cursor-pointer text-gray-500 dark:text-gray-300" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </div>
        </div>

        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="user">Nutzer</option>
          <option value="owner">Eigentümer</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200">
          Registrieren
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
