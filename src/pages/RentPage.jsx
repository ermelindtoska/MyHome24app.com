// src/pages/RentPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaCity,
  FaEuroSign,
  FaShieldAlt,
  FaMapMarkedAlt,
} from "react-icons/fa";

import GermanyMapReal from "./GermanyMapReal"; // si te kodi yt i vjetër
import SiteMeta from "../components/SEO/SiteMeta";

const RentPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("rent");

  // SEO
  const title =
    t("metaTitle", {
      defaultValue: "Wohnungen & Häuser mieten in Deutschland – MyHome24App",
    }) ||
    "Wohnungen & Häuser mieten in Deutschland – MyHome24App";

  const description =
    t("metaDescription", {
      defaultValue:
        "Finde Mietwohnungen und Häuser in ganz Deutschland. Kartenansicht, smarte Filter und Vergleich – schnell wie bei Zillow, lokalisiert für DE.",
    }) ||
    "Finde Mietwohnungen und Häuser in ganz Deutschland. Kartenansicht, smarte Filter und Vergleich – schnell wie bei Zillow, lokalisiert für DE.";

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/rent`;

  // për seksionin e benefiteve
  const benefitItems = t("benefits.items", {
    returnObjects: true,
    defaultValue: [],
  });

  const icons = [
    <FaCity className="text-indigo-400 text-xl mt-1" />,
    <FaEuroSign className="text-emerald-400 text-xl mt-1" />,
    <FaShieldAlt className="text-yellow-400 text-xl mt-1" />,
  ];

  const handleGoToMap = () => {
    // te ty ruta e hartës është /map – filtrat i ke brenda GermanyMapReal
    navigate("/map");
  };

  const handleScrollToBenefits = () => {
    const el = document.getElementById("rent-benefits");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* SEO meta */}
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        ogImage={`${window.location.origin}/og/og-rent.jpg`}
        lang={lang}
      />

      {/* HERO si te faqe neubau/foreclosures/owner */}
      <section className="bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <p className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-white/10 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
              {t("hero.badge")}
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              {t("hero.title")}
            </h1>

            <p className="text-sm md:text-base text-blue-100 max-w-xl mb-6">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGoToMap}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold text-sm shadow-md hover:bg-blue-50 transition"
              >
                <FaMapMarkedAlt className="mr-2" />
                {t("hero.ctaPrimary")}
              </button>

              <button
                type="button"
                onClick={handleScrollToBenefits}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-white/60 text-white text-sm font-semibold hover:bg-white/10 transition"
              >
                {t("hero.ctaSecondary")}
              </button>
            </div>
          </div>

          {/* "mock" card në të djathtë – pa imazh që të mos kemi probleme me importe */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 md:p-5 shadow-lg border border-white/20">
              <p className="text-xs uppercase tracking-wide text-blue-100 mb-1">
                {t("hero.highlight.label")}
              </p>
              <p className="text-lg font-semibold mb-2">
                {t("hero.highlight.title")}
              </p>
              <p className="text-sm text-blue-100 mb-4">
                {t("hero.highlight.text")}
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs text-center">
                <div className="bg-black/10 rounded-xl py-2">
                  <div className="font-bold">
                    {t("hero.highlight.chips")}
                  </div>
                  <div className="text-[10px] text-blue-100">
                    {t("hero.highlight.chipsLabel")}
                  </div>
                </div>
                <div className="bg-black/10 rounded-xl py-2">
                  <div className="font-bold">
                    {t("hero.highlight.rooms")}
                  </div>
                  <div className="text-[10px] text-blue-100">
                    {t("hero.highlight.roomsLabel")}
                  </div>
                </div>
                <div className="bg-black/10 rounded-xl py-2">
                  <div className="font-bold">
                    {t("hero.highlight.flex")}
                  </div>
                  <div className="text-[10px] text-blue-100">
                    {t("hero.highlight.flexLabel")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS – si seksionet e teksteve te faqe të tjera */}
      <section
        id="rent-benefits"
        className="bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800"
      >
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-slate-900 dark:text-slate-50">
            {t("benefits.title")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-3xl">
            {t("benefits.intro")}
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {benefitItems.map((item, index) => (
              <article
                key={index}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  {icons[index] || (
                    <FaCity className="text-indigo-400 text-xl mt-1" />
                  )}
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SEKSIONI I HARTËS – GermanyMapReal ekzistues */}
      <section className="bg-slate-900/90 dark:bg-black">
        <div className="max-w-6xl mx-auto px-0 md:px-4 py-8 md:py-10">
          <div className="flex items-center justify-between px-4 md:px-0 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {t("mapSection.title")}
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl">
                {t("mapSection.text")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoToMap}
              className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              <FaMapMarkedAlt className="mr-2" />
              {t("mapSection.button")}
            </button>
          </div>

          {/* Harta me filtrin "rent" – komponenti yt ekzistues */}
          <div className="border-t border-slate-700">
            <GermanyMapReal purpose="rent" />
          </div>
        </div>
      </section>

      {/* Butoni “Show Map” në mobile – si te kodi yt i vjetër */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={handleGoToMap}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {t("mapSection.buttonMobile")}
        </button>
      </div>
    </>
  );
};

export default RentPage;
