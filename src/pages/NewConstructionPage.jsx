// src/pages/NewConstructionPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import newConstructionImg from "../assets/new-construction.png";
import SiteMeta from "../components/SEO/SiteMeta";

const NewConstructionPage = () => {
  const { t, i18n } = useTranslation("newConstruction");
  const lang = i18n.language?.slice(0, 2) || "de";

  const reasons = t("reasons.items", { returnObjects: true }) || [];
  const steps = t("steps.items", { returnObjects: true }) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-gray-900 dark:text-gray-100">
      {/* SEO */}
      <SiteMeta
        titleKey="newConstruction.metaTitle"
        descKey="newConstruction.metaDescription"
        path="/new-construction"
        lang={lang}
      />

      {/* HERO-BEREICH */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-3xl px-6 py-10 md:px-10 md:py-12 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-lg">
        <div className="flex-1">
          <p className="inline-block mb-3 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-white uppercase tracking-wide">
            {t("hero.badge")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-blue-100 mb-6 max-w-xl">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/listings?newConstruction=1"
              className="px-5 py-2.5 rounded-full bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              {t("hero.primaryCta")}
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-full bg-blue-500/70 text-white font-semibold text-sm hover:bg-blue-500 transition-colors"
            >
              {t("hero.secondaryCta")}
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <img
            src={newConstructionImg}
            alt={t("hero.imageAlt")}
            className="w-full h-64 md:h-72 object-cover rounded-2xl shadow-xl border border-white/20"
          />
        </div>
      </section>

      {/* TIPP / FÖRDERUNG */}
      <section className="mb-10">
        <div className="rounded-2xl border border-blue-200/70 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-900/30 px-6 py-5">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {t("tip.title")}
          </h2>
          <p className="text-sm text-blue-900/90 dark:text-blue-100/90">
            {t("tip.text")}
          </p>
        </div>
      </section>

      {/* WARUM NEUBAU? */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">
          {t("reasons.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
          {t("reasons.intro")}
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {reasons.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <FaCheckCircle className="mt-1 text-emerald-500" />
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCHRITTE ZUM NEUBAU-PROJEKT */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">
          {t("steps.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
          {t("steps.intro")}
        </p>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KONTAKT-CTA */}
      <section className="mb-8">
        <div className="rounded-3xl bg-gray-900/5 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-1">
              {t("contactCta.title")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
              {t("contactCta.text")}
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {t("contactCta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NewConstructionPage;
