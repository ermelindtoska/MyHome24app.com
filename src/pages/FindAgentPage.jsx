// src/pages/FindAgentPage.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaSearchLocation,
  FaStar,
  FaHandshake,
  FaCheckCircle,
  FaArrowRight,
  FaMapMarkedAlt,
} from "react-icons/fa";
import findAgentImage from "../assets/findagent.png";
import SiteMeta from "../components/SEO/SiteMeta";

const FindAgentPage = () => {
  const { t, i18n } = useTranslation("findAgent");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";

  const rawSteps = t("steps.items", { returnObjects: true });
  const safeSteps = Array.isArray(rawSteps) ? rawSteps : [];

  const benefits = useMemo(
    () => [
      {
        icon: <FaSearchLocation />,
        title: t("benefits.items.0.title", {
          defaultValue: "Lokal passende Makler:innen finden",
        }),
        text: t("benefits.items.0.text", {
          defaultValue:
            "Finden Sie passende Expert:innen nach Region, Spezialisierung und Marktkenntnis.",
        }),
      },
      {
        icon: <FaStar />,
        title: t("benefits.items.1.title", {
          defaultValue: "Bewertungen vergleichen",
        }),
        text: t("benefits.items.1.text", {
          defaultValue:
            "Nutzen Sie Erfahrungswerte und Bewertungen für eine sicherere Entscheidung.",
        }),
      },
      {
        icon: <FaHandshake />,
        title: t("benefits.items.2.title", {
          defaultValue: "Direkt Kontakt aufnehmen",
        }),
        text: t("benefits.items.2.text", {
          defaultValue:
            "Kontaktieren Sie Makler:innen direkt und starten Sie ohne Umwege.",
        }),
      },
    ],
    [t]
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("meta.title", { defaultValue: "Makler finden – MyHome24App" })}
        description={t("meta.description", {
          defaultValue:
            "Finden Sie den perfekten Immobilienmakler für Ihre Bedürfnisse. Vergleichen Sie Bewertungen, kontaktieren Sie Agenturen direkt und starten Sie Ihre Immobiliensuche mit professioneller Unterstützung.",
        })}
        path="/agents"
        lang={lang}
      />

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <img
              src={findAgentImage}
              alt={t("hero.imgAlt")}
              className="w-full h-[280px] md:h-[420px] object-cover object-center"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

            <div className="absolute left-6 right-6 bottom-6 space-y-3 text-white">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-600/95 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                  <FaUserTie className="mr-2" />
                  {t("hero.badge")}
                </span>
                <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-4 py-1 text-xs font-semibold">
                  <FaMapMarkedAlt className="mr-2" />
                  {t("hero.badgeSecondary", {
                    defaultValue: "Deutschlandweit",
                  })}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("hero.title")}
              </h1>

              <p className="text-sm md:text-base text-slate-100 max-w-xl">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>

          {/* INFO / CTA */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                {t("intro")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/agent/search")}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
                >
                  {t("cta.search")}
                  <FaArrowRight className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/agent/rate")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-50 dark:hover:bg-slate-900"
                >
                  {t("cta.rate")}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {benefits.map((item, idx) => (
                <BenefitCard
                  key={idx}
                  icon={item.icon}
                  title={item.title}
                  text={item.text}
                />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {t("steps.title")}
            </h2>

            <div className="space-y-4">
              {safeSteps.length > 0 ? (
                safeSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800"
                  >
                    <div
                      className="mt-1 h-8 w-8 flex-none rounded-full bg-blue-600/10 border border-blue-600/25 flex items-center justify-center text-xs font-semibold text-blue-700
                                 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300"
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  {t("steps.empty", {
                    defaultValue: "Die Schritte werden in Kürze ergänzt.",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SIDE CARDS */}
          <div className="space-y-5">
            <aside
              className="rounded-3xl bg-blue-600/10 border border-blue-600/20 px-5 py-5 md:px-6 md:py-6 shadow-inner
                         dark:bg-blue-500/10 dark:border-blue-500/40"
            >
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                {t("tip.title")}
              </h3>
              <p className="text-sm text-slate-900 dark:text-slate-100 mb-4">
                {t("tip.text")}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t("tip.disclaimer")}
              </p>
            </aside>

            <aside className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-5 md:px-6 md:py-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-2xl bg-white/60 border border-emerald-500/20 flex items-center justify-center dark:bg-slate-900/60">
                  <FaCheckCircle className="text-emerald-700 dark:text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                  {t("extraBox.title", {
                    defaultValue: "Warum MyHome24App?",
                  })}
                </h3>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-200">
                {t("extraBox.text", {
                  defaultValue:
                    "Wir verbinden Nutzer:innen mit passenden Makler:innen auf einer modernen, transparenten und lokal ausgerichteten Plattform.",
                })}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/agent/search")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t("extraBox.cta", {
                    defaultValue: "Jetzt Makler:in suchen",
                  })}
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
};

const BenefitCard = ({ icon, title, text }) => (
  <div
    className="rounded-2xl bg-white border border-slate-200 px-4 py-4 flex gap-3 shadow-sm
               dark:bg-slate-900/70 dark:border-slate-800"
  >
    <div
      className="mt-1 h-10 w-10 flex-none rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg text-blue-700
                 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400"
    >
      {icon}
    </div>

    <div>
      <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
        {text}
      </p>
    </div>
  </div>
);

export default FindAgentPage;