import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { t } = useTranslation('footer');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('terms')}</h1>
      <p className="text-gray-700">Hier steht später der vollständige Text für die Nutzungsbedingungen.</p>
    </div>
  );
};

export default TermsPage;
