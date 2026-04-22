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
  FaArrowRight,
  FaUniversity,
  FaCheckCircle,
} from "react-icons/fa";

import SiteMeta from "../components/SEO/SiteMeta";
import mortgageImage from "../assets/mortgage.png";
import logo from "../assets/logo.png";

const MortgagePage = () => {
  const { t, i18n } = useTranslation("mortgage");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage`;

  const rawFeatures = t("features", { returnObjects: true });
  const rawSteps = t("steps", { returnObjects: true });
  const rawFaq = t("faq", { returnObjects: true });

  const features = Array.isArray(rawFeatures) ? rawFeatures : [];
  const steps = Array.isArray(rawSteps) ? rawSteps : [];
  const faq = Array.isArray(rawFaq) ? rawFaq : [];

  const seoTitle =
    t("seo.title", {
      defaultValue: "Baufinanzierung & Hypothek – MyHome24App",
    }) || "Baufinanzierung & Hypothek – MyHome24App";

  const seoDescription =
    t("seo.description", {
      defaultValue:
        "Rechnen Sie Ihre monatliche Rate, senden Sie eine unverbindliche Finanzierungsanfrage und finden Sie passende Finanzierungspartner:innen – sicher, transparent und modern.",
    }) || "Finanzierung sicher und transparent planen mit MyHome24App.";

  const go = (to) => navigate(to);

  const trustItems = useMemo(
    () => [
      {
        icon: FaShieldAlt,
        title: t("trust.0.title", {
          defaultValue: "Sicher & transparent",
        }),
        text: t("trust.0.text", {
          defaultValue:
            "Klare Abläufe, verständliche Informationen und ein professioneller Prozess ohne versteckte Hürden.",
        }),
      },
      {
        icon: FaBolt,
        title: t("trust.1.title", {
          defaultValue: "Schnell zur Einschätzung",
        }),
        text: t("trust.1.text", {
          defaultValue:
            "Erhalten Sie in wenigen Minuten eine erste Orientierung für Ihre Finanzierung.",
        }),
      },
      {
        icon: FaRegClock,
        title: t("trust.2.title", {
          defaultValue: "Zeit sparen",
        }),
        text: t("trust.2.text", {
          defaultValue:
            "Rechner, Anfrage und Partnerübersicht greifen direkt ineinander und sparen unnötige Zwischenschritte.",
        }),
      },
    ],
    [t]
  );

  const quickActions = useMemo(
    () => [
      {
        icon: FaCalculator,
        title: t("quick.0.title", {
          defaultValue: "Hypothekenrechner",
        }),
        text: t("quick.0.text", {
          defaultValue:
            "Berechnen Sie monatliche Rate, Kreditbetrag und Gesamtkosten sofort.",
        }),
        to: "/mortgage/calculator",
        variant: "primary",
      },
      {
        icon: FaFileSignature,
        title: t("quick.1.title", {
          defaultValue: "Finanzierungsanfrage",
        }),
        text: t("quick.1.text", {
          defaultValue:
            "Senden Sie eine unverbindliche Anfrage und starten Sie Ihren Finanzierungsprozess.",
        }),
        to: "/mortgage/request",
        variant: "secondary",
      },
      {
        icon: FaUniversity,
        title: t("quick.2.title", {
          defaultValue: "Finanzierungspartner:innen",
        }),
        text: t("quick.2.text", {
          defaultValue:
            "Erfahren Sie, wie die Zusammenarbeit mit Banken und Finanzierungspartner:innen funktioniert.",
        }),
        to: "/mortgage/partners",
        variant: "ghost",
      },
    ],
    [t]
  );

  return (
    <>
      <SiteMeta
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        lang={lang}
      />

      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12">
          {/* HERO */}
          <section className="grid gap-10 lg:grid-cols-[1.08fr,0.92fr] items-center">
            {/* IMAGE / HERO CARD */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <img
                src={mortgageImage}
                alt={t("imgAlt", {
                  defaultValue: "Baufinanzierung bei MyHome24App",
                })}
                className="w-full h-[320px] md:h-[430px] object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <img
                src={logo}
                alt="MyHome24App"
                className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
              />

              <div className="absolute left-6 right-6 bottom-6 space-y-3 text-white">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-600/95 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    <FaPercentage className="mr-2" />
                    {t("hero.badge", { defaultValue: "Finanzierung" })}
                  </span>

                  <span className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-4 py-1 text-xs font-semibold text-slate-100">
                    {t("hero.badge2", {
                      defaultValue: "Sicher • Transparent • Modern",
                    })}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                  {t("hero.title", {
                    defaultValue: "Baufinanzierung einfach, klar und vertrauensvoll planen",
                  })}
                </h1>

                <p className="max-w-xl text-sm md:text-base text-slate-200">
                  {t("hero.subtitle", {
                    defaultValue:
                      "Von der ersten Monatsrate bis zur unverbindlichen Anfrage: Mit MyHome24App strukturieren Sie Ihren Finanzierungsweg professionell und verständlich.",
                  })}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => go("/mortgage/calculator")}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition"
                  >
                    {t("cta.primary", {
                      defaultValue: "Zum Hypothekenrechner",
                    })}
                    <FaArrowRight className="ml-2" />
                  </button>

                  <button
                    type="button"
                    onClick={() => go("/mortgage/request")}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition"
                  >
                    {t("cta.secondary", {
                      defaultValue: "Finanzierungsanfrage senden",
                    })}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                  {t("featuresTitle", {
                    defaultValue: "Was Sie auf dieser Seite erwartet",
                  })}
                </h2>

                <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-200">
                  {t("introText", {
                    defaultValue:
                      "Diese Finanzierungswelt ist so aufgebaut, dass Nutzer:innen nicht nur rechnen, sondern verstehen, vergleichen und den nächsten Schritt direkt sicher gehen können.",
                  })}
                </p>
              </div>

              {/* TRUST STRIP */}
              <div className="grid gap-3 sm:grid-cols-3">
                {trustItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                          <Icon className="text-emerald-600 dark:text-emerald-400" />
                        </span>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {item.title}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* FEATURE LIST */}
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="mt-1 h-8 w-8 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {idx + 1}
                    </div>

                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                        {feature.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* MICRO TRUST NOTE */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="mt-0.5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {t("securityNote.title", {
                        defaultValue: "Vertrauen ist hier entscheidend",
                      })}
                    </h3>
                    <p className="mt-1 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                      {t("securityNote.text", {
                        defaultValue:
                          "Gerade bei Finanzierung und Bankenkommunikation zählen klare Informationen, nachvollziehbare Schritte und ein seriöser Auftritt. Genau darauf ist dieser Bereich ausgerichtet.",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
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
                    "group text-left rounded-3xl border px-5 py-5 transition shadow-sm",
                    "bg-white hover:bg-slate-50 border-slate-200",
                    "dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:border-slate-800",
                    isPrimary ? "ring-1 ring-emerald-500/30" : "",
                    isSecondary ? "ring-1 ring-blue-500/20" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${
                        isPrimary
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : isSecondary
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <Icon />
                    </span>

                    <div className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {c.title}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {c.text}
                  </p>

                  <div className="mt-5">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition",
                        isPrimary
                          ? "bg-emerald-600 text-white"
                          : isSecondary
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
                      ].join(" ")}
                    >
                      {t("quick.cta", { defaultValue: "Öffnen" })}
                      <FaArrowRight className="ml-2 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </section>

          {/* STEPS + INFO BOX */}
          <section className="grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-50">
                {t("stepsTitle", { defaultValue: "So funktioniert der Ablauf" })}
              </h2>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="mt-1 h-8 w-8 flex-none rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold dark:bg-slate-950">
                      {idx + 1}
                    </div>

                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                        {step.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-5 md:px-6 md:py-6 shadow-inner">
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                {t("infoBoxTitle", { defaultValue: "Wichtiger Hinweis" })}
              </h3>

              <p className="text-sm text-slate-800 dark:text-slate-100 mb-4">
                {t("infoBoxText", {
                  defaultValue:
                    "Rechner und Inhalte helfen bei der Orientierung. Für konkrete Finanzierungsangebote und eine individuelle Prüfung nutzen Sie bitte die Anfragefunktion.",
                })}
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t("disclaimer", {
                  defaultValue:
                    "Keine Finanzberatung. Konditionen können je nach Bonität, Objekt und Bank abweichen.",
                })}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go("/mortgage/request")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t("cta.secondary", {
                    defaultValue: "Finanzierungsanfrage senden",
                  })}
                </button>

                <button
                  type="button"
                  onClick={() => go("/mortgage/partners")}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-600/30 bg-white/70 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-white transition dark:bg-slate-900/60 dark:text-emerald-200"
                >
                  {t("cta.partners", {
                    defaultValue: "Partner:innen ansehen",
                  })}
                </button>
              </div>
            </aside>
          </section>

          {/* FAQ */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-50">
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
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
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

          {/* BOTTOM CTA */}
          <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-emerald-50 to-white px-5 py-6 shadow-sm dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900/80 md:px-6 md:py-7">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="max-w-2xl">
                <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {t("bottomCta.title", {
                    defaultValue: "Bereit für den nächsten Schritt?",
                  })}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {t("bottomCta.text", {
                    defaultValue:
                      "Starten Sie mit dem Rechner, senden Sie eine Anfrage oder informieren Sie sich über unsere Finanzierungspartner:innen.",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go("/mortgage/calculator")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t("cta.primary", {
                    defaultValue: "Zum Hypothekenrechner",
                  })}
                </button>

                <button
                  type="button"
                  onClick={() => go("/mortgage/request")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {t("cta.secondary", {
                    defaultValue: "Anfrage senden",
                  })}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* MOBILE STICKY CTA */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3">
            <button
              type="button"
              onClick={() => go("/mortgage/calculator")}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <FaCalculator className="mr-2" />
              {t("sticky.calculator", { defaultValue: "Rechner" })}
            </button>

            <button
              type="button"
              onClick={() => go("/mortgage/request")}
              className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-50 bg-white/70 dark:bg-transparent"
            >
              <FaFileSignature className="mr-2" />
              {t("sticky.request", { defaultValue: "Anfrage" })}
            </button>
          </div>
        </div>

        <div className="md:hidden h-16" />
      </main>
    </>
  );
};

export default MortgagePage;