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
    if (!formData.image) return setMessage(t('error_image_required'));

    setLoading(true);
    setMessage('');

    try {
      const imageRef = ref(storage, `listing-images/${uuidv4()}`);
      await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(imageRef);

      const listingData = {
        ...formData,
        imageUrl,
        userId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'listings'), listingData);
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
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">{t('publish_title')}</h2>

      {message && (
        <p className="mb-4 text-sm text-center text-red-500 dark:text-green-400">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          type="text"
          placeholder={t('title')}
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <textarea
          name="description"
          placeholder={t('description')}
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <input
          name="price"
          type="number"
          placeholder={t('price')}
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <input
          name="city"
          type="text"
          placeholder={t('city')}
          value={formData.city}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="buy">{t('buy')}</option>
          <option value="rent">{t('rent')}</option>
        </select>
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
    </div>
  );
};

export default PublishProperty;
