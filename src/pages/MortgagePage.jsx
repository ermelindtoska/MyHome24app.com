// src/pages/MortgagePage.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaPercentage,
  FaCalculator,
  FaHandshake,
  FaFileSignature,
  FaShieldAlt,
  FaBolt,
  FaRegClock,
} from "react-icons/fa";

import SiteMeta from "../components/SEO/SiteMeta";
import mortgageImage from "../assets/mortgage.png";
import logo from "../assets/logo.png";

const MortgagePage = () => {
  const { t, i18n } = useTranslation("mortgage");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage`;

  // robust arrays
  const rawFeatures = t("features", { returnObjects: true });
  const rawSteps = t("steps", { returnObjects: true });
  const rawFaq = t("faq", { returnObjects: true });

  const features = Array.isArray(rawFeatures) ? rawFeatures : [];
  const steps = Array.isArray(rawSteps) ? rawSteps : [];
  const faq = Array.isArray(rawFaq) ? rawFaq : [];

  // SEO
  const seoTitle =
    t("seo.title", { defaultValue: "Baufinanzierung & Hypothek – MyHome24App" }) ||
    "Baufinanzierung & Hypothek – MyHome24App";

  const seoDescription =
    t("seo.description", {
      defaultValue:
        "Rechnen Sie Ihre monatliche Rate, senden Sie eine unverbindliche Anfrage und finden Sie passende Finanzierungspartner:innen – in wenigen Minuten.",
    }) ||
    "Finanzierung einfach planen: Rechner, Anfrage, Partner:innen.";

  const go = (to) => navigate(to);

  const trustItems = useMemo(
    () => [
      {
        icon: FaShieldAlt,
        title: t("trust.0.title", { defaultValue: "Seriös & transparent" }),
        text: t("trust.0.text", { defaultValue: "Klare Schritte, verständliche Infos, ohne Druck." }),
      },
      {
        icon: FaBolt,
        title: t("trust.1.title", { defaultValue: "Schnell starten" }),
        text: t("trust.1.text", { defaultValue: "In 2–3 Minuten zur ersten Einschätzung." }),
      },
      {
        icon: FaRegClock,
        title: t("trust.2.title", { defaultValue: "Zeit sparen" }),
        text: t("trust.2.text", { defaultValue: "Rechner + Anfrage statt endloser Vergleiche." }),
      },
    ],
    [t]
  );

  const quickActions = useMemo(
    () => [
      {
        icon: FaCalculator,
        title: t("quick.0.title", { defaultValue: "Hypothekenrechner" }),
        text: t("quick.0.text", { defaultValue: "Rate, Zinsen & Laufzeit sofort berechnen." }),
        to: "/mortgage/calculator",
        variant: "primary",
      },
      {
        icon: FaFileSignature,
        title: t("quick.1.title", { defaultValue: "Finanzierungsanfrage" }),
        text: t("quick.1.text", { defaultValue: "Unverbindlich anfragen – wir melden uns." }),
        to: "/mortgage/request",
        variant: "secondary",
      },
      {
        icon: FaHandshake,
        title: t("quick.2.title", { defaultValue: "Partner:innen" }),
        text: t("quick.2.text", { defaultValue: "So funktioniert die Zusammenarbeit mit Banken." }),
        to: "/mortgage/partners",
        variant: "ghost",
      },
    ],
    [t]
  );

  return (
    <>
      <SiteMeta title={seoTitle} description={seoDescription} canonical={canonical} lang={lang} />

      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-10">
          {/* HERO */}
          <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
            {/* Image side */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <img
                src={mortgageImage}
                alt={t("imgAlt", { defaultValue: "Baufinanzierung bei MyHome24App" })}
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
              <img
                src={logo}
                alt="MyHome24App"
                className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
              />

              <div className="absolute left-6 right-6 bottom-6 space-y-3 text-white">
                <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                  <FaPercentage className="mr-1" />
                  {t("hero.badge", { defaultValue: "Finanzierung" })}
                </span>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                  {t("hero.title", { defaultValue: "Baufinanzierung einfach planen" })}
                </h1>

                <p className="text-sm md:text-base text-slate-100 max-w-xl">
                  {t("hero.subtitle", {
                    defaultValue:
                      "Nutzen Sie unseren Rechner, senden Sie eine unverbindliche Anfrage und finden Sie passende Finanzierungspartner:innen.",
                  })}
                </p>

                {/* HERO CTAs */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => go("/mortgage/calculator")}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
                  >
                    {t("cta.primary", { defaultValue: "Zum Hypothekenrechner" })}
                  </button>

                  <button
                    type="button"
                    onClick={() => go("/mortgage/request")}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition"
                  >
                    {t("cta.secondary", { defaultValue: "Finanzierungsanfrage senden" })}
                  </button>

                  <button
                    type="button"
                    onClick={() => go("/contact?topic=financing")}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                  >
                    {t("cta.contact", { defaultValue: "Kontakt" })}
                  </button>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {t("featuresTitle", { defaultValue: "Das erwartet Sie" })}
              </h2>

              <p className="text-sm md:text-base text-slate-700 dark:text-slate-200">
                {t("introText", {
                  defaultValue:
                    "Hier finden Sie Rechner, Tipps und einen klaren Ablauf – damit Sie mit mehr Sicherheit entscheiden.",
                })}
              </p>

              {/* Trust strip */}
              <div className="grid gap-3 sm:grid-cols-3">
                {trustItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                          <Icon className="text-emerald-500 dark:text-emerald-400" />
                        </span>
                        <div className="text-sm font-semibold">{item.title}</div>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">{item.text}</div>
                    </div>
                  );
                })}
              </div>

              {/* Feature list */}
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="mt-1 h-8 w-8 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Actions (Zillow-like cards) */}
          <section className="grid gap-4 md:grid-cols-3">
            {quickActions.map((c, idx) => {
              const Icon = c.icon;
              const isPrimary = c.variant === "primary";
              const isSecondary = c.variant === "secondary";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => go(c.to)}
                  className={[
                    "text-left rounded-3xl border px-5 py-5 transition shadow-sm",
                    "bg-white hover:bg-slate-50 border-slate-200",
                    "dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:border-slate-800",
                    isPrimary ? "ring-1 ring-emerald-500/30" : "",
                    isSecondary ? "ring-1 ring-blue-500/20" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center dark:bg-slate-950">
                      <Icon />
                    </span>
                    <div className="text-base font-semibold">{c.title}</div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{c.text}</div>

                  <div className="mt-4">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold",
                        isPrimary
                          ? "bg-emerald-500 text-white"
                          : isSecondary
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
                      ].join(" ")}
                    >
                      {t("quick.cta", { defaultValue: "Öffnen" })}
                    </span>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Steps + Info box */}
          <section className="grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4">
                {t("stepsTitle", { defaultValue: "So funktioniert’s" })}
              </h2>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="mt-1 h-7 w-7 flex-none rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold dark:bg-slate-950">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold">{step.title}</h3>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-5 md:px-6 md:py-6 shadow-inner">
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                {t("infoBoxTitle", { defaultValue: "Hinweis" })}
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-100 mb-4">
                {t("infoBoxText", {
                  defaultValue:
                    "Die Berechnungen dienen als Orientierung. Für ein verbindliches Angebot nutzen Sie bitte die Finanzierungsanfrage.",
                })}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t("disclaimer", {
                  defaultValue:
                    "Keine Finanzberatung. Konditionen können je nach Bonität & Objekt abweichen.",
                })}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go("/mortgage/request")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
                >
                  {t("cta.secondary", { defaultValue: "Finanzierungsanfrage senden" })}
                </button>

                <button
                  type="button"
                  onClick={() => go("/mortgage/partners")}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-500/30 bg-white/60 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-white transition dark:bg-slate-900/60 dark:text-emerald-200"
                >
                  {t("cta.partners", { defaultValue: "Partner:innen ansehen" })}
                </button>
              </div>
            </aside>
          </section>

          {/* FAQ */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {t("faqTitle", { defaultValue: "Häufige Fragen" })}
            </h2>

            {faq.length === 0 ? (
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {t("faqEmpty", { defaultValue: "FAQ folgt in Kürze." })}
              </div>
            ) : (
              <div className="space-y-3">
                {faq.map((item, idx) => (
                  <details
                    key={idx}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm md:text-base font-semibold">
                      <span>{item.q}</span>
                      <span className="ml-3 text-xs text-slate-500 group-open:rotate-90 transition">
                        ▸
                      </span>
                    </summary>
                    <div className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Mobile sticky CTA (Zillow-ish) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3">
            <button
              type="button"
              onClick={() => go("/mortgage/calculator")}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <FaCalculator className="mr-2" />
              {t("sticky.calculator", { defaultValue: "Rechner" })}
            </button>
            <button
              type="button"
              onClick={() => go("/mortgage/request")}
              className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold"
            >
              <FaFileSignature className="mr-2" />
              {t("sticky.request", { defaultValue: "Anfrage" })}
            </button>
          </div>
        </div>

        {/* spacer for sticky bar */}
        <div className="md:hidden h-16" />
      </main>
    </>
  );
};

export default MortgagePage;
