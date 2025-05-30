import React from 'react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-blue-600 text-white py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg">{t('subtitle')}</p>
    </section>
  );
};

export default HeroSection;
