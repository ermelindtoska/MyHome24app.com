import React from 'react';
import { useTranslation } from 'react-i18next';
import newConstructionImg from '../assets/new-construction.png';
import { FaSolarPanel, FaHome, FaUserShield, FaPhoneAlt } from 'react-icons/fa';

const NewConstructionPage = () => {
  const { t } = useTranslation('newConstruction');

  const features = t('features', { returnObjects: true });

  const icons = [
    <FaSolarPanel className="text-green-500 mt-1" />,
    <FaHome className="text-orange-500 mt-1" />,
    <FaUserShield className="text-purple-600 mt-1" />,
    <FaPhoneAlt className="text-blue-500 mt-1" />,
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <img
        src={newConstructionImg}
        alt="New Construction"
        className="w-full h-[400px] object-contain rounded-xl shadow-md"
      />

      <h1 className="text-4xl font-bold text-blue-900 mb-4">{t('title')}</h1>
      <p className="text-gray-800 text-lg mb-6 leading-relaxed">{t('description')}</p>

      <ul className="text-gray-700 space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {icons[index]}
            <span>
              <strong>{feature.title}:</strong> {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">{t('tipTitle')}</h2>
        <p className="text-blue-900">{t('tipText')}</p>
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold text-blue-900 mb-4">{t('ready')}</p>
        <button className="px-6 py-3 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800 transition duration-200">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default NewConstructionPage;
