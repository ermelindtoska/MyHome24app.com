import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const RegisterForm = () => {
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

    if (email !== confirmEmail) return setError("Emails don't match");
    if (password !== confirmPassword) return setError("Passwords don't match");

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

      await sendEmailVerification(user);

      navigate('/register-success');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow rounded">
      <Helmet>
        <title>Register – MyHome24app</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="confirmEmail" type="email" placeholder="Confirm Email" value={formData.confirmEmail} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className="w-full p-2 border rounded" />
        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="user">User</option>
          <option value="owner">Owner</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
