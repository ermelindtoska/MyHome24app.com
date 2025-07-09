import React from "react";
import HeroSection from "../components/HomeSections/HeroSection";
import LatestListingsSection from "../components/HomeSections/LatestListingsSection";
import AgentsSection from "../components/HomeSections/AgentsSection";
import TestimonialsSection from "../components/HomeSections/TestimonialsSection";
import ContactSection from "../components/HomeSections/ContactSection";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('navbar');

  return (
    <>
      <Helmet>
        <title>MyHome24App - Home</title>
        <meta
          name="description"
          content="The most advanced platform for buying, selling and renting real estate in Germany."
        />
        <meta
          name="keywords"
          content="immobilien, real estate, germany, buy, rent, sell, myhome24app"
        />
        <meta property="og:title" content="MyHome24App" />
        <meta
          property="og:description"
          content="Find your dream property quickly and easily."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800">
        <HeroSection />
        <LatestListingsSection />
        <AgentsSection />
        <TestimonialsSection />
        <ContactSection />
      </div>

      {/* 🌍 Show Map button — visible only on mobile */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%]">
        <button
          onClick={() => navigate('/map')}
          className="w-full bg-blue-600 text-white py-3 text-center rounded-full shadow-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          🌍 {t('showMapButton')}
        </button>
      </div>
    </>
  );
};

export default HomePage;
