// src/components/HomeSections/HeroSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSearch from './HeroSearch';

const HeroSection = () => {
  const { t } = useTranslation('home');

  return (
    <section className="relative text-white py-16 md:py-24 overflow-hidden">
      {/* background image nga public/images */}
      <img
        src="/images/myhomehintergrund.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* overlay që e bën tekstin të lexueshëm (ndrysho % sipas qejfit) */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/90 to-blue-800/90" />

      {/* pattern (opsionale) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t('title')}</h1>
        <p className="text-lg md:text-xl mb-10 text-blue-100 max-w-2xl mx-auto">{t('subtitle')}</p>
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
          <HeroSearch />
        </div>
        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-full font-semibold transition"
          >
            {t('exploreNow')}
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-full font-semibold transition"
          >
            {t('howItWorks')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
