// src/pages/MortgagePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaPercentage } from "react-icons/fa";

import SiteMeta from "../components/SEO/SiteMeta";
import mortgageImage from "../assets/mortgage.png";
import logo from "../assets/logo.png";

const MortgagePage = () => {
  const { t, i18n } = useTranslation("mortgage",);
  const navigate = useNavigate();

  const features = t("features", { returnObjects: true }) || [];
  const steps = t("steps", { returnObjects: true }) || [];

  // SEO
  const seoTitle =
    t("seo.title", {
      defaultValue: "Baufinanzierung & Hypothek – MyHome24App",
    }) || "Baufinanzierung & Hypothek – MyHome24App";

  const seoDescription =
    t("seo.description", {
      defaultValue:
        "Vergleichen Sie Finanzierungsoptionen, verstehen Sie Zinsen und bereiten Sie Ihre Immobilienfinanzierung optimal vor.",
    }) ||
    "Informationen und Tipps rund um Baufinanzierung & Hypotheken.";

  const canonical = `${window.location.origin}/mortgage`;
  const lang = i18n.language?.slice(0, 2) || "de";

  const goToBuy = () => navigate("/buy");
  const goToContact = () => navigate("/contact");

  return (
    <>
      <SiteMeta
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        lang={lang}
      />

      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">

          {/* HERO */}
          <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center mb-12">
            {/* Image side */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              <img
                src={mortgageImage}
                alt={t("imgAlt")}
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <img
                src={logo}
                alt="MyHome24App"
                className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
              />

              <div className="absolute left-6 right-6 bottom-6 space-y-3 text-white">
                <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                  <FaPercentage className="mr-1" />
                  {t("hero.badge")}
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                  {t("hero.title")}
                </h1>
                <p className="text-sm md:text-base text-slate-100 max-w-xl">
                  {t("hero.subtitle")}
                </p>
              </div>
            </div>

            {/* Text side */}
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-400">
                {t("featuresTitle")}
              </h2>
              <p className="text-sm md:text-base text-slate-200">
                {t("introText")}
              </p>

              <div className="space-y-4">
                {Array.isArray(features) &&
                  features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="mt-1 h-8 w-8 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm md:text-base font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-300">
                          {feature.text}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={goToBuy}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
                >
                  {t("cta.primary")}
                </button>
                <button
                  type="button"
                  onClick={goToContact}
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
                >
                  {t("cta.secondary")}
                </button>
              </div>
            </div>
          </section>

          {/* STEPS + INFO BOX */}
          <section className="mt-8 md:mt-12 grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4">
                {t("stepsTitle")}
              </h2>
              <div className="space-y-4">
                {Array.isArray(steps) &&
                  steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3"
                    >
                      <div className="mt-1 h-7 w-7 flex-none rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-100">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-slate-50">
                          {step.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-300">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                {t("infoBoxTitle")}
              </h3>
              <p className="text-sm text-slate-100 mb-4">
                {t("infoBoxText")}
              </p>
              <p className="text-xs text-slate-400">{t("disclaimer")}</p>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
};

export default MortgagePage;
