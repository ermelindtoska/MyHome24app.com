import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const CompareDetails = () => {
  const { t } = useTranslation('compare');
  const { state } = useLocation();
  const listing = state?.listing;

  if (!listing) {
    return <div className="p-6">{t('noData')}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{listing.title}</h2>
      <p>{t('location')}: {listing.city}</p>
      <p>{t('price')}: {listing.price} €</p>
      <p>{t('area')}: {listing.size} m²</p>
      <p>{t('description')}: {listing.description}</p>
    </div>
  );
};

export default CompareDetails;
