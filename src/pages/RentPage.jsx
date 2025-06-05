// src/pages/RentPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome } from 'react-icons/fi';
import rentImage from '../assets/rent-banner.png'; // vendosim foton e gjeneruar aty

const RentPage = () => {
  const { t } = useTranslation('rent');

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto text-center">
      <div className="flex flex-col items-center gap-4 mb-6">
        <FiHome className="text-blue-600" size={48} />
        <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-gray-600 max-w-xl">{t('description')}</p>
      </div>
      <img
        src={rentImage}
        alt="Rent Banner"
        className="rounded-xl shadow-md w-full max-h-[400px] object-cover"
      />
    </div>
  );
};

export default RentPage;
