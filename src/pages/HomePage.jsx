// src/pages/HomePage.jsx
import React from "react";
import HeroSection from "../components/HomeSections/HeroSection";
import LatestListingsSection from "../components/HomeSections/LatestListingsSection";
import AgentsSection from "../components/HomeSections/AgentsSection";
import TestimonialsSection from "../components/HomeSections/TestimonialsSection";
import ContactSection from "../components/HomeSections/ContactSection";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";


const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("home");

  const title =
    t("metaTitle", {
      defaultValue: "Immobilien kaufen & mieten in Deutschland",
    }) || "Immobilien kaufen & mieten in Deutschland";

  const description =
    t("metaDescription", {
      defaultValue:
        "MyHome24App – die moderne Plattform für Immobilien in Deutschland. Finden Sie Ihr perfektes Zuhause.",
    }) ||
    "MyHome24App – die moderne Plattform für Immobilien in Deutschland. Finden Sie Ihr perfektes Zuhause.";

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <SiteMeta
        title={title}
        description={description}
        canonical={origin ? `${origin}/` : undefined}
        ogImage={origin ? `${origin}/og/og-home.jpg` : undefined}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800">
        <HeroSection />

        {/* Seksionet e tjera me id për scroll (Explore Now nga Hero) */}
        <section id="latest-listings">
          <LatestListingsSection />
        </section>

        <section id="agents">
          <AgentsSection />
        </section>

        <section id="testimonials">
          <TestimonialsSection />
        </section>

        <section id="contact">
          <ContactSection />
        </section>
      </div>

      {/* 🌍 Show Map button — vetëm në mobile */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%]">
        <button
          onClick={() => navigate("/map")}
          className="w-full bg-blue-600 text-white py-3 text-center rounded-full shadow-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          🌍{" "}
          {t("showMapButton", {
            ns: "navbar",
            defaultValue: "Karte anzeigen",
          })}
        </button>
      </div>
    </>
  );
};

export default HomePage;
