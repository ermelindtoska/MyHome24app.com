// src/components/HomeSections/HeroSection.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import HeroSearch from "../HeroSearch";

const HeroSection = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative text-white py-20 md:py-28 overflow-hidden">
      {/* Background Image */}
      <img
        src="/images/myhomehintergrund.png"
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        loading="eager"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 via-blue-600/85 to-blue-900/95" />

      {/* Pattern (optional) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="max-w-3xl mx-auto md:mx-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
            {t("title")}
          </h1>

          <p className="text-base sm:text-lg md:text-xl mb-10 text-blue-100 max-w-2xl mx-auto md:mx-0">
            {t("subtitle")}
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto md:mx-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-2xl border border-white/20">
          <HeroSearch />
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
          <button
            onClick={() => scrollToSection("latest-listings")}
            className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-full font-semibold transition shadow-md hover:scale-105"
          >
            {t("exploreNow")}
          </button>

          <button
            onClick={() => navigate("/how-it-works")}
            className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-full font-semibold transition shadow-md hover:scale-105"
          >
            {t("howItWorks")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;