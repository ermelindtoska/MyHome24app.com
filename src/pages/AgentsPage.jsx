// src/pages/AgentsPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  MdPersonSearch,
  MdStarRate,
  MdPersonAddAlt,
  MdHandshake,
  MdMap,
  MdShield,
} from "react-icons/md";
import agentSearchImg from "../assets/agent-search.png";
import logo from "../assets/logo.png";

const AgentsPage = () => {
  const { t } = useTranslation("agent");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Helmet>
        <title>{t("hero.title")} – MyHome24App</title>
        <meta name="description" content={t("hero.metaDescription")} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center mb-12 md:mb-16">
          {/* Bildseite */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={agentSearchImg}
              alt={t("hero.imageAlt")}
              className="w-full h-[320px] md:h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                {t("hero.badge")}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("hero.title")}
              </h1>
              <p className="text-sm md:text-base text-slate-200 max-w-xl">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/agent/search")}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
                >
                  <MdPersonSearch className="mr-2" />
                  {t("hero.ctaSearch")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/agent/rate")}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
                >
                  <MdStarRate className="mr-2" />
                  {t("hero.ctaRate")}
                </button>
              </div>
            </div>
          </div>

          {/* Textseite */}
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-blue-400">
              {t("overview.title")}
            </h2>
            <p className="text-sm md:text-base text-slate-200">
              {t("overview.text")}
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3">
                <div className="mt-1 h-8 w-8 flex-none rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400 text-lg">
                  <MdPersonSearch />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold">
                    {t("overview.searchTitle")}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    {t("overview.searchText")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3">
                <div className="mt-1 h-8 w-8 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
                  <MdStarRate />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold">
                    {t("overview.rateTitle")}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    {t("overview.rateText")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3">
                <div className="mt-1 h-8 w-8 flex-none rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg">
                  <MdPersonAddAlt />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold">
                    {t("overview.becomeTitle")}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    {t("overview.becomeText")}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/contact?topic=agents")}
              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
            >
              <MdHandshake className="mr-2" />
              {t("overview.ctaContact")}
            </button>
          </div>
        </section>

        {/* WIE ES FUNKTIONIERT */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            {t("howItWorks.title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                1.
              </p>
              <h3 className="text-sm md:text-base font-semibold mb-1">
                {t("howItWorks.step1.title")}
              </h3>
              <p className="text-xs md:text-sm text-slate-300">
                {t("howItWorks.step1.text")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                2.
              </p>
              <h3 className="text-sm md:text-base font-semibold mb-1">
                {t("howItWorks.step2.title")}
              </h3>
              <p className="text-xs md:text-sm text-slate-300">
                {t("howItWorks.step2.text")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                3.
              </p>
              <h3 className="text-sm md:text-base font-semibold mb-1">
                {t("howItWorks.step3.title")}
              </h3>
              <p className="text-xs md:text-sm text-slate-300">
                {t("howItWorks.step3.text")}
              </p>
            </div>
          </div>
        </section>

        {/* VORTEILE */}
        <section className="mb-12 md:mb-16 grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <MdShield className="mr-2 text-emerald-400" />
              {t("benefits.title")}
            </h2>
            <ul className="space-y-2 text-sm md:text-base text-slate-200">
              <li className="flex items-start gap-2">
                <MdMap className="mt-1 text-blue-400" />
                <span>{t("benefits.point1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <MdHandshake className="mt-1 text-emerald-400" />
                <span>{t("benefits.point2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <MdStarRate className="mt-1 text-yellow-400" />
                <span>{t("benefits.point3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <MdPersonSearch className="mt-1 text-purple-400" />
                <span>{t("benefits.point4")}</span>
              </li>
            </ul>
          </div>

          {/* Box für Makler*innen */}
          <aside className="rounded-3xl bg-slate-900/80 border border-blue-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              {t("forAgents.title")}
            </h3>
            <p className="text-sm text-slate-100 mb-4">
              {t("forAgents.text")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <MdPersonAddAlt className="mr-2" />
              {t("forAgents.cta")}
            </button>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default AgentsPage;
