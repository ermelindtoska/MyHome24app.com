import React from 'react';
import { useTranslation } from 'react-i18next';

const CompareHeader = () => {
  const { t } = useTranslation('compare');
  return (
    <header className="text-center py-6">
      <h1 className="text-3xl font-bold">{t('compareTitle')}</h1>
    </header>
  );
};

export default CompareHeader;