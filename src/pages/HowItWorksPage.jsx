// src/pages/HowItWorksPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkedAlt,
  FaHeart,
  FaComments,
  FaCheckCircle,
  FaArrowRight,
  FaHome,
  FaUserTie,
  FaShieldAlt,
} from "react-icons/fa";
import SiteMeta from "../components/SEO/SiteMeta";

const HowItWorksPage = () => {
  const { t, i18n } = useTranslation("howItWorks");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/how-it-works`;

  const rawSteps = t("steps", { returnObjects: true });
  const steps = Array.isArray(rawSteps) ? rawSteps : [];

  const stepIcons = [FaSearch, FaMapMarkedAlt, FaHeart, FaComments];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("metaTitle", {
          defaultValue: "So funktioniert MyHome24App – Immobilien einfach finden",
        })}
        description={t("metaDescription", {
          defaultValue:
            "Erfahren Sie Schritt für Schritt, wie MyHome24App beim Suchen, Vergleichen und Kontaktieren rund um Immobilien in Deutschland funktioniert.",
        })}
        canonical={canonical}
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center mb-14 md:mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-blue-600/10 border border-blue-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              <span className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
              {t("badge", { defaultValue: "Einfach erklärt" })}
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                {t("title", {
                  defaultValue: "So funktioniert MyHome24App",
                })}
              </h1>

              <p className="max-w-2xl text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {t("intro", {
                  defaultValue:
                    "Von der ersten Suche bis zur Kontaktaufnahme: Entdecken Sie, wie Sie mit MyHome24App Immobilien in Deutschland schneller finden, vergleichen und besser bewerten können.",
                })}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoMiniCard
                title={t("heroStats.0.title", { defaultValue: "Suchen" })}
                text={t("heroStats.0.text", {
                  defaultValue: "Filtern Sie nach Stadt, Preis und Immobilientyp.",
                })}
              />
              <InfoMiniCard
                title={t("heroStats.1.title", { defaultValue: "Vergleichen" })}
                text={t("heroStats.1.text", {
                  defaultValue: "Speichern Sie Favoriten und prüfen Sie Angebote nebeneinander.",
                })}
              />
              <InfoMiniCard
                title={t("heroStats.2.title", { defaultValue: "Kontaktieren" })}
                text={t("heroStats.2.text", {
                  defaultValue: "Nehmen Sie direkt Kontakt zu Eigentümer:innen oder Makler:innen auf.",
                })}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate("/buy")}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
              >
                {t("ctaPrimary", { defaultValue: "Jetzt starten" })}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("ctaSecondary", { defaultValue: "Fragen stellen" })}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              {t("quickOverviewTitle", { defaultValue: "Kurzüberblick" })}
            </h2>

            <div className="space-y-4">
              <QuickRow
                icon={<FaHome />}
                title={t("quickOverview.0.title", { defaultValue: "Immobilien entdecken" })}
                text={t("quickOverview.0.text", {
                  defaultValue: "Kaufen oder mieten – mit moderner Kartenansicht und smarter Suche.",
                })}
              />
              <QuickRow
                icon={<FaHeart />}
                title={t("quickOverview.1.title", { defaultValue: "Favoriten merken" })}
                text={t("quickOverview.1.text", {
                  defaultValue: "Speichern Sie interessante Angebote für später.",
                })}
              />
              <QuickRow
                icon={<FaUserTie />}
                title={t("quickOverview.2.title", { defaultValue: "Makler:innen finden" })}
                text={t("quickOverview.2.text", {
                  defaultValue: "Entdecken Sie passende Ansprechpartner:innen für Ihre Region.",
                })}
              />
              <QuickRow
                icon={<FaShieldAlt />}
                title={t("quickOverview.3.title", { defaultValue: "Mehr Transparenz" })}
                text={t("quickOverview.3.text", {
                  defaultValue: "Vergleichen Sie Preise, Größen und wichtige Details besser auf einen Blick.",
                })}
              />
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="mb-14 md:mb-16">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("stepsTitle", { defaultValue: "Schritt für Schritt" })}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
              {t("stepsIntro", {
                defaultValue:
                  "So läuft die Nutzung auf der Plattform typischerweise ab – einfach, übersichtlich und auf moderne Immobiliensuche ausgerichtet.",
              })}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = stepIcons[index % stepIcons.length];
              const title =
                typeof step === "string"
                  ? step
                  : step?.title || t(`stepFallback.${index}`, { defaultValue: `Schritt ${index + 1}` });

              const text =
                typeof step === "object"
                  ? step?.text || step?.description || ""
                  : t(`stepDescriptions.${index}`, {
                      defaultValue:
                        "Beschreiben Sie hier in Ihren Übersetzungen genauer, was in diesem Schritt passiert.",
                    });

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                      <Icon className="text-blue-700 dark:text-blue-300" />
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("stepLabel", { defaultValue: "Schritt" })} {index + 1}
                    </div>
                  </div>

                  <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* WHY IT HELPS */}
        <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-start mb-14 md:mb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {t("benefitsTitle", { defaultValue: "Warum das hilfreich ist" })}
            </h2>

            <div className="space-y-3">
              <BenefitRow
                text={t("benefits.0", {
                  defaultValue: "Sie sparen Zeit durch eine klar strukturierte Suche.",
                })}
              />
              <BenefitRow
                text={t("benefits.1", {
                  defaultValue: "Sie sehen Angebote, Preise und Größen schneller im direkten Vergleich.",
                })}
              />
              <BenefitRow
                text={t("benefits.2", {
                  defaultValue: "Sie können gezielt nach Regionen, Typen und Zwecken filtern.",
                })}
              />
              <BenefitRow
                text={t("benefits.3", {
                  defaultValue: "Sie haben einen einfacheren Weg zur Kontaktaufnahme mit Anbieter:innen.",
                })}
              />
            </div>
          </div>

          <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-5 md:px-6 md:py-6 shadow-inner">
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              {t("tipTitle", { defaultValue: "Tipp" })}
            </h3>

            <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed mb-4">
              {t("tipText", {
                defaultValue:
                  "Nutzen Sie zuerst die Kartenansicht und speichern Sie interessante Objekte in den Favoriten. So behalten Sie auch bei vielen Ergebnissen leichter den Überblick.",
              })}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t("tipHint", {
                defaultValue:
                  "Besonders hilfreich bei der Suche in größeren Städten oder bei mehreren passenden Stadtteilen.",
              })}
            </p>
          </aside>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:px-8 md:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {t("bottomCta.title", {
                  defaultValue: "Bereit für die Immobiliensuche?",
                })}
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300">
                {t("bottomCta.text", {
                  defaultValue:
                    "Starten Sie jetzt mit Kaufen, Mieten oder der Suche nach passenden Makler:innen auf MyHome24App.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/buy")}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
              >
                {t("bottomCta.buy", { defaultValue: "Immobilien kaufen" })}
              </button>

              <button
                type="button"
                onClick={() => navigate("/rent")}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("bottomCta.rent", { defaultValue: "Immobilien mieten" })}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const InfoMiniCard = ({ title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
      {title}
    </h3>
    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
      {text}
    </p>
  </div>
);

const QuickRow = ({ icon, title, text }) => (
  <div className="flex items-start gap-3">
    <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-700 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-300">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        {text}
      </p>
    </div>
  </div>
);

const BenefitRow = ({ text }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 dark:bg-slate-950/40 dark:border-slate-800">
    <FaCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
    <p className="text-sm text-slate-700 dark:text-slate-200">{text}</p>
  </div>
);

export default HowItWorksPage;