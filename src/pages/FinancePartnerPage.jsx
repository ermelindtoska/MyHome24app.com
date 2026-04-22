import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaHandshake,
  FaShieldAlt,
  FaChartLine,
  FaUsers,
  FaArrowRight,
  FaCheckCircle,
  FaBalanceScale,
  FaCalculator,
  FaEnvelopeOpenText,
  FaRegBuilding,
  FaClipboardCheck,
  FaBolt,
} from "react-icons/fa";
import SiteMeta from "../components/SEO/SiteMeta";
import mortgageHero from "../assets/mortgage.png";
import logo from "../assets/logo.png";

const FinancePartnerPage = () => {
  const { t, i18n } = useTranslation("mortgageCalculator");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/partner/finance`;

  const rawSegments = t("partnerPage.segments", { returnObjects: true });
  const rawBenefits = t("partnerPage.benefits", { returnObjects: true });
  const rawFaq = t("partnerPage.faq", { returnObjects: true });
  const rawLegalPoints = t("legalPoints", { returnObjects: true });
  const rawStats = t("partnerPage.stats", { returnObjects: true });

  const segments = Array.isArray(rawSegments) ? rawSegments : [];
  const benefits = Array.isArray(rawBenefits) ? rawBenefits : [];
  const faq = Array.isArray(rawFaq) ? rawFaq : [];
  const legalPoints = Array.isArray(rawLegalPoints) ? rawLegalPoints : [];
  const stats = Array.isArray(rawStats) ? rawStats : [];

  const trustItems = useMemo(
    () => [
      {
        icon: FaHandshake,
        title: t("partnerPage.trust.0.title", {
          defaultValue: "Starke Partnerschaften",
        }),
        text: t("partnerPage.trust.0.text", {
          defaultValue:
            "Langfristige Zusammenarbeit mit klaren Erwartungen, strukturierten Prozessen und professioneller Kommunikation.",
        }),
      },
      {
        icon: FaShieldAlt,
        title: t("partnerPage.trust.1.title", {
          defaultValue: "Vertrauen & Qualität",
        }),
        text: t("partnerPage.trust.1.text", {
          defaultValue:
            "Seriöser Plattformauftritt, hochwertige Nutzererwartung und sauber strukturierte Kontaktstrecken.",
        }),
      },
      {
        icon: FaChartLine,
        title: t("partnerPage.trust.2.title", {
          defaultValue: "Wachstumspotenzial",
        }),
        text: t("partnerPage.trust.2.text", {
          defaultValue:
            "Digitale Sichtbarkeit und moderne Nutzerwege für nachhaltige Reichweite im Immobilienkontext.",
        }),
      },
    ],
    [t]
  );

  const benefitIcons = [
    FaUsers,
    FaChartLine,
    FaShieldAlt,
    FaHandshake,
    FaClipboardCheck,
    FaBolt,
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("partnerPage.seoTitle")}
        description={t("partnerPage.seoDescription")}
        canonical={canonical}
        lang={lang}
      />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">
        {/* HERO */}
        <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr] items-stretch">
          {/* LEFT HERO IMAGE / MESSAGE */}
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img
              src={mortgageHero}
              alt={t("partnerPage.hero.imgAlt")}
              className="h-[360px] md:h-[500px] w-full object-cover"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent dark:from-slate-950/92 dark:via-slate-950/50 dark:to-transparent" />

            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-5 right-5 h-10 w-auto drop-shadow-lg"
            />

            <div className="absolute left-5 right-5 bottom-5 md:left-8 md:right-8 md:bottom-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {t("partnerPage.hero.badge")}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                  {t("partnerPage.hero.badgeSecondary", {
                    defaultValue: "B2B Kooperation",
                  })}
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl md:text-4xl xl:text-5xl font-bold leading-tight text-white">
                {t("partnerPage.hero.title")}
              </h1>

              <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-slate-100">
                {t("partnerPage.hero.subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/contact?topic=partner-finance")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
                >
                  {t("partnerPage.cta.primary")}
                  <FaArrowRight className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mortgage/calculator")}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  <FaCalculator className="mr-2" />
                  {t("partnerPage.cta.secondary")}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="grid gap-6 content-start">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {t("partnerPage.introTitle", {
                  defaultValue: "Ihre starken Bankpartner",
                })}
              </h2>

              <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {t("partnerPage.intro")}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {trustItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                        <Icon className="text-emerald-600 dark:text-emerald-400" />
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-950/50 dark:border-slate-800">
                  <FaEnvelopeOpenText className="text-slate-800 dark:text-slate-100" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {t("partnerPage.contactBoxTitle", {
                      defaultValue: "Sind Sie Bank, Vermittler oder Berater:in?",
                    })}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t("partnerPage.contactBoxText", {
                      defaultValue:
                        "Starten Sie eine Kooperation mit MyHome24App. Wir zeigen Ihre Angebote dort, wo Nutzer:innen aktiv nach Immobilien suchen – mit klarer Erwartungshaltung und sauberem Lead-Kontext.",
                    })}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/contact?topic=partner-finance")}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      {t("partnerPage.cta.primary")}
                      <FaArrowRight className="ml-2" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/finance-partner")}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-900"
                    >
                      {t("partnerPage.cta.dashboardHint", {
                        defaultValue: "Partner-Dashboard ansehen",
                      })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        {stats.length > 0 && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {t("partnerPage.statsTitle", {
                    defaultValue: "Überblick & Orientierung",
                  })}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {t("partnerPage.statsIntro", {
                    defaultValue:
                      "Diese Kennzahlen dienen als Vertrauens- und Strukturanker für künftige Partnerprozesse.",
                  })}
                </p>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t("partnerPage.statsHint", {
                  defaultValue: "Roadmap Tracking · Status · Partner Matching",
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {item.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SEGMENTS */}
        {segments.length > 0 && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {t("partnerPage.segmentsTitle", {
                defaultValue: "Für wen ist diese Partnerschaft interessant?",
              })}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <FaRegBuilding className="text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {seg.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {seg.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BENEFITS */}
        {benefits.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {t("partnerPage.benefitsTitle", {
                  defaultValue: "Vorteile als Finanzierungspartner:in",
                })}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t("partnerPage.benefitsIntro", {
                  defaultValue:
                    "Mehr Sichtbarkeit, klarere Prozesse und bessere digitale Berührungspunkte für moderne Finanzierungsabläufe.",
                })}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {benefits.map((b, idx) => {
                const Icon = benefitIcons[idx % benefitIcons.length];
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <Icon className="text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {b.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {b.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ / LEGAL */}
        <section className="grid gap-8 lg:grid-cols-[1.08fr,0.92fr] items-start">
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50">
              {t("partnerPage.faqTitle")}
            </h2>

            {faq.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                {t("partnerPage.faqEmpty", {
                  defaultValue: "FAQ folgt in Kürze.",
                })}
              </div>
            ) : (
              faq.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                    <span>{item.q}</span>
                    <span className="text-slate-500 dark:text-slate-400 transition group-open:rotate-90">
                      ▸
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.a}
                  </p>
                </details>
              ))
            )}
          </div>

          <div className="space-y-5">
            <aside className="rounded-[28px] bg-amber-500/10 border border-amber-500/40 p-5 md:p-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <FaBalanceScale className="text-amber-700 dark:text-amber-300" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                  {t("legalTitle")}
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100 mb-4">
                {t("legalText")}
              </p>

              <ul className="space-y-2">
                {legalPoints.map((p, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <FaCheckCircle className="mt-0.5 text-amber-700 dark:text-amber-300" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <aside className="rounded-[28px] border border-emerald-500/30 bg-emerald-500/10 p-5 md:p-6">
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                {t("partnerPage.bottomMiniCtaTitle", {
                  defaultValue: "Partnerschaft strukturiert starten",
                })}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {t("partnerPage.bottomMiniCtaText", {
                  defaultValue:
                    "Besprechen Sie mit uns Lead-Prozesse, Zielgruppen, Sichtbarkeit und künftige Integrationen.",
                })}
              </p>

              <button
                type="button"
                onClick={() => navigate("/contact?topic=partner-finance")}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                {t("partnerPage.cta.primary")}
                <FaArrowRight className="ml-2" />
              </button>
            </aside>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="rounded-[28px] bg-white border border-slate-200 px-6 py-6 md:px-8 md:py-7 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
                {t("partnerPage.footerTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t("partnerPage.footerText")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/contact?topic=partner-finance")}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                {t("partnerPage.cta.primary")}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/finance-partner")}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-900"
              >
                {t("partnerPage.cta.registerHint")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinancePartnerPage;