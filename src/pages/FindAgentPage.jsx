// src/pages/FindAgentPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaSearchLocation, FaStar, FaHandshake } from "react-icons/fa";
import findAgentImage from "../assets/findagent.png";
import SiteMeta from "../components/SEO/SiteMeta";

const FindAgentPage = () => {
  const { t } = useTranslation("findAgent");
  const navigate = useNavigate();

  const benefits = t("benefits.items", { returnObjects: true }) || [];
  const steps = t("steps.items", { returnObjects: true }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* SEO */}
      <SiteMeta
        title={t("meta.title", { defaultValue: "Makler finden – MyHome24App" })}
        description={t("meta.description", {
          defaultValue:
            "Finden Sie den perfekten Immobilienmakler für Ihre Bedürfnisse. Vergleichen Sie Bewertungen, kontaktieren Sie Agenturen direkt und starten Sie Ihre Immobiliensuche mit professioneller Unterstützung.",
        })}
        path="/agents"
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.15fr,0.85fr] items-center">
          {/* Image / card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/60">
            <img
              src={findAgentImage}
              alt={t("hero.imgAlt")}
              className="w-full h-[260px] md:h-[360px] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <span className="inline-flex items-center rounded-full bg-blue-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                <FaUserTie className="mr-2" />
                {t("hero.badge")}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("hero.title")}
              </h1>
              <p className="text-sm md:text-base text-slate-200 max-w-xl">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>

          {/* Info / CTA */}
          <div className="space-y-6">
            <p className="text-sm md:text-base text-slate-200">
              {t("intro")}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* kutitë e avantazheve */}
              <BenefitCard
                icon={<FaSearchLocation />}
                title={t("benefits.items.0.title")}
                text={t("benefits.items.0.text")}
              />
              <BenefitCard
                icon={<FaStar />}
                title={t("benefits.items.1.title")}
                text={t("benefits.items.1.text")}
              />
              <BenefitCard
                icon={<FaHandshake />}
                title={t("benefits.items.2.title")}
                text={t("benefits.items.2.text")}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/agent/search")}
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition"
              >
                {t("cta.search")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/agent/rate")}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
              >
                {t("cta.rate")}
              </button>
            </div>
          </div>
        </section>

        {/* Hapat – si funksionon */}
        <section className="mt-12 md:mt-16 grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {t("steps.title")}
            </h2>
            <div className="space-y-4">
              {Array.isArray(steps) &&
                steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3"
                  >
                    <div className="mt-1 h-7 w-7 flex-none rounded-full bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-xs font-semibold text-blue-300">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-50">
                        {step.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Box me tip */}
          <aside className="rounded-3xl bg-blue-500/10 border border-blue-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              {t("tip.title")}
            </h3>
            <p className="text-sm text-slate-100 mb-4">
              {t("tip.text")}
            </p>
            <p className="text-xs text-slate-400">
              {t("tip.disclaimer")}
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, text }) => (
  <div className="rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-4 flex gap-3">
    <div className="mt-1 h-9 w-9 flex-none rounded-full bg-slate-800 flex items-center justify-center text-lg text-blue-400">
      {icon}
    </div>
    <div>
      <h3 className="text-sm md:text-base font-semibold text-slate-50">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-slate-300">{text}</p>
    </div>
  </div>
);

export default FindAgentPage;
