// src/pages/RentPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome } from 'react-icons/fi';

const RentPage = () => {
  const { t } = useTranslation('rent');

  return (
    <div className="min-h-screen px-4 py-10 text-center">
      <div className="flex justify-center mb-4">
        <FiHome className="text-blue-600" size={32} />
      </div>
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="text-gray-700 max-w-2xl mx-auto">{t('description')}</p>
    </div>
  );
};

export default RentPage;
