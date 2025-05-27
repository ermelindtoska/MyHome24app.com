// src/components/ContactOwnerModal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ContactOwnerModal = ({ listing, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <FiX size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">{t('contact.title')}</h2>
        <p><strong>{t('contact.object')}:</strong> {listing.title}</p>
        <p className="mt-2 text-sm text-gray-600">{t('contact.description')}</p>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('contact.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactOwnerModal;
