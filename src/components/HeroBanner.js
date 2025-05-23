// src/components/HeroBanner.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const HeroBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-blue-50 py-10 mb-10">
      <div className="max-w-5xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">{t('heroTitle')}</h2>
        <p className="text-gray-600 text-lg">{t('heroSubtitle')}</p>
      </div>
    </section>
  );
};

export default HeroBanner;