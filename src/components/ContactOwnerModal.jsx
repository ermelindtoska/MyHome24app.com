// src/components/ContactOwnerModal.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const ContactOwnerModal = ({ isOpen, onClose, ownerEmail, listing }) => {
  const { t } = useTranslation('contact');
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm((prev) => ({
      ...prev,
      name: currentUser?.displayName || '',
      email: currentUser?.email || '',
    }));
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        listingId: listing?.id || listing?.listingId || null,
        listingTitle: listing?.title || '',
        ownerEmail: ownerEmail || null,
        ownerId: listing?.ownerId || listing?.userId || null,
        userId: currentUser?.uid || null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        sentAt: serverTimestamp(),
      });

      alert(t('success'));
      onClose();
    } catch (err) {
      console.error('[ContactOwnerModal] Fehler beim Senden:', err);
      alert(t('error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">
          {t('title', { defaultValue: 'Verkäufer kontaktieren' })}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-medium mb-1">
              {t('fields.name')}
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              {t('fields.email')}
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              {t('fields.phone')}
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              {t('fields.message')}
            </label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? t('buttons.sending') : t('buttons.send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactOwnerModal;
