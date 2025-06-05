import React from 'react';
import { useTranslation } from 'react-i18next';
import ownerHeader from '../assets/owner-header.png';
import { FaHandshake, FaUser, FaCommentDots, FaEye } from 'react-icons/fa';

const OwnerPage = () => {
  const { t } = useTranslation('owner');
  const features = t('features', { returnObjects: true });

  const icons = [
    <FaHandshake className="text-green-500 mt-1" />,
    <FaUser className="text-blue-500 mt-1" />,
    <FaCommentDots className="text-purple-500 mt-1" />,
    <FaEye className="text-orange-500 mt-1" />
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="rounded-xl overflow-hidden shadow-md mb-8">
        <img
          src={ownerHeader}
          alt={t('imageAlt')}
          className="w-full h-[500px] object-contain rounded-xl shadow-md"
        />
      </div>

      <h1 className="text-3xl font-extrabold text-blue-800 mb-4">{t('title')}</h1>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 shadow-sm">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">{t('tipTitle')}</h2>
        <p className="text-gray-700">{t('tipText')}</p>
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-blue-800 font-bold text-xl mb-2">{t('ready')}</h3>
        <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default OwnerPage;
