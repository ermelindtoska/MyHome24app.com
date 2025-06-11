import React from 'react';
import { useTranslation } from 'react-i18next';

const ImpressumPage = () => {
  const { t } = useTranslation('impressum');

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <p className="mb-4">{t('provider')}<br />{t('name')}<br />{t('address')}</p>
      <p className="mb-4"><strong>{t('represented')}</strong></p>
      <p className="mb-4"><strong>{t('contact')}:</strong><br />{t('phone')}<br />{t('email')}</p>
      <p className="mb-4"><strong>{t('vat')}</strong></p>
      <p>
        <strong>{t('liability')}</strong><br />
        {t('liabilityText')}
      </p>
    </div>
  );
};

export default ImpressumPage;
