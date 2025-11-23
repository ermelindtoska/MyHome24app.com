// src/pages/OwnerPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaHandshake,
  FaUserTie,
  FaComments,
  FaEye,
} from "react-icons/fa";

import ownerHeader from "../assets/owner-header.png";
import SiteMeta from "../components/SEO/SiteMeta";

const OwnerPage = () => {
  const { t, i18n } = useTranslation("owner");
  const lang = i18n.language?.slice(0, 2) || "de";

  // SEO-Texte
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

  // Features aus i18n holen
  const features = t("features", { returnObjects: true }) || [];

  const icons = [
    <FaHandshake className="text-emerald-400 mt-1" />,
    <FaUserTie className="text-sky-400 mt-1" />,
    <FaComments className="text-violet-400 mt-1" />,
    <FaEye className="text-orange-400 mt-1" />,
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* SEO */}
      <SiteMeta
        title={metaTitle}
        description={metaDescription}
        path="/buy/owner"
        lang={lang}
      />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-center">
          {/* Text */}
          <div>
            <p className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full mb-4">
              {t("badge")}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-50">
              {t("title")}
            </h1>

            <p className="text-slate-300 mb-6 max-w-xl">
              {t("description")}
            </p>

            <div className="flex flex-wrap gap-3">
              {/* CTA: Direktangebote ansehen */}
              <Link
                to="/buy?directOwner=1"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
              >
                {t("ctaListings")}
              </Link>

              {/* Scroll zu Vorteilen */}
              <a
                href="#owner-benefits"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-600 hover:border-slate-400 text-sm font-semibold text-slate-100 bg-slate-900/40 hover:bg-slate-900/70 transition"
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </div>

          {/* Bild */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-900/80">
              <img
                src={ownerHeader}
                alt={t("imageAlt")}
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
            </div>
            <div className="hidden md:flex absolute -bottom-4 -left-4 bg-slate-900/95 border border-slate-700 rounded-2xl px-4 py-3 text-xs shadow-xl gap-3 items-center">
              <FaHandshake className="text-emerald-400 text-lg" />
              <div>
                <div className="font-semibold">
                  {t("highlight.label")}
                </div>
                <div className="text-slate-400">
                  {t("highlight.text")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section
        id="owner-benefits"
        className="max-w-6xl mx-auto px-4 pb-12 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-slate-50">
          {t("featuresTitle")}
        </h2>
        <p className="text-slate-300 max-w-2xl">
          {t("featuresLead")}
        </p>

        <ul className="grid gap-5 md:grid-cols-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex-shrink-0">
                {icons[index % icons.length]}
              </div>
              <div>
                <div className="font-semibold text-slate-50 text-sm mb-1">
                  {feature.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feature.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tipp-Box */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-slate-900/80 border border-slate-700 rounded-3xl p-5 md:p-6 shadow-lg shadow-slate-900/60">
          <h2 className="text-lg font-semibold text-blue-200 mb-2">
            {t("tipTitle")}
          </h2>
          <p className="text-sm text-slate-200">
            {t("tipText")}
          </p>
        </div>
      </section>

      {/* CTA-Bereich unten */}
      <section className="border-t border-slate-800 bg-slate-950/90">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Käufer:innen */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-slate-50">
              {t("readyTitle")}
            </h3>
            <p className="text-sm text-slate-300 mb-3 max-w-xl">
              {t("readyText")}
            </p>
            <Link
              to="/buy?directOwner=1"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition"
            >
              {t("button")}
            </Link>
          </div>

          {/* Eigentümer:innen */}
          <div className="flex-1 md:max-w-md bg-slate-900/80 border border-slate-700 rounded-3xl p-4 md:p-5">
            <h4 className="text-sm font-semibold text-slate-50 mb-1">
              {t("ownerCta.title")}
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              {t("ownerCta.text")}
            </p>
            <Link
              to="/publish"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-slate-950 transition"
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
