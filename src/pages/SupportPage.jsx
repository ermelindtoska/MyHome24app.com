import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const SupportPage = () => {
  const { t } = useTranslation('support');
  const [formData, setFormData] = useState({ name: '', email: '', message: '', category: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message, category } = formData;

    if (!name || !email || !message || !category) {
      setError(t('error'));
      return;
    }

    try {
      await addDoc(collection(db, 'supportMessages'), {
  name,
  email,
  category,
  message,
  status: 'active',
  createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '', category: '' });
      setError('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="mb-6 text-gray-700">{t('text')}</p>

      {submitted && <p className="text-green-600 mb-4">{t('confirmation')}</p>}
      {error && <p className="text-red-600">{t('error')}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('name')} className="w-full border p-2 rounded" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('email')} className="w-full border p-2 rounded" />
<select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
  <option disabled>{t('form.selectPlaceholder')}</option>
  <option value="technical">{t('form.category.technical')}</option>
  <option value="login">{t('form.category.login')}</option>
  <option value="listing">{t('form.category.listing')}</option>
  <option value="feedback">{t('form.category.feedback')}</option>
  <option value="other">{t('form.category.other')}</option>
</select>

        <textarea name="message" value={formData.message} onChange={handleChange} placeholder={t('form.messagePlaceholder')} className="w-full border p-2 rounded" rows={5} />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">{t('form.submitLabel')}</button>
      </form>
    </div>
  );
};

export default SupportPage;
