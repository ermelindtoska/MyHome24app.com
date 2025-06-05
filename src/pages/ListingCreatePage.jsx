import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

const ListingCreatePage = () => {
  const { t } = useTranslation('listingForm');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    city: '',
    type: '',
    purpose: '',
    price: '',
    imageUrl: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'listings'), {
        ...form,
        createdAt: Timestamp.now(),
        userId: auth.currentUser?.uid || '',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Gabim gjatë krijimit:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('createTitle')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder={t('title')} onChange={handleChange} className="input" required />
        <input name="city" placeholder={t('city')} onChange={handleChange} className="input" required />
        <input name="type" placeholder={t('type')} onChange={handleChange} className="input" required />
        <input name="purpose" placeholder={t('purpose')} onChange={handleChange} className="input" required />
        <input name="price" placeholder={t('price')} onChange={handleChange} className="input" required />
        <input name="imageUrl" placeholder={t('imageUrl')} onChange={handleChange} className="input" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {t('submit')}
        </button>
      </form>
    </div>
  );
};

export default ListingCreatePage;
