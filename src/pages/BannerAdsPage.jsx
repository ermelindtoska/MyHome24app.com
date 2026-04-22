// src/pages/BannerAdsPage.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import bannerImg from "../assets/banner-ads.png";
import logo from "../assets/logo.png";
import {
  FaMapMarkedAlt,
  FaUsers,
  FaShapes,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

const BannerAdsPage = () => {
  const { t } = useTranslation("bannerAds");
  const navigate = useNavigate();

  const features = useMemo(() => {
    const raw = t("features", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const iconMap = [FaMapMarkedAlt, FaUsers, FaShapes, FaChartLine];

  const goContact = () => navigate("/contact?topic=banner-ads");

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="max-w-6xl mx-auto py-10 md:py-14 px-4 space-y-10">
        {/* HERO */}
        <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/70 dark:border-slate-800">
          <img
            src={bannerImg}
            alt={t("imageAlt", { defaultValue: "Banner Ads" })}
            className="w-full h-[280px] sm:h-[340px] md:h-[420px] object-cover object-top"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <img
            src={logo}
            alt="MyHome24App"
            className="absolute top-4 right-4 h-11 w-auto drop-shadow-lg"
          />

          <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-600/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase text-white">
                {t("badge", { defaultValue: "Werbung" })}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
                {t("badge2", { defaultValue: "Mehr Reichweite" })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-white">
              {t("title", { defaultValue: "Banner Ads" })}
            </h1>

            <p className="text-sm sm:text-base text-white/90 max-w-2xl">
              {t("description", {
                defaultValue:
                  "Präsentiere deine Marke direkt dort, wo Nutzer:innen suchen, vergleichen und entscheiden.",
              })}
            </p>

            <div className="pt-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goContact}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
              >
                {t("button", { defaultValue: "Jetzt anfragen" })}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 650, behavior: "smooth" })}
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                {t("secondaryButton", { defaultValue: "Vorteile ansehen" })}
              </button>
            </div>

            <p className="text-[11px] text-white/70">
              {t("note", {
                defaultValue:
                  "Hinweis: Verfügbarkeit und Preise können je nach Region & Platzierung variieren.",
              })}
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">
            {t("featuresTitle", { defaultValue: "Was du bekommst" })}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = iconMap[index % iconMap.length];
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm
                             dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 h-10 w-10 rounded-full bg-blue-600/10 ring-1 ring-blue-600/20 flex items-center justify-center">
                      <Icon className="text-blue-600 dark:text-blue-300" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-base font-semibold">
                        {feature?.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {feature?.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {features.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              —
            </div>
          )}
        </section>

        {/* TIP */}
        <section className="rounded-3xl border border-blue-200 bg-blue-50 px-6 py-6 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10">
          <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
            {t("tipTitle", { defaultValue: "Tipp" })}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t("tipText", {
              defaultValue:
                "Kombiniere Banner-Ads mit klaren Zielseiten (z. B. Buy/Rent), um die Conversion zu steigern.",
            })}
          </p>
        </section>

        {/* BOTTOM CTA */}
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold">
                {t("bottomTitle", { defaultValue: "Interesse an Banner Ads?" })}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {t("bottomText", {
                  defaultValue:
                    "Schreib uns kurz, welche Region und welche Zielgruppe du erreichen willst – wir melden uns mit Vorschlägen.",
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={goContact}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              {t("button", { defaultValue: "Jetzt anfragen" })}
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BannerAdsPage;