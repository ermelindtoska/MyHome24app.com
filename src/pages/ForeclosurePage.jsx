import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGavel, FaMoneyBillWave, FaRegFileAlt, FaHandshake } from 'react-icons/fa';
import foreclosureHeader from '../assets/foreclosure-header.png';

const ForeclosurePage = () => {
  const { t } = useTranslation('foreclosure');
  const features = t('features', { returnObjects: true });

  const icons = [
    <FaGavel className="text-red-600 mt-1" />,
    <FaMoneyBillWave className="text-green-600 mt-1" />,
    <FaRegFileAlt className="text-blue-600 mt-1" />,
    <FaHandshake className="text-purple-600 mt-1" />,
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Image */}
      <div className="rounded-xl overflow-hidden shadow-md mb-20">
        <img
          src={foreclosureHeader}
          alt={t('imageAlt')}
          className="w-full h-[400px] object-contain rounded-xl shadow-md"
        />
      </div>

      {/* Title and Description */}
      <h1 className="text-3xl font-extrabold text-red-700 mb-4">{t('title')}</h1>
      <p className="text-gray-800 mb-4 leading-relaxed">{t('description')}</p>

      {/* Feature List with Icons */}
      <ul className="space-y-4 mb-10 text-gray-800">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {icons[index]}
            <span><strong>{feature.title}:</strong> {feature.text}</span>
          </li>
        ))}
      </ul>

      {/* Tip Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700 mb-2">🔎 {t('tipTitle')}</h2>
        <p className="text-gray-700">{t('tipText')}</p>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <h3 className="text-blue-800 font-bold text-xl mb-2">{t('ready')}</h3>
        <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default ForeclosurePage;
