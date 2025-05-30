import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { t } = useTranslation('footer');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('privacy')}</h1>
      <p className="text-gray-700">Unsere Datenschutzrichtlinie erklärt, wie wir mit deinen Daten umgehen.</p>
    </div>
  );
};

export default PrivacyPage;
