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
  FaArrowRight,
  FaPlug,
  FaClipboardCheck,
  FaRegBuilding,
  FaChartLine,
} from "react-icons/fa";
import SiteMeta from "../components/SEO/SiteMeta";

const FinancePartnerDashboard = () => {
  const { t, i18n } = useTranslation("financePartnerDashboard");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/dashboard/finance-partner`;

  const stats = useMemo(
    () => ({
      activeListings: 0,
      openLeads: 0,
      pendingApplications: 0,
      integrations: 0,
    }),
    []
  );

  const roadmapItems = t("roadmap.items", { returnObjects: true });
  const profileItems = t("sections.profile.items", { returnObjects: true });
  const integrationItems = t("sections.integration.items", { returnObjects: true });
  const complianceItems = t("sections.compliance.items", { returnObjects: true });

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900 dark:bg-slate-950 dark:text-slate-50 md:pt-0">
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
      />

      <main className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 md:px-6 md:py-12">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-sky-500/10" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                  <FaHandshake className="text-xs" />
                  {t("badge")}
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                  {t("title")}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                  {t("subtitle")}
                </p>

                {currentUser && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    {t("welcome", { email: currentUser.email || "" })}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[320px]">
                <button
                  type="button"
                  onClick={() => navigate("/mortgage/calculator")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50 dark:hover:bg-slate-900"
                >
                  <FaChartBar className="mr-2" />
                  {t("actions.goToCalculator")}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/contact?topic=financing-partner")}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
                >
                  <FaHandshake className="mr-2" />
                  {t("actions.contactPlatform")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            icon={FaRegBuilding}
            label={t("stats.activeListings")}
            value={stats.activeListings}
            accent="emerald"
          />
          <StatCard
            icon={FaHandshake}
            label={t("stats.openLeads")}
            value={stats.openLeads}
            accent="sky"
          />
          <StatCard
            icon={FaClipboardCheck}
            label={t("stats.pendingApplications")}
            value={stats.pendingApplications}
            accent="amber"
          />
          <StatCard
            icon={FaPlug}
            label={t("stats.integrations")}
            value={stats.integrations}
            accent="violet"
          />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-2">
                <FaChartLine className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 md:text-xl">
                  {t("stats.title")}
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {t("stats.hint")}
              </p>
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
              {t("stats.statusLabel")}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <InfoCard
            icon={FaUserTie}
            badge={t("sections.profile.badge")}
            title={t("sections.profile.title")}
            text={t("sections.profile.text")}
            items={Array.isArray(profileItems) ? profileItems : []}
          />

          <InfoCard
            icon={FaTools}
            badge={t("sections.integration.badge")}
            title={t("sections.integration.title")}
            text={t("sections.integration.text")}
            items={Array.isArray(integrationItems) ? integrationItems : []}
          />

          <InfoCard
            icon={FaShieldAlt}
            badge={t("sections.compliance.badge")}
            title={t("sections.compliance.title")}
            text={t("sections.compliance.text")}
            items={Array.isArray(complianceItems) ? complianceItems : []}
          />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaTools className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 md:text-xl">
                  {t("roadmap.title")}
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {t("roadmap.text")}
              </p>
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
              {t("roadmap.disclaimer")}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Array.isArray(roadmapItems) &&
              roadmapItems.map((item, index) => (
                <RoadmapItem
                  key={`${item.title}-${index}`}
                  step={index + 1}
                  title={item.title}
                  text={item.text}
                />
              ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-emerald-50 to-sky-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 md:text-xl">
                {t("bottomCta.title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {t("bottomCta.text")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/mortgage/calculator")}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t("actions.goToCalculator")}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/contact?topic=financing-partner")}
                className="inline-flex items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {t("actions.contactPlatform")}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent = "emerald" }) => {
  const accentMap = {
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    sky:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    violet:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50 md:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentMap[accent]}`}
        >
          <Icon className="text-base" />
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, badge, title, text, items }) => (
  <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
        <Icon className="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          {badge}
        </p>
        <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50 md:text-lg">
          {title}
        </h3>
      </div>
    </div>

    <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {text}
    </p>

    {Array.isArray(items) && items.length > 0 && (
      <ul className="mt-4 space-y-2">
        {items.map((item, idx) => (
          <li
            key={`${item}-${idx}`}
            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}
  </article>
);

const RoadmapItem = ({ step, title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-800">
        {step}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 md:text-base">
          {title}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 md:text-sm">
          {text}
        </p>
      </div>
    </div>
  </div>
);

export default FinancePartnerDashboard;