// src/pages/BuyPage.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SiteMeta from "../components/SEO/SiteMeta";
import MapPage from "./MapPage";
import {
  FaMapMarkedAlt,
  FaSlidersH,
  FaBalanceScale,
  FaShieldAlt,
  FaHome,
  FaArrowRight,
  FaRegCheckCircle,
  FaQuestionCircle,
} from "react-icons/fa";

const BuyPage = () => {
  const { t, i18n } = useTranslation("buy");
  const lang = i18n.language?.slice(0, 2) || "de";

  const canonical = `${window.location.origin}/buy`;

  const perks = useMemo(() => {
    const raw = t("hero.perks", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const cards = useMemo(() => {
    const raw = t("valueCards.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const quickLinks = useMemo(() => {
    const raw = t("quickLinks.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const faq = useMemo(() => {
    const raw = t("faq.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  // Icon mapping controlled (stable)
  const valueIcons = [FaMapMarkedAlt, FaSlidersH, FaBalanceScale, FaShieldAlt];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-buy.jpg`}
      />

      {/* Top Hero */}
      <section className="border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          {/* Breadcrumb */}
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link to="/" className="hover:underline">
              {t("breadcrumbs.home")}
            </Link>{" "}
            <span className="mx-2">/</span>
            <span className="text-slate-700 dark:text-slate-200">
              {t("breadcrumbs.current")}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 dark:border-emerald-500/30">
                <FaHome />
                {t("hero.badge")}
              </div>

              <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
                {t("hero.title")}
              </h1>

              <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                {t("hero.subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#map"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  {t("hero.ctaPrimary")}
                  <FaArrowRight className="ml-2" />
                </a>

                <Link
                  to="/compare"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("hero.ctaSecondary")}
                </Link>

                <Link
                  to="/mortgage/calculator"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-500/15 transition dark:text-emerald-200"
                >
                  {t("hero.ctaMortgage")}
                </Link>
              </div>

              {/* Perks */}
              {perks.length > 0 && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {perks.map((x, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200"
                    >
                      <FaRegCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                {t("hero.note")}
              </p>
            </div>

            {/* Right quick box */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <FaSlidersH className="text-slate-700 dark:text-slate-200" />
                <h2 className="text-base font-semibold">{t("quickBox.title")}</h2>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("quickBox.text")}
              </p>

              {quickLinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {quickLinks.map((it, idx) => (
                    <Link
                      key={idx}
                      to={it.to}
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900"
                    >
                      <span>{it.label}</span>
                      <FaArrowRight className="opacity-70 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  {t("quickBox.tipTitle")}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-1">
                  {t("quickBox.tipText")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold">{t("valueCards.title")}</h2>
        <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
          {t("valueCards.subtitle")}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, idx) => {
            const Icon = valueIcons[idx % valueIcons.length];
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800"
              >
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <Icon className="text-emerald-700 dark:text-emerald-300" />
                </div>
                <div className="font-semibold">{c.title}</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {c.text}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MAP (core functionality) */}
      <section id="map" className="border-t border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6 flex-wrap mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{t("mapSection.title")}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t("mapSection.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/favorites"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("mapSection.favorites")}
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("mapSection.compare")}
              </Link>
            </div>
          </div>
        </div>

        {/* Dein bestehender MapPage bleibt die “Maschine” */}
        <MapPage purpose="buy" />
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-950/40 dark:border-slate-800">
              <FaQuestionCircle className="text-slate-700 dark:text-slate-200" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{t("faq.title")}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("faq.subtitle")}
              </p>
            </div>
          </div>

          <Accordion items={faq} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500/10 to-slate-100 border border-slate-200 p-6 md:p-7 dark:from-emerald-500/10 dark:to-slate-950 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  {t("bottomCta.title")}
                </h2>
                <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">
                  {t("bottomCta.text")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#map"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t("bottomCta.primary")}
                  <FaArrowRight className="ml-2" />
                </a>
                <Link
                  to="/mortgage/request"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-500/15 transition dark:text-emerald-200"
                >
                  {t("bottomCta.secondary")}
                </Link>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              {t("bottomCta.note")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const Accordion = ({ items = [] }) => {
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const isOpen = idx === openIndex;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden dark:bg-slate-950/40 dark:border-slate-800"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold">{it.q}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                {isOpen ? "—" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BuyPage;