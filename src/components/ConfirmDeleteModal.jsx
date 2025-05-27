// src/components/ConfirmDeleteModal.jsx
import React from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ConfirmDeleteModal = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-lg">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>
        <div className="flex items-center mb-4 gap-3">
          <FiTrash2 className="text-red-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">{t('confirm.title')}</h2>
        </div>
        <p className="text-gray-700 mb-6">{t('confirm.message')}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            {t('confirm.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('confirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
