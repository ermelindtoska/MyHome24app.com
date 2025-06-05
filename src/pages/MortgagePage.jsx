// src/pages/MortgagePage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaPercentage } from 'react-icons/fa';
import mortgageImage from '../assets/mortgage.png';

const MortgagePage = () => {
  const { t } = useTranslation('mortgage');

  return (
    <div className="max-w-5xl mx-auto p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <FaPercentage className="text-blue-600" size={36} />
        <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-gray-600 max-w-2xl text-lg">{t('description')}</p>
        <img
          src={mortgageImage}
          alt="mortgage overview"
          className="rounded-xl shadow-md mt-6 w-full max-w-3xl"
        />
      </div>
    </div>
  );
};

export default MortgagePage;
