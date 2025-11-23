// src/pages/BankPartnersPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaCheckCircle,
  FaHandshake,
  FaClipboardList,
} from "react-icons/fa";

import bankPartnerImg from "../assets/bank-partners.png";
import logo from "../assets/logo.png";
import SiteMeta from "../components/SEO/SiteMeta";

const BankPartnersPage = () => {
  const { t, i18n } = useTranslation("bankPartners");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage/partners`;

  // Features als Array laden (fallback = [])
  const features = t("features", { returnObjects: true }) || [];

  const icons = [
    FaClipboardList,
    FaCheckCircle,
    FaHandshake,
    FaUserTie,
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* SEO */}
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-mortgage-partners.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
          {/* Bildseite */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={bankPartnerImg}
              alt={t("imgAlt")}
              className="w-full h-[320px] md:h-[420px] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
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

          {/* Textseite */}
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-emerald-400">
              {t("title")}
            </h2>
            <p className="text-sm md:text-base text-slate-200">
              {t("description")}
            </p>

            <div className="space-y-4">
              {Array.isArray(features) &&
                features.map((feature, index) => {
                  const Icon = icons[index % icons.length];
                  return (
                    <div
                      key={index}
                      className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="mt-1 h-8 w-8 flex-none rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                        <Icon className="text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm md:text-base font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-300">
                          {feature.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/contact?topic=financing")}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
              >
                {t("cta.primary")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/mortgage/calculator")}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
              >
                {t("cta.secondary")}
              </button>
              <button
  type="button"
  onClick={() => navigate("/dashboard/finance-partner")}
  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
>
  {t("cta.secondary")} {/* p.sh. „Zum Partnerbereich (Preview)“ */}
</button>
            </div>
          </div>
        </section>

        {/* Partner-Sektionen */}
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 px-5 py-6 md:px-6 md:py-7 space-y-6">
          <h2 className="text-lg md:text-xl font-semibold">
            {t("columnsTitle")}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <PartnerColumn
              title={t("columns.banks.title")}
              text={t("columns.banks.text")}
            />
            <PartnerColumn
              title={t("columns.brokers.title")}
              text={t("columns.brokers.text")}
            />
            <PartnerColumn
              title={t("columns.clients.title")}
              text={t("columns.clients.text")}
            />
          </div>
        </section>

        {/* Hinweis + Rechtliches */}
        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] items-start">
          <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">
              {t("tipTitle")}
            </h3>
            <p className="text-sm text-slate-100 mb-4">{t("tipText")}</p>
            <p className="text-xs text-slate-400">{t("tipSubtext")}</p>
          </aside>

          <div className="rounded-3xl bg-amber-500/10 border border-amber-500/50 px-5 py-5 md:px-6 md:py-6">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              {t("legalTitle")}
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-amber-100">
              {t("legalItems", { returnObjects: true })?.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

const PartnerColumn = ({ title, text }) => (
  <div className="rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-4 md:px-5 md:py-5">
    <h3 className="text-sm md:text-base font-semibold mb-2">{title}</h3>
    <p className="text-xs md:text-sm text-slate-300">{text}</p>
  </div>
);

export default BankPartnersPage;
