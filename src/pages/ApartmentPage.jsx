import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdApartment } from 'react-icons/md';
import apartmentImg from '../assets/apartment-living.png';
import logo from '../assets/logo.png';

const ApartmentPage = () => {
  const { t } = useTranslation('apartment');

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Helmet>
        <title>{t('title')} – MyHome24</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      <div className="relative mb-8">
        <img
          src={apartmentImg}
          alt={t('title')}
          className="w-full h-[500px] object-contain rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <div className="flex items-center mb-4">
        <MdApartment className="text-indigo-600 text-3xl mr-2" />
        <h1 className="text-3xl font-bold text-indigo-700">{t('title')}</h1>
      </div>

      <p className="text-gray-800 mb-4 leading-relaxed">{t('description')}</p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        {t('features', { returnObjects: true }).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <div className="mt-8 bg-indigo-50 border border-indigo-200 p-6 rounded-md shadow-sm">
        <h2 className="text-indigo-800 font-semibold mb-2">{t('tipTitle')}</h2>
        <p className="text-gray-700">{t('tipText')}</p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default ApartmentPage;
