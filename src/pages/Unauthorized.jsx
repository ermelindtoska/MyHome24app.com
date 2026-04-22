import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExclamationIcon } from "@heroicons/react/outline";
import SiteMeta from "../components/SEO/SiteMeta";

const Unauthorized = () => {
  const { t, i18n } = useTranslation("unauthorized");
  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/unauthorized`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-16 md:pt-0">
      
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
      />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-4 py-10 md:px-6">
        
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          
          <div className="p-6 md:p-10 text-center">

            {/* ICON */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <ExclamationIcon className="h-10 w-10" />
            </div>

            {/* TITLE */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              {t("title")}
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 md:text-base">
              {t("description")}
            </p>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">

              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                {t("backHome")}
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("login")}
              </Link>

            </div>

          </div>
        </section>

      </main>
    </div>
  );
};

export default Unauthorized;