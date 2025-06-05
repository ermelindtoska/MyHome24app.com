// src/pages/HousePage.jsx
import React from 'react';
import houseImg from '../assets/house-living.png';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';

const HousePage = () => {
  const { t } = useTranslation('house');

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={houseImg}
          alt={t('imgAlt')}
          className="w-full h-[500px] object-contain rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-green-700 mb-6">{t('title')}</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">{t('description')}</p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>{t('features.0.title')}:</strong> {t('features.0.text')}</li>
        <li><strong>{t('features.1.title')}:</strong> {t('features.1.text')}</li>
        <li><strong>{t('features.2.title')}:</strong> {t('features.2.text')}</li>
        <li><strong>{t('features.3.title')}:</strong> {t('features.3.text')}</li>
      </ul>

      <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-md shadow-sm">
        <h2 className="text-green-800 font-semibold mb-2">{t('tipTitle')}</h2>
        <p className="text-gray-700">{t('tipText')}</p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default HousePage;
