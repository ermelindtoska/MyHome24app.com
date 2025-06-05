// src/pages/BuyPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart } from 'react-icons/fi';
import houseImage from '../assets/buy-house.png'; // sigurohu që ekziston kjo foto

const BuyPage = () => {
  const { t } = useTranslation('buy');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex flex-col items-center mb-8">
          <FiShoppingCart className="text-blue-600 text-5xl mb-2" />
          <h1 className="text-4xl font-bold text-gray-800">{t('title')}</h1>
          <p className="text-gray-600 mt-2 max-w-xl">{t('description')}</p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-lg max-w-3xl mx-auto">
          <img
            src={houseImage}
            alt="Buy a property"
            className="w-full h-120 object-cover"
          />
        </div>

        <div className="mt-10 text-left max-w-3xl mx-auto text-gray-700 leading-relaxed space-y-4">
          <p>
            {t('info1', 'Bei uns finden Sie eine große Auswahl an Immobilien zum Kauf – von modernen Stadtwohnungen bis zu idyllischen Landhäusern.')}
          </p>
          <p>
            {t('info2', 'Wir unterstützen Sie auf dem gesamten Weg: von der Suche bis zur Schlüsselübergabe.')}
          </p>
          <p>
            {t('info3', 'Nutzen Sie unsere Filteroptionen, um genau das Objekt zu finden, das zu Ihnen passt.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
