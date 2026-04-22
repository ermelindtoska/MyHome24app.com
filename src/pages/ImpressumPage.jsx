import React from "react";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  MdBusiness,
  MdLocationOn,
  MdPerson,
  MdEmail,
  MdPhone,
  MdGavel,
  MdInfoOutline,
} from "react-icons/md";

const InfoCard = ({ icon, title, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300 dark:bg-blue-500/10">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h2>
    </div>
    <div className="text-sm leading-7 text-slate-700 dark:text-slate-300">
      {children}
    </div>
  </section>
);

const ImpressumPage = () => {
  const { t, i18n } = useTranslation("impressum");
  const lang = i18n.language?.slice(0, 2) || "de";

  const title = t("metaTitle", {
    defaultValue: "Impressum – MyHome24App",
  });

  const description = t("metaDescription", {
    defaultValue:
      "Impressum und Anbieterkennzeichnung von MyHome24App gemäß § 5 TMG.",
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}/impressum`}
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        {/* HERO */}
        <section className="mb-10 md:mb-12 grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-600/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <MdInfoOutline className="mr-2" />
              {t("badge")}
            </span>

            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-slate-600 dark:text-slate-300">
              {t("intro")}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              {t("summaryTitle")}
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MdBusiness className="mt-1 text-blue-600 dark:text-blue-300 text-lg" />
                <div>
                  <p className="font-semibold">{t("name")}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t("provider")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MdPerson className="mt-1 text-blue-600 dark:text-blue-300 text-lg" />
                <div>
                  <p className="font-semibold">{t("representedByLabel")}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t("representedBy")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MdLocationOn className="mt-1 text-blue-600 dark:text-blue-300 text-lg" />
                <div>
                  <p className="font-semibold">{t("addressLabel")}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {t("address")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MdEmail className="mt-1 text-blue-600 dark:text-blue-300 text-lg" />
                <div>
                  <p className="font-semibold">{t("emailLabel")}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t("email")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MdPhone className="mt-1 text-blue-600 dark:text-blue-300 text-lg" />
                <div>
                  <p className="font-semibold">{t("phoneLabel")}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t("phone")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="grid gap-6 md:grid-cols-2">
          <InfoCard icon={<MdBusiness className="text-xl" />} title={t("sectionProvider")}>
            <p>{t("providerText")}</p>
            <div className="mt-4">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {t("name")}
              </p>
              <p className="whitespace-pre-line">{t("address")}</p>
            </div>
          </InfoCard>

          <InfoCard icon={<MdPerson className="text-xl" />} title={t("sectionRepresentation")}>
            <p>{t("representedBy")}</p>
          </InfoCard>

          <InfoCard icon={<MdEmail className="text-xl" />} title={t("sectionContact")}>
            <p>
              <span className="font-semibold">{t("emailLabel")}:</span> {t("email")}
            </p>
            <p>
              <span className="font-semibold">{t("phoneLabel")}:</span> {t("phone")}
            </p>
          </InfoCard>

          <InfoCard icon={<MdGavel className="text-xl" />} title={t("sectionLegal")}>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {t("liabilityTitle")}
            </p>
            <p className="mt-2">{t("liabilityText")}</p>
          </InfoCard>
        </section>

        {/* OPTIONAL TAX / REGISTER */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            {t("additionalInfoTitle")}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4 dark:bg-slate-950/40 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {t("vatLabel")}
              </p>
              <p className="mt-1">{t("vatValue")}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4 dark:bg-slate-950/40 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {t("registerLabel")}
              </p>
              <p className="mt-1">{t("registerValue")}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {t("additionalInfoHint")}
          </p>
        </section>
      </div>
    </main>
  );
};

export default ImpressumPage;