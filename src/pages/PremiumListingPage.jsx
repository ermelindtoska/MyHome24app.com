import React from 'react';
import { useTranslation } from 'react-i18next';
import premiumImg from '../assets/premium-listing.png';
import logo from '../assets/logo.png';
import { FaStar, FaPaintBrush, FaImages, FaChartBar } from 'react-icons/fa';

const PremiumListingPage = () => {
  const { t } = useTranslation('premiumListing');
  const features = t('features', { returnObjects: true });

  const icons = [
    <FaStar className="text-yellow-500 mt-1" />,
    <FaPaintBrush className="text-pink-500 mt-1" />,
    <FaImages className="text-indigo-500 mt-1" />,
    <FaChartBar className="text-green-600 mt-1" />
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={premiumImg}
          alt={t('imageAlt')}
          className="w-full h-[570px] object-cover object-top rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-indigo-700 mb-6">{t('title')}</h1>
      <p className="text-gray-800 mb-4 leading-relaxed">{t('description')}</p>

      <ul className="text-gray-800 space-y-2 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {icons[index]}
            <span>
              <strong>{feature.title}:</strong> {feature.text}
            </span>
          </li>
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

export default PremiumListingPage;
