// src/pages/ForeclosurePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import foreclosureHeader from "../assets/foreclosure-header.png";

const ForeclosurePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("foreclosure");

  const lang = i18n.language?.slice(0, 2) || "de";
  const title =
    t("metaTitle", {
      defaultValue: "Zwangsversteigerungen in Deutschland – MyHome24App",
    }) || "Zwangsversteigerungen in Deutschland – MyHome24App";

  const description =
    t("metaDescription", {
      defaultValue:
        "Entdecken Sie Immobilien aus Zwangsversteigerungen in Deutschland. Chancen für Eigennutzer:innen und Kapitalanleger:innen – transparent, digital, übersichtlich.",
    }) ||
    "Entdecken Sie Immobilien aus Zwangsversteigerungen in Deutschland. Chancen für Eigennutzer:innen und Kapitalanleger:innen – transparent, digital, übersichtlich.";

  const canonical = `${window.location.origin}/buy/foreclosures`;

  const handleGoToSearch = () => navigate("/buy");
  const handleGoToSupport = () => navigate("/support");
  const handleGoToContact = () => navigate("/contact");

  const perks = t("perks.items", { returnObjects: true }) || [];

  const faqItems = t("faq.items", { returnObjects: true }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* SEO */}
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        lang={lang}
        ogImage={foreclosureHeader}
      />

      {/* Hero */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 text-xs font-medium text-emerald-300 mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              {t("hero.badge")}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-50">
              {t("hero.title")}
            </h1>
            <p className="text-sm md:text-base text-slate-300 mb-6 max-w-xl">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                onClick={handleGoToSearch}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition"
              >
                {t("hero.ctaPrimary")}
              </button>
              <button
                type="button"
                onClick={handleGoToSupport}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
              >
                {t("hero.ctaSecondary")}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs md:text-sm text-slate-300">
              <div>
                <p className="font-semibold text-slate-100">
                  {t("hero.highlights.direct")}
                </p>
                <p>{t("hero.highlights.directDesc")}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {t("hero.highlights.transparency")}
                </p>
                <p>{t("hero.highlights.transparencyDesc")}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl shadow-black/40 bg-slate-900">
              <img
                src={foreclosureHeader}
                alt={t("hero.imageAlt")}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-slate-100 backdrop-blur">
                {t("hero.imageBadge")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Perks */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-50">
          {t("perks.title")}
        </h2>
        <p className="text-sm md:text-base text-slate-300 mb-8 max-w-3xl">
          {t("perks.subtitle")}
        </p>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-black/30 flex flex-col gap-2"
            >
              <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span className="text-lg">•</span>
                <span>{perk.title}</span>
              </div>
              <p className="text-xs md:text-sm text-slate-300">
                {perk.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-50">
            {t("steps.title")}
          </h2>
          <p className="text-sm md:text-base text-slate-300 mb-8 max-w-3xl">
            {t("steps.subtitle")}
          </p>

          <ol className="space-y-4">
            {t("steps.items", { returnObjects: true }).map((step, idx) => (
              <li
                key={idx}
                className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-100 text-sm md:text-base">
                    {step.title}
                  </p>
                  <p className="text-xs md:text-sm text-slate-300">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Upcoming auctions – Tabelle / Placeholder */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-50">
            {t("table.title")}
          </h2>
          <button
            type="button"
            onClick={handleGoToSearch}
            className="text-xs md:text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            {t("table.cta")}
          </button>
        </div>
        <p className="text-xs md:text-sm text-slate-300 mb-4">
          {t("table.subtitle")}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-900/80">
              <tr className="text-left text-slate-300">
                <th className="px-4 py-3 font-medium">{t("table.headers.date")}</th>
                <th className="px-4 py-3 font-medium">{t("table.headers.city")}</th>
                <th className="px-4 py-3 font-medium">{t("table.headers.type")}</th>
                <th className="px-4 py-3 font-medium">{t("table.headers.minBid")}</th>
                <th className="px-4 py-3 font-medium">{t("table.headers.court")}</th>
                <th className="px-4 py-3 font-medium text-right">
                  {t("table.headers.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {t("table.sampleRows", { returnObjects: true }).map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-slate-800/60 text-slate-200"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.city}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.minBid}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.court}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={handleGoToContact}
                      className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700 transition"
                    >
                      {t("table.details")}
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-800/60 text-slate-300">
                <td className="px-4 py-3 text-xs md:text-sm" colSpan={6}>
                  {t("table.disclaimer")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-50">
            {t("faq.title")}
          </h2>
          <p className="text-sm md:text-base text-slate-300 mb-6 max-w-3xl">
            {t("faq.subtitle")}
          </p>

          <div className="space-y-3">
            {faqItems.map((f, idx) => (
              <details
                key={idx}
                className="group rounded-xl border border-slate-800 bg-slate-950/80 p-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm md:text-base text-slate-100">
                  <span>{f.question}</span>
                  <span className="text-slate-400 group-open:hidden">+</span>
                  <span className="text-slate-400 hidden group-open:inline">−</span>
                </summary>
                <p className="mt-2 text-xs md:text-sm text-slate-300">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt-CTA */}
      <section className="border-t border-slate-800 bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-sky-500/10">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-300 mb-1">
              {t("contactRibbon.label")}
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-50">
              {t("contactRibbon.title")}
            </h3>
            <p className="text-sm text-slate-200 mt-1 max-w-xl">
              {t("contactRibbon.subtitle")}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGoToContact}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
            >
              {t("contactRibbon.ctaPrimary")}
            </button>
            <button
              type="button"
              onClick={handleGoToSupport}
              className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 px-5 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/10 transition"
            >
              {t("contactRibbon.ctaSecondary")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForeclosurePage;
