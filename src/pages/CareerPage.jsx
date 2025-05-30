import React from 'react';
import { useTranslation } from 'react-i18next';

const CareerPage = () => {
  const { t } = useTranslation('footer');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('career')}</h1>
      <p className="text-gray-700">Hier findest du zukünftige Karrieremöglichkeiten bei MyHome24App.</p>
    </div>
  );
};

export default CareerPage;
