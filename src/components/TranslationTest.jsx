import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationTest = () => {
  const { t } = useTranslation('compare');

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-2">Test i Përkthimit (compare)</h2>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        <li>{t('filters.city')}</li>
        <li>{t('actions.copy')}</li>
        <li>{t('copied')}</li>
        <li>{t('noData')}</li>
        <li>{t('title')}</li>
      </ul>
    </div>
  );
};

export default TranslationTest;