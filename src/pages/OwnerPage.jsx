// src/pages/OwnerPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaHandshake,
  FaUserTie,
  FaComments,
  FaEye,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import ownerHeader from "../assets/owner-header.png";
import SiteMeta from "../components/SEO/SiteMeta";

const OwnerPage = () => {
  const { t, i18n } = useTranslation("owner");
  const lang = i18n.language?.slice(0, 2) || "de";

  const metaTitle =
    t("metaTitle", {
      defaultValue: "Direkt vom Eigentümer:innen – MyHome24App",
    }) || "Direkt vom Eigentümer:innen – MyHome24App";

  const metaDescription =
    t("metaDescription", {
      defaultValue:
        "Immobilien direkt von Eigentümer:innen – ohne Maklerprovision, mit persönlichem Kontakt und flexiblen Vereinbarungen.",
    }) ||
    "Immobilien direkt von Eigentümer:innen – ohne Maklerprovision, mit persönlichem Kontakt und flexiblen Vereinbarungen.";

  const rawFeatures = t("features", { returnObjects: true });
  const features = Array.isArray(rawFeatures) ? rawFeatures : [];

  const icons = [
    <FaHandshake className="text-emerald-600 dark:text-emerald-300 text-lg" />,
    <FaUserTie className="text-sky-600 dark:text-sky-300 text-lg" />,
    <FaComments className="text-violet-600 dark:text-violet-300 text-lg" />,
    <FaEye className="text-orange-600 dark:text-orange-300 text-lg" />,
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={metaTitle}
        description={metaDescription}
        path="/buy/owner"
        lang={lang}
      />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              {t("badge")}
            </p>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl xl:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
              {t("description")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/buy?directOwner=1"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                {t("ctaListings")}
                <FaArrowRight className="ml-2" />
              </Link>

              <a
                href="#owner-benefits"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900/70"
              >
                {t("ctaSecondary")}
              </a>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:max-w-xl">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <FaCheckCircle />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t("highlight.label")}
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t("highlight.text")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <img
                src={ownerHeader}
                alt={t("imageAlt")}
                className="h-[320px] w-full object-cover md:h-[460px]"
                loading="lazy"
              />
            </div>

            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-slate-950/15 via-transparent to-transparent pointer-events-none" />

            <div className="hidden md:flex absolute -bottom-5 -left-5 max-w-xs items-start gap-3 rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 text-sm shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
              <FaHandshake className="mt-0.5 text-lg text-emerald-600 dark:text-emerald-300" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {t("highlight.label")}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("highlight.text")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="owner-benefits"
        className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-16"
      >
        <div className="mb-6 max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
            {t("featuresTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
            {t("featuresLead")}
          </p>
        </div>

        <ul className="grid gap-5 md:grid-cols-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/70">
                  {icons[index % icons.length]}
                </div>

                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100 md:text-base">
                    {feature.title}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="rounded-[28px] border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 md:p-7">
          <h2 className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-200 md:text-xl">
            {t("tipTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 md:text-base">
            {t("tipText")}
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 md:py-12 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1 rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("readyTitle")}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t("readyText")}
            </p>
            <Link
              to="/buy?directOwner=1"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              {t("button")}
              <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="flex-1 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 lg:max-w-md">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("ownerCta.title")}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t("ownerCta.text")}
            </p>
            <Link
              to="/publish"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {t("ownerCta.button")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OwnerPage;