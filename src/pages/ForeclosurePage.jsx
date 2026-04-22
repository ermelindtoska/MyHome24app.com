// src/pages/ForeclosurePage.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaGavel,
  FaShieldAlt,
  FaSearchLocation,
  FaEuroSign,
  FaArrowRight,
  FaCheckCircle,
  FaBalanceScale,
} from "react-icons/fa";
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

  const perksRaw = t("perks.items", { returnObjects: true });
  const faqRaw = t("faq.items", { returnObjects: true });
  const stepsRaw = t("steps.items", { returnObjects: true });
  const rowsRaw = t("table.sampleRows", { returnObjects: true });

  const perks = Array.isArray(perksRaw) ? perksRaw : [];
  const faqItems = Array.isArray(faqRaw) ? faqRaw : [];
  const steps = Array.isArray(stepsRaw) ? stepsRaw : [];
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];

  const trustCards = useMemo(
    () => [
      {
        icon: <FaShieldAlt />,
        title: t("trust.0.title", {
          defaultValue: "Transparent & nachvollziehbar",
        }),
        text: t("trust.0.text", {
          defaultValue:
            "Klare Abläufe, strukturierte Informationen und mehr Orientierung bei Versteigerungen.",
        }),
      },
      {
        icon: <FaSearchLocation />,
        title: t("trust.1.title", {
          defaultValue: "Besser vergleichen",
        }),
        text: t("trust.1.text", {
          defaultValue:
            "Standorte, Einstiegspreise und Chancen auf einen Blick prüfen.",
        }),
      },
      {
        icon: <FaEuroSign />,
        title: t("trust.2.title", {
          defaultValue: "Chancen früh erkennen",
        }),
        text: t("trust.2.text", {
          defaultValue:
            "Interessante Objekte frühzeitig entdecken und gezielter bewerten.",
        }),
      },
    ],
    [t]
  );

  const perkIcons = [FaGavel, FaCheckCircle, FaBalanceScale];

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        lang={lang}
        ogImage={foreclosureHeader}
      />

      {/* HERO */}
      <section className="relative border-b border-gray-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 grid gap-10 lg:grid-cols-[1.08fr,0.92fr] items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                {t("hero.badge")}
              </span>

              <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                <FaGavel className="mr-2" />
                {t("hero.badgeSecondary", {
                  defaultValue: "Marktchancen entdecken",
                })}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              {t("hero.title")}
            </h1>

            <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mb-6 max-w-2xl">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              <button
                type="button"
                onClick={handleGoToSearch}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition"
              >
                {t("hero.ctaPrimary")}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={handleGoToSupport}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                {t("hero.ctaSecondary")}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs md:text-sm text-gray-600 dark:text-slate-300">
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-4">
                <p className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  {t("hero.highlights.direct")}
                </p>
                <p>{t("hero.highlights.directDesc")}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-4">
                <p className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  {t("hero.highlights.transparency")}
                </p>
                <p>{t("hero.highlights.transparencyDesc")}</p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
              <img
                src={foreclosureHeader}
                alt={t("hero.imageAlt")}
                className="w-full h-[280px] md:h-[440px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white backdrop-blur">
                {t("hero.imageBadge")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {trustCards.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  {item.icon}
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS / PERKS */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          {t("perks.title")}
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mb-8 max-w-3xl">
          {t("perks.subtitle")}
        </p>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk, idx) => {
            const Icon = perkIcons[idx % perkIcons.length];
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                      {perk.title}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-slate-300">
                      {perk.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            {t("steps.title")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mb-8 max-w-3xl">
            {t("steps.subtitle")}
          </p>

          <ol className="space-y-4">
            {steps.map((step, idx) => (
              <li
                key={idx}
                className="flex gap-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm md:text-base">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-gray-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TABLE */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {t("table.title")}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300 mt-1">
              {t("table.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoToSearch}
            className="text-xs md:text-sm text-emerald-700 dark:text-emerald-300 hover:underline underline-offset-2"
          >
            {t("table.cta")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/70">
              <tr className="text-left text-gray-600 dark:text-slate-300">
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
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100"
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
                      className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-gray-900 dark:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                    >
                      {t("table.details")}
                    </button>
                  </td>
                </tr>
              ))}

              <tr className="border-t border-gray-200 dark:border-slate-800">
                <td
                  className="px-4 py-3 text-xs md:text-sm text-gray-600 dark:text-slate-300"
                  colSpan={6}
                >
                  {t("table.disclaimer")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            {t("faq.title")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mb-6 max-w-3xl">
            {t("faq.subtitle")}
          </p>

          <div className="space-y-3">
            {faqItems.map((f, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm md:text-base text-gray-900 dark:text-slate-100">
                  <span>{f.question}</span>
                  <span className="text-gray-500 dark:text-slate-400 group-open:hidden">+</span>
                  <span className="text-gray-500 dark:text-slate-400 hidden group-open:inline">−</span>
                </summary>
                <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-slate-300">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="border-t border-gray-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-sky-500/10">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300 mb-1">
              {t("contactRibbon.label")}
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
              {t("contactRibbon.title")}
            </h3>
            <p className="text-sm text-gray-700 dark:text-slate-200 mt-1 max-w-xl">
              {t("contactRibbon.subtitle")}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleGoToContact}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition"
            >
              {t("contactRibbon.ctaPrimary")}
            </button>

            <button
              type="button"
              onClick={handleGoToSupport}
              className="inline-flex items-center justify-center rounded-full border border-emerald-600/50 px-5 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/10 transition"
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