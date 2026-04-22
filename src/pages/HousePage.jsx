// src/pages/HousePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaHome,
  FaTree,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import SiteMeta from "../components/SEO/SiteMeta";
import houseImg from "../assets/house-living.png";
import logo from "../assets/logo.png";

const HousePage = () => {
  const { t, i18n } = useTranslation("house");
  const navigate = useNavigate();

  const rawPerks = t("perks", { returnObjects: true });
  const rawSteps = t("steps", { returnObjects: true });

  const perks = Array.isArray(rawPerks) ? rawPerks : [];
  const steps = Array.isArray(rawSteps) ? rawSteps : [];

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

  const goToContact = () => {
    navigate("/contact?topic=rent-house");
  };

  const perkIcons = [FaHome, FaTree, FaShieldAlt, FaMapMarkedAlt];

  return (
    <>
      <SiteMeta
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        lang={lang}
      />

      <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
          {/* HERO */}
          <section className="grid gap-10 lg:grid-cols-[1.08fr,0.92fr] items-center mb-14 md:mb-20">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                {t("hero.badge")}
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  {t("hero.title")}
                </h1>
                <p className="max-w-2xl text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("hero.stats.0.label", { defaultValue: "Geeignet für" })}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t("hero.stats.0.value", { defaultValue: "Familien & Paare" })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("hero.stats.1.label", { defaultValue: "Suche" })}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t("hero.stats.1.value", { defaultValue: "Karte + Filter" })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("hero.stats.2.label", { defaultValue: "Fokus" })}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t("hero.stats.2.value", { defaultValue: "Haus mit Garten & Platz" })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={goToRentHouseMap}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition"
                >
                  {t("cta.primary")}
                  <FaArrowRight className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={goToRent}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("cta.secondary")}
                </button>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <img
                src={houseImg}
                alt={t("imgAlt")}
                className="w-full h-[320px] md:h-[440px] object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

              <img
                src={logo}
                alt="MyHome24App"
                className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
              />

              <div className="absolute left-6 right-6 bottom-6 space-y-2 text-white">
                <div className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {t("hero.overlayBadge", { defaultValue: "Mieten mit Überblick" })}
                </div>

                <h2 className="text-lg md:text-2xl font-semibold">
                  {t("hero.overlayTitle")}
                </h2>

                <p className="max-w-md text-xs md:text-sm text-slate-100">
                  {t("hero.overlaySubtitle")}
                </p>
              </div>
            </div>
          </section>

          {/* VALUE STRIP */}
          <section className="mb-14 md:mb-16">
            <div className="grid gap-4 md:grid-cols-3">
              <ValueCard
                title={t("valueStrip.0.title", { defaultValue: "Mehr Platz" })}
                text={t("valueStrip.0.text", {
                  defaultValue: "Ideal für Familien, Homeoffice und langfristiges Wohnen.",
                })}
              />
              <ValueCard
                title={t("valueStrip.1.title", { defaultValue: "Bessere Übersicht" })}
                text={t("valueStrip.1.text", {
                  defaultValue: "Filtern Sie Lage, Preis und Größe mit wenigen Klicks.",
                })}
              />
              <ValueCard
                title={t("valueStrip.2.title", { defaultValue: "Einfach vergleichen" })}
                text={t("valueStrip.2.text", {
                  defaultValue: "Bewerten Sie Häuser schneller anhand klarer Fakten und Lagevorteile.",
                })}
              />
            </div>
          </section>

          {/* PERKS + INFO BOX */}
          <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-start mb-14 md:mb-16">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
                {t("perksTitle")}
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-6">
                {t("introText")}
              </p>

              <div className="space-y-4">
                {perks.map((perk, idx) => {
                  const Icon = perkIcons[idx % perkIcons.length];
                  return (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div className="mt-1 h-10 w-10 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <Icon className="text-emerald-600 dark:text-emerald-300" />
                      </div>

                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100">
                          {perk.title}
                        </h3>
                        <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                          {perk.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-5 md:px-6 md:py-6 shadow-inner">
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                {t("infoBoxTitle")}
              </h3>

              <p className="text-sm text-slate-800 dark:text-slate-100 mb-4 leading-relaxed">
                {t("infoBoxText")}
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <FaCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                  <span>
                    {t("infoBoxPoints.0", {
                      defaultValue: "Achten Sie besonders auf Lage, Grundstück und Nebenkosten.",
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <FaCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                  <span>
                    {t("infoBoxPoints.1", {
                      defaultValue: "Vergleichen Sie mehrere Häuser, bevor Sie eine Anfrage senden.",
                    })}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
                {t("disclaimer")}
              </p>
            </aside>
          </section>

          {/* STEPS */}
          <section className="mb-14 md:mb-16">
            <div className="mb-5">
              <h2 className="text-xl md:text-2xl font-semibold">
                {t("stepsTitle")}
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300">
                {t("stepsIntro", {
                  defaultValue: "So finden Sie schneller das passende Haus zur Miete.",
                })}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="mb-3 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold dark:bg-slate-800">
                    {idx + 1}
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* BOTTOM CTA */}
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:px-8 md:py-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {t("bottomCta.title", {
                    defaultValue: "Bereit, ein Haus zur Miete zu finden?",
                  })}
                </h2>
                <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300">
                  {t("bottomCta.text", {
                    defaultValue:
                      "Starten Sie mit der Kartenansicht und entdecken Sie passende Häuser in Ihrer Wunschregion.",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goToRentHouseMap}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition"
                >
                  {t("bottomCta.primary", {
                    defaultValue: "Häuser auf Karte ansehen",
                  })}
                </button>

                <button
                  type="button"
                  onClick={goToContact}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("bottomCta.secondary", {
                    defaultValue: "Beratung anfragen",
                  })}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

const ValueCard = ({ title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
    <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
      {title}
    </h3>
    <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
      {text}
    </p>
  </div>
);

export default HousePage;