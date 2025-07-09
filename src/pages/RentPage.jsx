// src/pages/RentPage.jsx
import React from 'react';
import GermanyMapReal from '../pages/GermanyMapReal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RentPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('navbar');

  return (
    <>
      <GermanyMapReal purpose="rent" />

      {/* Butoni “Show Map” në fund të ekranit vetëm në mobile */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => navigate('/map')}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {t('showMap')}
        </button>
      </div>
    </>
  );
};

export default RentPage;
