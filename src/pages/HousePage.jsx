// src/pages/HousePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import houseImg from "../assets/house-living.png";
import logo from "../assets/logo.png";

const HousePage = () => {
  const { t, i18n } = useTranslation("house");
  const navigate = useNavigate();

  // i18n arrays
  const perks = t("perks", { returnObjects: true }) || [];
  const steps = t("steps", { returnObjects: true }) || [];

  // SEO
  const seoTitle =
    t("seo.title", {
      defaultValue: "Häuser mieten – MyHome24App",
    }) || "Häuser mieten – MyHome24App";

  const seoDescription =
    t("seo.description", {
      defaultValue:
        "Finden Sie familienfreundliche Häuser zur Miete in ganz Deutschland – mit Kartenansicht und smarten Filtern.",
    }) ||
    "Finden Sie familienfreundliche Häuser zur Miete in ganz Deutschland.";

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/rent/house`;

  const goToRentHouseMap = () => {
    navigate("/map?purpose=rent&category=house");
  };

  const goToRent = () => {
    navigate("/rent");
  };

  return (
    <>
      <SiteMeta
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        lang={lang}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
          {/* HERO */}
          <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center mb-12 md:mb-16">
            {/* Hero text */}
            <div className="space-y-5">
              <p className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                {t("hero.badge")}
              </p>

              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                {t("hero.title")}
              </h1>

              <p className="text-sm md:text-base text-gray-700 dark:text-slate-200 max-w-xl">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={goToRentHouseMap}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition"
                >
                  {t("cta.primary")}
                </button>
                <button
                  type="button"
                  onClick={goToRent}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  {t("cta.secondary")}
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={houseImg}
                alt={t("imgAlt")}
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <img
                src={logo}
                alt="MyHome24App"
                className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
              />

              <div className="absolute left-6 right-6 bottom-6 space-y-2 text-white">
                <h2 className="text-lg md:text-xl font-semibold">
                  {t("hero.overlayTitle")}
                </h2>
                <p className="text-xs md:text-sm text-slate-100 max-w-md">
                  {t("hero.overlaySubtitle")}
                </p>
              </div>
            </div>
          </section>

          {/* PERKS */}
          <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-start mb-12 md:mb-16">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-600 dark:text-emerald-300 mb-3">
                {t("perksTitle")}
              </h2>
              <p className="text-sm md:text-base text-gray-700 dark:text-slate-200 mb-5">
                {t("introText")}
              </p>

              <div className="space-y-4">
                {Array.isArray(perks) &&
                  perks.map((perk, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-4 py-3"
                    >
                      <div className="mt-1 h-8 w-8 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-500 text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm md:text-base font-semibold">
                          {perk.title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">
                          {perk.text}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Info box */}
            <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
              <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-300 mb-2">
                {t("infoBoxTitle")}
              </h3>
              <p className="text-sm text-gray-800 dark:text-slate-100 mb-4">
                {t("infoBoxText")}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">
                {t("disclaimer")}
              </p>
            </aside>
          </section>

          {/* STEPS */}
          <section className="mb-6 md:mb-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {t("stepsTitle")}
            </h2>
            <div className="space-y-4">
              {Array.isArray(steps) &&
                steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-4 py-3"
                  >
                    <div className="mt-1 h-7 w-7 flex-none rounded-full bg-slate-800 text-slate-50 flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default HousePage;
