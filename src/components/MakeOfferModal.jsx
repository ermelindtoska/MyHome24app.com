// src/components/MakeOfferModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const MakeOfferModal = ({ isOpen, onClose, listing, ownerId, ownerEmail }) => {
  const { t } = useTranslation('offer');
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [financingType, setFinancingType] = useState('mortgage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !listing) return null;

  const resetStateAndClose = () => {
    setAmount('');
    setMessage('');
    setMoveInDate('');
    setFinancingType('mortgage');
    setIsSubmitting(false);
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    let parsedAmount = null;
    if (amount) {
      const num = Number(
        String(amount).replace('.', '').replace(',', '.'),
      );
      if (!Number.isFinite(num) || num <= 0) {
        setError(
          t('errors.invalidAmount', {
            defaultValue: 'Bitte gib einen gültigen Betrag ein.',
          }),
        );
        setIsSubmitting(false);
        return;
      }
      parsedAmount = Math.round(num);
    }

    try {
      await addDoc(collection(db, 'offers'), {
        ownerId: ownerId || listing.ownerId || listing.userId || null,
        ownerEmail: ownerEmail || listing.ownerEmail || listing.userEmail || null,

        listingId: listing.id,
        listingTitle: listing.title || '',
        listingCity: listing.city || '',
        listingType: listing.type || '',
        listingPurpose: listing.purpose || '',

        buyerId: currentUser.uid,
        buyerName: currentUser.displayName || '',
        buyerEmail: currentUser.email || '',

        amount: parsedAmount,
        currency: 'EUR',
        financingType,
        moveInDate: moveInDate || null,
        message: message || '',

        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err) {
      console.error('[MakeOfferModal] Error creating offer:', err);
      setError(
        t('errors.generic', {
          defaultValue:
            'Beim Senden des Angebots ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl border border-gray-200 dark:border-gray-700 relative">
        <button
          type="button"
          onClick={resetStateAndClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="px-6 pt-6 pb-5">
          <h2 className="text-lg font-semibold mb-1">
            {t('title', { defaultValue: 'Kaufangebot abgeben' })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {t('subtitle', {
              defaultValue:
                'Sende ein verbindliches Kaufangebot an die:den Anbieter:in dieser Immobilie.',
            })}
          </p>

          <div className="mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-200">
            <div className="font-semibold">
              {listing.title || t('listingFallback', { defaultValue: 'Inserat' })}
            </div>
            <div>
              {listing.city || ''}{' '}
              {listing.zipCode ? `(${listing.zipCode})` : ''}
            </div>
            {listing.price && (
              <div className="mt-1">
                {t('askingPrice', { defaultValue: 'Aktueller Angebotspreis' })}
                :{' '}
                <strong>
                  €{' '}
                  {Number(listing.price).toLocaleString('de-DE', {
                    maximumFractionDigits: 0,
                  })}
                </strong>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('fields.amount', { defaultValue: 'Dein Kaufpreis-Angebot' })}
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-950">
                <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800">
                  €
                </span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('placeholders.amount', {
                    defaultValue: 'z.B. 450.000',
                  })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('fields.financingType', {
                  defaultValue: 'Finanzierungsart',
                })}
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                value={financingType}
                onChange={(e) => setFinancingType(e.target.value)}
              >
                <option value="mortgage">
                  {t('financing.mortgage', {
                    defaultValue: 'Finanzierung über Hypothek',
                  })}
                </option>
                <option value="cash">
                  {t('financing.cash', { defaultValue: 'Bar / Eigenkapital' })}
                </option>
                <option value="other">
                  {t('financing.other', { defaultValue: 'Sonstiges' })}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('fields.moveInDate', {
                  defaultValue: 'Gewünschtes Einzugsdatum (optional)',
                })}
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('fields.message', {
                  defaultValue: 'Nachricht an den:die Anbieter:in (optional)',
                })}
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm min-h-[80px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('placeholders.message', {
                  defaultValue:
                    'Stell dich kurz vor und erkläre dein Angebot (z.B. Finanzierungszusagen, Flexibilität beim Einzug usw.).',
                })}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-emerald-500">
                {t('success', {
                  defaultValue:
                    'Dein Angebot wurde erfolgreich übermittelt. Die:der Anbieter:in wird sich bei dir melden.',
                })}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={resetStateAndClose}
                className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t('actions.cancel', { defaultValue: 'Abbrechen' })}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t('actions.submitting', {
                      defaultValue: 'Wird gesendet…',
                    })
                  : t('actions.submit', {
                      defaultValue: 'Angebot senden',
                    })}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferModal;
