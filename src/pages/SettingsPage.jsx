import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { t } = useTranslation('settings');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
};

export default SettingsPage;
