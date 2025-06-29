import React from 'react';
import { useTranslation } from 'react-i18next';

const CompareModal = ({ onClose, listing }) => {
  const { t } = useTranslation('compare');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">{listing.title}</h2>
        <p>{t('description')}: {listing.description}</p>
        <p>{t('location')}: {listing.city}</p>
        <p>{t('price')}: {listing.price} €</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">{t('actions.close') || 'Close'}</button>
      </div>
    </div>
  );
};

export default CompareModal;