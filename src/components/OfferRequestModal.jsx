// src/components/OfferRequestModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const OfferRequestModal = ({ isOpen, onClose, listing }) => {
  const { t } = useTranslation('offers');
  const { currentUser } = useAuth() || {};

  const [form, setForm] = useState({
    amount: '',
    financing: '',
    moveInDate: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  if (!isOpen || !listing) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'offers'), {
        listingId: listing.id,
        ownerId: listing.ownerId || listing.userId || null,
        ownerEmail: listing.ownerEmail || null,
        buyerId: currentUser?.uid || null,
        buyerEmail: currentUser?.email || null,
        amount: Number(form.amount) || form.amount,
        financing: form.financing,
        moveInDate: form.moveInDate || null,
        message: form.message,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert(
        t('submitSuccess', {
          defaultValue: 'Dein Angebot wurde übermittelt.',
        })
      );
      onClose?.();
    } catch (err) {
      console.error('[OfferRequestModal] error:', err);
      alert(
        t('submitError', {
          defaultValue: 'Fehler beim Senden des Angebots.',
        })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('title', { defaultValue: 'Kaufangebot abgeben' })}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {listing.title} – {listing.city}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('fields.amount', { defaultValue: 'Angebotspreis (€)' })}
            </label>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('fields.financing', { defaultValue: 'Finanzierung' })}
            </label>
            <input
              name="financing"
              value={form.financing}
              onChange={handleChange}
              placeholder={t('fields.financingPlaceholder', {
                defaultValue: 'z.B. 20 % Eigenkapital, Rest Finanzierung…',
              })}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('fields.moveInDate', { defaultValue: 'Gewünschter Einzugstermin' })}
            </label>
            <input
              name="moveInDate"
              type="date"
              value={form.moveInDate}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('fields.message', { defaultValue: 'Nachricht (optional)' })}
            </label>
            <textarea
              name="message"
              rows={3}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 disabled:opacity-60"
          >
            {sending
              ? t('sending', { defaultValue: 'Wird gesendet…' })
              : t('submit', { defaultValue: 'Angebot senden' })}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferRequestModal;
