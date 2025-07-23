// src/publish/PublishProperty.jsx
import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

const PublishProperty = () => {
  const { t } = useTranslation('property');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    type: '',
    purpose: 'buy',
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    if (!formData.image) {
      return setMessage(t('error_image_required'));
    }

    if (!auth.currentUser) {
      return setMessage(t('error_auth_required'));
    }

    setLoading(true);

    try {
      const imageRef = ref(storage, `listing-images/${uuidv4()}`);
      await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(imageRef);

      const listingData = {
        ...formData,
        imageUrl,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'listings'), listingData);
      setSuccess(true);
      setMessage(t('success_uploaded'));
      setFormData({
        title: '',
        description: '',
        price: '',
        city: '',
        type: '',
        purpose: 'buy',
        image: null,
      });
    } catch (error) {
      console.error(error);
      setMessage(t('error_upload'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-center dark:text-white">
        {t('publish_title')}
      </h2>

      {message && (
        <p
          className={`mb-4 text-center text-sm ${
            success ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder={t('title')}
          className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder={t('description')}
          className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white"
          required
        />

        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder={t('price')}
          className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white"
          required
        />

        <input
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
          placeholder={t('city')}
          className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white"
          required
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white"
          required
        >
          <option value="">{t('select_type')}</option>
          <option value="house">{t('house')}</option>
          <option value="apartment">{t('apartment')}</option>
          <option value="office">{t('office')}</option>
        </select>

        <select
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white"
        >
          <option value="buy">{t('buy')}</option>
          <option value="rent">{t('rent')}</option>
        </select>

        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full file:mr-4 file:py-2 file:px-4 file:border file:rounded file:text-sm file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-white hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
    </div>
  );
};

export default PublishProperty;
