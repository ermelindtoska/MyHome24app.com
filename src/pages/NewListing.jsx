import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaRegEdit,
  FaImage,
  FaBullhorn,
  FaMoneyBillAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import newListingImg from "../assets/new-listing.png";
import logo from "../assets/logo.png";

const NewListing = () => {
  const { t } = useTranslation("newListing");

  const rawFeatures = t("features", { returnObjects: true });
  const features = Array.isArray(rawFeatures) ? rawFeatures : [];

  const icons = [FaRegEdit, FaImage, FaBullhorn, FaMoneyBillAlt];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[320px] lg:min-h-[620px]">
              <img
                src={newListingImg}
                alt={t("imageAlt")}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent lg:bg-gradient-to-r lg:from-slate-950/80 lg:via-slate-950/30 lg:to-transparent" />

              <img
                src={logo}
                alt="MyHome24App"
                className="absolute right-4 top-4 h-10 w-auto rounded-xl bg-white/90 p-1.5 shadow-lg backdrop-blur dark:bg-slate-900/90 md:h-12"
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-100 backdrop-blur-sm">
                  {t("hero.badge")}
                </div>

                <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl xl:text-5xl">
                  {t("title")}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
                  {t("hero.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 md:p-8 xl:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                  {t("intro.eyebrow")}
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
                  {t("intro.title")}
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                  {t("description")}
                </p>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <FaCheckCircle />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 md:text-base">
                        {t("highlight.title")}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {t("highlight.text")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  {t("button")}
                  <FaArrowRight className="ml-2" />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("secondaryButton")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 md:mt-14">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
              {t("featuresSection.eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
              {t("featuresSection.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
              {t("featuresSection.text")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = icons[index] || FaRegEdit;

              return (
                <article
                  key={`${feature.title}-${index}`}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                    <Icon className="text-lg text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 md:mt-14">
          <div className="rounded-[28px] border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-400">
                  {t("tipLabel")}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {t("tipTitle")}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 md:text-base">
                  {t("tipText")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {t("button")}
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewListing;