// src/components/MakeOfferModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const MakeOfferModal = ({ isOpen, onClose, listing }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation('offers');

  const [price, setPrice] = useState(listing?.price || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error(t('loginRequired'));
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'offers'), {
        // lidhja me listingun
        listingId: listing?.id || null,
        listingTitle: listing?.title || '',
        listingCity: listing?.city || '',
        listingPrice: listing?.price ?? null,
        ownerId: listing?.ownerId || listing?.userId || null,
        ownerEmail: listing?.ownerEmail || null,

        // info për blerësin
        buyerId: currentUser.uid,
        buyerEmail: currentUser.email || null,
        buyerName: currentUser.displayName || '',

        // vetë oferta
        price: Number(price) || null,
        message: message || '',
        status: 'pending',

        createdAt: serverTimestamp(),
      });

      toast.success(t('toast.submitted'));
      onClose();
      setMessage('');
    } catch (err) {
      console.error('[MakeOfferModal] error saving offer:', err);
      toast.error(t('toast.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {t('modalTitle')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('modalIntro')}
        </p>

        {!currentUser && (
          <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">
            {t('loginRequired')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('priceLabel')}
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t('pricePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('messageLabel')}
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder')}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || !currentUser}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '…' : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

MakeOfferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  listing: PropTypes.object,
};

export default MakeOfferModal;
