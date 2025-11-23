// src/pages/FinancePartnerPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import mortgageHero from "../assets/mortgage.png"; // oder dein Rechner-Bild
import logo from "../assets/logo.png";

const FinancePartnerPage = () => {
  const { t, i18n } = useTranslation("mortgageCalculator");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/partner/finance`;

  const segments = t("partnerPage.segments", { returnObjects: true }) || [];
  const benefits = t("partnerPage.benefits", { returnObjects: true }) || [];
  const faq = t("partnerPage.faq", { returnObjects: true }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        title={t("partnerPage.seoTitle")}
        description={t("partnerPage.seoDescription")}
        canonical={canonical}
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-10">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
          {/* Bild */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={mortgageHero}
              alt={t("partnerPage.hero.imgAlt")}
              className="w-full h-[320px] md:h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                {t("partnerPage.hero.badge")}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("partnerPage.hero.title")}
              </h1>
              <p className="text-sm md:text-base text-slate-200 max-w-xl">
                {t("partnerPage.hero.subtitle")}
              </p>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-5">
            <p className="text-sm md:text-base text-slate-200">
              {t("partnerPage.intro")}
            </p>

            <div className="grid gap-4">
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3"
                >
                  <h3 className="text-sm md:text-base font-semibold mb-1 text-emerald-400">
                    {seg.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-200">
                    {seg.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/contact?topic=financing")}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
              >
                {t("partnerPage.cta.primary")}
              </button>

              <button
                type="button"
                onClick={() => navigate("/mortgage/calculator")}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
              >
                {t("partnerPage.cta.secondary")}
              </button>
            </div>
          </div>
        </section>

        {/* VORTEILE */}
        <section className="grid gap-8 md:grid-cols-3">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 px-5 py-4 flex flex-col gap-2"
            >
              <h3 className="text-sm md:text-base font-semibold text-slate-50">
                {b.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-300">{b.text}</p>
            </div>
          ))}
        </section>

        {/* FAQ / RECHTLICHES */}
        <section className="grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              {t("partnerPage.faqTitle")}
            </h2>
            {faq.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm md:text-base font-semibold text-slate-50">
                  <span>{item.q}</span>
                  <span className="ml-3 text-xs text-slate-400 group-open:rotate-90 transition">
                    ▸
                  </span>
                </summary>
                <p className="mt-2 text-xs md:text-sm text-slate-300">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <aside className="rounded-3xl bg-amber-500/10 border border-amber-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">
              {t("legalTitle")}
            </h3>
            <p className="text-xs md:text-sm text-slate-100 mb-3">
              {t("legalText")}
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-slate-200 space-y-1">
              {(t("legalPoints", { returnObjects: true }) || []).map(
                (p, idx) => (
                  <li key={idx}>{p}</li>
                )
              )}
            </ul>
          </aside>
        </section>

        {/* UNTERER CTA */}
        <section className="rounded-3xl bg-slate-900/80 border border-slate-800 px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-1">
              {t("partnerPage.footerTitle")}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              {t("partnerPage.footerText")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/contact?topic=financing")}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
            >
              {t("partnerPage.cta.primary")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
            >
              {t("partnerPage.cta.registerHint")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinancePartnerPage;
