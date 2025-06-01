import React from 'react';
import { useTranslation } from 'react-i18next';

const FAQPage = () => {
  const { t } = useTranslation('help');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('faqTitle')}</h1>
      <p className="text-gray-700">{t('faqIntro')}</p>Hier beantworten wir die häufigsten Fragen unserer Nutzer*innen.
    </div>
  );
};

export default FAQPage;
