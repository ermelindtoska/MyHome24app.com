import React from 'react';
import { useTranslation } from 'react-i18next';

const CompareItem = ({ listing }) => {
  const { t } = useTranslation('compare');

  return (
    <div className="border rounded p-4 shadow hover:shadow-lg">
      <h4 className="font-semibold text-lg">{listing.title}</h4>
      <p>{t('location')}: {listing.city}</p>
      <p>{t('price')}: {listing.price} €</p>
      <p>{t('rooms')}: {listing.rooms}</p>
      <p>{t('area')}: {listing.size} m²</p>
    </div>
  );
};

export default CompareItem;