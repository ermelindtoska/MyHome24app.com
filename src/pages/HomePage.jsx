// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HeroSection from "../components/HomeSections/HeroSection";
import LatestListingsSection from "../components/HomeSections/LatestListingsSection";
import AgentsSection from "../components/HomeSections/AgentsSection";
import TestimonialsSection from "../components/HomeSections/TestimonialsSection";
import ContactSection from "../components/HomeSections/ContactSection";
import SiteMeta from "../components/SEO/SiteMeta";

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["home", "navbar"]);

  const title =
    t("metaTitle", {
      ns: "home",
      defaultValue: "Immobilien kaufen & mieten in Deutschland",
    }) || "Immobilien kaufen & mieten in Deutschland";

  const description =
    t("metaDescription", {
      ns: "home",
      defaultValue:
        "MyHome24App – die moderne Plattform für Immobilien in Deutschland. Finden Sie Ihr perfektes Zuhause.",
    }) ||
    "MyHome24App – die moderne Plattform für Immobilien in Deutschland. Finden Sie Ihr perfektes Zuhause.";

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <SiteMeta
        title={title}
        description={description}
        canonical={origin ? `${origin}/` : undefined}
        ogImage={origin ? `${origin}/og/og-home.jpg` : undefined}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
        {/* HERO */}
        <section className="relative">
          <HeroSection />
        </section>

        {/* CONTENT WRAPPER */}
        <div className="relative z-10">
          {/* Latest Listings */}
          <section
            id="latest-listings"
            className="scroll-mt-24 border-t border-slate-200/70 bg-white/70 py-12 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/30 md:py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <LatestListingsSection />
            </div>
          </section>

          {/* Agents */}
          <section
            id="agents"
            className="scroll-mt-24 py-12 md:py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:p-6">
                <AgentsSection />
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="testimonials"
            className="scroll-mt-24 py-12 md:py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 md:p-6">
                <TestimonialsSection />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section
            id="contact"
            className="scroll-mt-24 py-12 pb-24 md:py-16 md:pb-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
                <ContactSection />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* MOBILE STICKY MAP BUTTON */}
      <div className="md:hidden fixed bottom-4 left-1/2 z-50 w-[92%] -translate-x-1/2">
        <button
          type="button"
          onClick={() => navigate("/map")}
          className="w-full rounded-full bg-blue-600 px-5 py-3 text-center text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
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