// src/pages/ApartmentPage.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaDoorOpen,
  FaRulerCombined,
  FaBuilding,
} from "react-icons/fa";

import SiteMeta from "../components/SEO/SiteMeta";

import apartmentImg from "../assets/apartment-living.png";
import logo from "../assets/logo.png";

const ApartmentPage = () => {
  const { t, i18n } = useTranslation("apartment");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/rent/apartment`;

  const title =
    t("metaTitle", {
      defaultValue: "Wohnungen mieten in Deutschland – Apartments – MyHome24App",
    }) || "Wohnungen mieten in Deutschland – Apartments – MyHome24App";

  const description =
    t("metaDescription", {
      defaultValue:
        "Moderne Apartments in Top-Lagen: entdecke 1–5 Zimmer Wohnungen, flexible Miete, Karte, Filter und Vergleich wie bei Zillow.",
    }) || "Moderne Apartments in Top-Lagen: entdecke 1–5 Zimmer Wohnungen.";

  // ✅ robust: gjithmonë array
  const benefits = (t("benefits.items", { returnObjects: true }) || []).filter(
    Boolean
  );

  // ✅ robust icons: fallback për çdo indeks
  const icons = useMemo(
    () => [
      <FaBuilding key="i1" className="text-indigo-500 dark:text-indigo-300 text-xl mt-1" />,
      <FaRulerCombined key="i2" className="text-emerald-500 dark:text-emerald-300 text-xl mt-1" />,
      <FaDoorOpen key="i3" className="text-amber-500 dark:text-amber-300 text-xl mt-1" />,
    ],
    []
  );

  const goToMap = () => {
    navigate("/map?purpose=rent&category=apartment");
  };

  const scrollToBenefits = () => {
    const el = document.getElementById("apartment-benefits");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      {/* SEO */}
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        ogImage={`${window.location.origin}/og/og-apartment.jpg`}
        lang={lang}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-500" />
        <div className="absolute inset-0 dark:bg-black/35" />

        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-center gap-10 text-white">
          {/* Text */}
          <div className="flex-1">
            <p className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-white/10 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
              {t("hero.badge")}
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              {t("hero.title")}
            </h1>

            <p className="text-sm md:text-base text-white/85 max-w-xl mb-6">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goToMap}
                className="inline-flex items-center bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-50 transition
                           focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-indigo-700"
              >
                <FaMapMarkedAlt className="mr-2" />
                {t("hero.ctaPrimary")}
              </button>

              <button
                type="button"
                onClick={scrollToBenefits}
                className="px-5 py-2.5 rounded-full border border-white/60 text-white text-sm font-semibold hover:bg-white/10 transition
                           focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-indigo-700"
              >
                {t("hero.ctaSecondary")}
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15">
              <img
                src={apartmentImg}
                alt={t("imageAlt")}
                className="object-cover w-full h-[320px] md:h-[380px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-10 md:h-12 opacity-90 drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="apartment-benefits"
        className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            {t("benefits.title")}
          </h2>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-8 max-w-3xl">
            {t("benefits.intro")}
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  {icons[i] || icons[0]}
                  <h3 className="font-semibold">{item?.title}</h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {item?.text}
                </p>
              </div>
            ))}

            {benefits.length === 0 && (
              <div className="md:col-span-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center text-sm text-slate-600 dark:text-slate-300">
                {t("benefits.empty", {
                  defaultValue:
                    "Aktuell sind keine Vorteile konfiguriert. Bitte prüfe deine Übersetzungen (apartment.benefits.items).",
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-16 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
          {t("ready")}
        </h3>

        <button
          type="button"
          onClick={goToMap}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg text-base md:text-lg transition
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950"
        >
          {t("button")}
        </button>
      </section>
    </div>
  );
};

export default ApartmentPage;