import React from 'react';
import { useTranslation } from 'react-i18next';
import bankPartnerImg from '../assets/bank-partners.png';
import logo from '../assets/logo.png';
import { FaUserTie, FaCheckCircle, FaHandshake, FaClipboardList } from 'react-icons/fa';

const BankPartnersPage = () => {
  const { t } = useTranslation('bankPartners');
  const features = t('features', { returnObjects: true });

  const icons = [
    <FaClipboardList className="text-blue-500 mt-1" />,
    <FaCheckCircle className="text-green-600 mt-1" />,
    <FaHandshake className="text-purple-500 mt-1" />,
    <FaUserTie className="text-orange-500 mt-1" />
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={bankPartnerImg}
          alt={t('imageAlt')}
          className="w-full h-[500px] object-cover object-top rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-green-700 mb-6">{t('title')}</h1>
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

      <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-md shadow-sm">
        <h2 className="text-green-800 font-semibold mb-2">{t('tipTitle')}</h2>
        <p className="text-gray-700">{t('tipText')}</p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default BankPartnersPage;
