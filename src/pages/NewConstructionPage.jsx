import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaBuilding,
  FaEuroSign,
  FaLeaf,
  FaClipboardCheck,
  FaArrowRight,
  FaShieldAlt,
  FaHome,
} from "react-icons/fa";
import newConstructionImg from "../assets/new-construction.png";
import SiteMeta from "../components/SEO/SiteMeta";

const NewConstructionPage = () => {
  const { t, i18n } = useTranslation("newConstruction");
  const lang = i18n.language?.slice(0, 2) || "de";

  const reasons = t("reasons.items", { returnObjects: true });
  const steps = t("steps.items", { returnObjects: true });
  const stats = t("stats.items", { returnObjects: true });
  const faq = t("faq.items", { returnObjects: true });
  const checklist = t("checklist.items", { returnObjects: true });

  const safeReasons = Array.isArray(reasons) ? reasons : [];
  const safeSteps = Array.isArray(steps) ? steps : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeFaq = Array.isArray(faq) ? faq : [];
  const safeChecklist = Array.isArray(checklist) ? checklist : [];

  const reasonIcons = useMemo(
    () => [FaBuilding, FaLeaf, FaEuroSign, FaShieldAlt],
    []
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("metaTitle", {
          defaultValue: "Neubauprojekte in Deutschland – MyHome24App",
        })}
        description={t("metaDescription", {
          defaultValue:
            "Entdecken Sie moderne Neubauprojekte, Eigentumswohnungen und Häuser in Deutschland. Vergleichen Sie Standorte, Vorteile, Finanzierungsmöglichkeiten und nächste Schritte – professionell und transparent.",
        })}
        path="/new-construction"
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-600/10 border border-blue-600/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                {t("hero.badge")}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {t("hero.badgeSecondary")}
              </span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {t("hero.title")}
              </h1>
              <p className="mt-4 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                {t("hero.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/buy?newConstruction=1"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
              >
                {t("hero.primaryCta")}
                <FaArrowRight className="ml-2" />
              </Link>

              <Link
                to="/mortgage/calculator"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("hero.secondaryCta")}
              </Link>

              <Link
                to="/contact?topic=new-construction"
                className="inline-flex items-center justify-center rounded-full border border-blue-600/30 bg-blue-600/10 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-600/15 transition dark:text-blue-300"
              >
                {t("hero.tertiaryCta")}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {safeStats.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <img
              src={newConstructionImg}
              alt={t("hero.imageAlt")}
              className="w-full h-[320px] md:h-[520px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

            <div className="absolute left-5 right-5 bottom-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-4 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-100">
                <FaHome />
                {t("hero.overlayBadge")}
              </div>
              <h2 className="mt-2 text-lg md:text-xl font-semibold">
                {t("hero.overlayTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-100">
                {t("hero.overlayText")}
              </p>
            </div>
          </div>
        </section>

        {/* TIP BOX */}
        <section className="rounded-3xl border border-blue-200 bg-blue-50/80 px-6 py-6 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/30">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-blue-900 dark:text-blue-200">
                {t("tip.title")}
              </h2>
              <p className="mt-2 text-sm md:text-base text-blue-900/90 dark:text-blue-100/90 max-w-3xl">
                {t("tip.text")}
              </p>
            </div>

            <Link
              to="/mortgage/calculator"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              {t("tip.button")}
            </Link>
          </div>
        </section>

        {/* REASONS */}
        <section>
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("reasons.title")}
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300">
              {t("reasons.intro")}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {safeReasons.map((item, idx) => {
              const Icon = reasonIcons[idx % reasonIcons.length];
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 flex-none rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                      <Icon className="text-blue-700 dark:text-blue-300" />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEPS + CHECKLIST */}
        <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("steps.title")}
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-6 max-w-2xl">
              {t("steps.intro")}
            </p>

            <div className="space-y-4">
              {safeSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="h-9 w-9 flex-none rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>

                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-emerald-200 bg-emerald-50/70 px-5 py-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <FaClipboardCheck className="text-emerald-700 dark:text-emerald-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
                  {t("checklist.title")}
                </h3>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80">
                  {t("checklist.subtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {safeChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <FaCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contact?topic=new-construction"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                {t("checklist.ctaPrimary")}
              </Link>

              <Link
                to="/buy?newConstruction=1"
                className="inline-flex items-center justify-center rounded-full border border-emerald-600/30 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
              >
                {t("checklist.ctaSecondary")}
              </Link>
            </div>
          </aside>
        </section>

        {/* FAQ */}
        <section>
          <div className="max-w-3xl mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("faq.title")}
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300">
              {t("faq.intro")}
            </p>
          </div>

          <div className="space-y-3">
            {safeFaq.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                  <span>{item.question}</span>
                  <span className="text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="max-w-2xl">
              <h3 className="text-xl md:text-2xl font-semibold">
                {t("contactCta.title")}
              </h3>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300">
                {t("contactCta.text")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact?topic=new-construction"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                {t("contactCta.button")}
              </Link>

              <Link
                to="/mortgage/calculator"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {t("contactCta.secondaryButton")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default NewConstructionPage;