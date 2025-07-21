import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const ContactForm = ({ listingId, ownerEmail, listingTitle }) => {
  const { t } = useTranslation('contact');
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) return;

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        listingId,
        listingTitle,
        ownerEmail,
        sentAt: serverTimestamp(),
        userId: user?.uid || null
      });

      setSubmitted(true);
    } catch (error) {
      console.error('❌ Error sending contact message:', error);
    }
  };

  if (submitted) {
    return (
      <p className="text-green-600 dark:text-green-400 font-medium">
        {t('contactForm.successMessage')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {t('contactForm.contactOwner')} {listingTitle && `: ${listingTitle}`}
      </h3>

      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
          {t('contactForm.name')}
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
          {t('contactForm.email')}
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
          {t('contactForm.message')}
        </label>
        <textarea
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition"
      >
        {t('contactForm.send')}
      </button>
    </form>
  );
};

export default ContactForm;
