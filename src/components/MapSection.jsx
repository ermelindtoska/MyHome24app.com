import React from 'react';
import { useTranslation } from 'react-i18next';

const MapSection = () => {
  const { t } = useTranslation('map');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      <p>{t('description')}</p>
      {/* Future: Integrate map iframe or component here */}
    </div>
  );
};

export default MapSection;
