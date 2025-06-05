import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorksPage = () => {
  const { t } = useTranslation('howItWorks');
  const steps = t('steps', { returnObjects: true });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
};

export default HowItWorksPage;
