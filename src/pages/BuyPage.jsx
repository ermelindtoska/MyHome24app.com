import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart } from 'react-icons/fi';

const BuyPage = () => {
  const { t } = useTranslation('buyPage');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <FiShoppingCart className="text-blue-600" />
        {t('title')}
      </h1>
      <p className="mt-4 text-gray-600">{t('description')}</p>
    </div>
  );
};

export default BuyPage;
