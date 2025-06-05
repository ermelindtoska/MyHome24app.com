import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdPrivacyTip, MdShield } from 'react-icons/md';

const PrivacyPage = () => {
  const { t } = useTranslation('privacy'); // e ndryshojmë nga 'footer' në 'privacy'

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Helmet>
        <title>{t('title')} – MyHome24</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      <div className="flex items-center mb-6">
        <MdPrivacyTip className="text-blue-600 text-3xl mr-2" />
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <p className="text-gray-700 flex items-center mb-4">
        <MdShield className="text-blue-600 mr-2" />
        {t('description')}
      </p>

      {/* Këtu mund të shtosh më shumë seksione në të ardhmen */}
    </div>
  );
};

export default PrivacyPage;
