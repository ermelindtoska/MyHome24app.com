// src/pages/FinancePartnerDashboard.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHandshake,
  FaChartBar,
  FaShieldAlt,
  FaTools,
  FaUserTie,
} from "react-icons/fa";
import SiteMeta from "../components/SEO/SiteMeta";

const FinancePartnerDashboard = () => {
  const { t, i18n } = useTranslation("financePartnerDashboard");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/dashboard/finance-partner`;

  // placeholder statistika derisa të kemi të dhëna reale
  const stats = useMemo(
    () => ({
      activeListings: 0,
      openLeads: 0,
      pendingApplications: 0,
      integrations: 0,
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold mb-1">
              {t("badge")}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              {t("title")}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mt-1 max-w-2xl">
              {t("subtitle")}
            </p>
            {currentUser && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {t("welcome", {
                  email: currentUser.email || "",
                })}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/mortgage/calculator")}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs md:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FaChartBar className="mr-2" />
              {t("actions.goToCalculator")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact?topic=financing-partner")}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition"
            >
              <FaHandshake className="mr-2" />
              {t("actions.contactPlatform")}
            </button>
          </div>
        </header>

        {/* STATS */}
        <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className="text-emerald-400" />
            {t("stats.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label={t("stats.activeListings")}
              value={stats.activeListings}
            />
            <StatCard
              label={t("stats.openLeads")}
              value={stats.openLeads}
            />
            <StatCard
              label={t("stats.pendingApplications")}
              value={stats.pendingApplications}
            />
            <StatCard
              label={t("stats.integrations")}
              value={stats.integrations}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
            {t("stats.hint")}
          </p>
        </section>

        {/* KOLUMNAT KRYESORE */}
        <section className="grid gap-6 md:grid-cols-3">
          <InfoCard
            icon={FaUserTie}
            badge={t("sections.profile.badge")}
            title={t("sections.profile.title")}
            text={t("sections.profile.text")}
            items={t("sections.profile.items", { returnObjects: true }) || []}
          />
          <InfoCard
            icon={FaTools}
            badge={t("sections.integration.badge")}
            title={t("sections.integration.title")}
            text={t("sections.integration.text")}
            items={t("sections.integration.items", {
              returnObjects: true,
            }) || []}
          />
          <InfoCard
            icon={FaShieldAlt}
            badge={t("sections.compliance.badge")}
            title={t("sections.compliance.title")}
            text={t("sections.compliance.text")}
            items={t("sections.compliance.items", {
              returnObjects: true,
            }) || []}
          />
        </section>

        {/* ROADMAP / COMING SOON */}
        <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold mb-3 flex items-center gap-2">
            <FaTools className="text-emerald-400" />
            {t("roadmap.title")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-slate-300 mb-4">
            {t("roadmap.text")}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {t("roadmap.items", { returnObjects: true })?.map(
              (item, index) => (
                <RoadmapItem
                  key={index}
                  step={index + 1}
                  title={item.title}
                  text={item.text}
                />
              )
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">
            {t("roadmap.disclaimer")}
          </p>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 px-4 py-3 text-center">
    <div className="text-2xl md:text-3xl font-semibold">{value}</div>
    <div className="mt-1 text-xs md:text-sm text-gray-600 dark:text-slate-300">
      {label}
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, badge, title, text, items }) => (
  <article className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 md:p-5 flex flex-col gap-3 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
        <Icon className="text-emerald-400" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-emerald-500 font-semibold">
          {badge}
        </p>
        <h3 className="text-sm md:text-base font-semibold">{title}</h3>
      </div>
    </div>
    <p className="text-xs md:text-sm text-gray-700 dark:text-slate-300">
      {text}
    </p>
    {Array.isArray(items) && items.length > 0 && (
      <ul className="mt-1 space-y-1 text-xs md:text-sm text-gray-700 dark:text-slate-300">
        {items.map((item, idx) => (
          <li key={idx}>• {item}</li>
        ))}
      </ul>
    )}
  </article>
);

const RoadmapItem = ({ step, title, text }) => (
  <div className="rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-3 flex gap-3">
    <div className="mt-0.5 h-7 w-7 flex-none rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-50">
      {step}
    </div>
    <div>
      <h4 className="text-xs md:text-sm font-semibold mb-1">{title}</h4>
      <p className="text-[11px] md:text-xs text-slate-300">{text}</p>
    </div>
  </div>
);

export default FinancePartnerDashboard;
