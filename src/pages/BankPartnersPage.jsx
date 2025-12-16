// src/pages/BankPartnersPage.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaCheckCircle,
  FaHandshake,
  FaClipboardList,
  FaShieldAlt,
  FaBolt,
  FaRegClock,
  FaChartLine,
  FaBalanceScale,
  FaQuestionCircle,
  FaArrowRight,
  FaStar,
  FaEnvelopeOpenText,
} from "react-icons/fa";

import bankPartnerImg from "../assets/bank-partners.png";
import logo from "../assets/logo.png";
import SiteMeta from "../components/SEO/SiteMeta";

const BankPartnersPage = () => {
  const { t, i18n } = useTranslation("bankPartners");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage/partners`;

  const features = useMemo(() => {
    const raw = t("features", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const trustItems = useMemo(() => {
    const raw = t("trust", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const partnerBenefits = useMemo(() => {
    const raw = t("partnerBenefits.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const howItWorks = useMemo(() => {
    const raw = t("howItWorks.steps", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const stats = useMemo(() => {
    const raw = t("stats.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const testimonials = useMemo(() => {
    const raw = t("testimonials.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const faq = useMemo(() => {
    const raw = t("faq.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const legalItems = useMemo(() => {
    const raw = t("legal.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  // Ikonat (mapping i kontrolluar)
  const featureIcons = [FaClipboardList, FaCheckCircle, FaHandshake, FaUserTie];
  const trustIconMap = [FaShieldAlt, FaBolt, FaRegClock];
  const benefitIconMap = [FaChartLine, FaHandshake, FaShieldAlt, FaBalanceScale];

  // CTA routes (të saktat)
  const goRequest = () => navigate("/mortgage/request");
  const goCalculator = () => navigate("/mortgage/calculator");
  const goPartner = () => navigate("/partner/finance");
  const goPartnerContact = () => navigate("/contact?topic=partner-finance");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        title={t("meta.title")}
        description={t("meta.description")}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-mortgage-partners.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.08fr,0.92fr] items-center">
          {/* Image Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={bankPartnerImg}
              alt={t("hero.imgAlt")}
              className="w-full h-[320px] md:h-[420px] object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                  {t("hero.badge")}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-700 px-4 py-1 text-xs font-semibold text-slate-200">
                  {t("hero.badge2")}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("hero.title")}
              </h1>
              <p className="text-sm md:text-base text-slate-200 max-w-xl">
                {t("hero.subtitle")}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goRequest}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
                >
                  {t("cta.primary")}
                  <FaArrowRight className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={goCalculator}
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
                >
                  {t("cta.secondary")}
                </button>

                <button
                  type="button"
                  onClick={goPartner}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15 transition"
                >
                  {t("cta.partner")}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                {t("hero.note")}
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-400">
                {t("headline")}
              </h2>
              <p className="text-sm md:text-base text-slate-200 mt-2">
                {t("description")}
              </p>
            </div>

            {/* Trust row */}
            <div className="grid gap-3 sm:grid-cols-3">
              {trustItems.map((item, idx) => {
                const Icon = trustIconMap[idx % trustIconMap.length];
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <Icon className="text-emerald-400" />
                      </span>
                      <div className="text-sm font-semibold">{item.title}</div>
                    </div>
                    <div className="text-xs text-slate-300">{item.text}</div>
                  </div>
                );
              })}
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = featureIcons[index % featureIcons.length];
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

            {/* Partner contact CTA */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 px-5 py-5">
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-full bg-slate-950/60 border border-slate-700 flex items-center justify-center">
                  <FaEnvelopeOpenText className="text-slate-200" />
                </span>
                <div className="min-w-0">
                  <div className="font-semibold">{t("partnerContact.title")}</div>
                  <div className="text-sm text-slate-300 mt-1">
                    {t("partnerContact.text")}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      type="button"
                      onClick={goPartnerContact}
                      className="inline-flex items-center justify-center rounded-full bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition"
                    >
                      {t("partnerContact.cta")}
                      <FaArrowRight className="ml-2" />
                    </button>
                    <button
                      type="button"
                      onClick={goPartner}
                      className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
                    >
                      {t("partnerContact.secondary")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="rounded-3xl bg-slate-900/40 border border-slate-800 px-5 py-6 md:px-6 md:py-7">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">
                {t("stats.title")}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {t("stats.subtitle")}
              </p>
            </div>
            <div className="text-xs text-slate-400">{t("stats.note")}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-4"
              >
                <div className="text-2xl font-bold text-emerald-300">
                  {s.value}
                </div>
                <div className="text-sm font-semibold mt-1">{s.label}</div>
                <div className="text-xs text-slate-300 mt-1">{s.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner benefits */}
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 px-5 py-6 md:px-6 md:py-7 space-y-6">
          <h2 className="text-lg md:text-xl font-semibold">
            {t("partnerBenefits.title")}
          </h2>
          <p className="text-sm text-slate-300">{t("partnerBenefits.subtitle")}</p>

          <div className="grid gap-4 md:grid-cols-2">
            {partnerBenefits.map((b, idx) => {
              const Icon = benefitIconMap[idx % benefitIconMap.length];
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-4 md:px-5 md:py-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Icon className="text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold">
                        {b.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-300 mt-1">
                        {b.text}
                      </p>
                      {Array.isArray(b.bullets) && b.bullets.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs text-slate-300">
                          {b.bullets.map((x, i) => (
                            <li key={i} className="flex gap-2">
                              <FaCheckCircle className="mt-0.5 text-emerald-300" />
                              <span>{x}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 px-5 py-6 md:px-6 md:py-7 space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-slate-950/60 border border-slate-700 flex items-center justify-center">
              <FaClipboardList className="text-slate-200" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-semibold">
                {t("howItWorks.title")}
              </h2>
              <p className="text-sm text-slate-300">{t("howItWorks.subtitle")}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-semibold text-emerald-300">
                    {idx + 1}
                  </div>
                  <h3 className="text-sm md:text-base font-semibold">{s.title}</h3>
                </div>
                <p className="text-xs md:text-sm text-slate-300">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partner columns */}
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 px-5 py-6 md:px-6 md:py-7 space-y-6">
          <h2 className="text-lg md:text-xl font-semibold">{t("columns.title")}</h2>

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

        {/* Testimonials */}
        <section className="rounded-3xl bg-slate-900/40 border border-slate-800 px-5 py-6 md:px-6 md:py-7 space-y-6">
          <h2 className="text-lg md:text-xl font-semibold">
            {t("testimonials.title")}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((x, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/40 border border-slate-800 px-4 py-4"
              >
                <div className="flex items-center gap-1 text-amber-300">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <p className="text-sm text-slate-200 mt-3">“{x.quote}”</p>
                <div className="text-xs text-slate-400 mt-3">
                  {x.name} · {x.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ + Legal */}
        <section className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr] items-start">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 px-5 py-6 md:px-6 md:py-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-9 w-9 rounded-full bg-slate-950/60 border border-slate-700 flex items-center justify-center">
                <FaQuestionCircle className="text-slate-200" />
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">{t("faq.title")}</h2>
                <p className="text-sm text-slate-300">{t("faq.subtitle")}</p>
              </div>
            </div>

            <Accordion items={faq} />
          </div>

          <div className="space-y-6">
            <aside className="rounded-3xl bg-emerald-500/10 border border-emerald-500/40 px-5 py-5 md:px-6 md:py-6 shadow-inner">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                {t("tip.title")}
              </h3>
              <p className="text-sm text-slate-100 mb-4">{t("tip.text")}</p>
              <p className="text-xs text-slate-400">{t("tip.subtext")}</p>
            </aside>

            <div className="rounded-3xl bg-amber-500/10 border border-amber-500/50 px-5 py-5 md:px-6 md:py-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-9 w-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <FaBalanceScale className="text-amber-200" />
                </span>
                <h3 className="text-lg font-semibold text-amber-200">
                  {t("legal.title")}
                </h3>
              </div>

              <ul className="space-y-2 text-xs md:text-sm text-amber-100">
                {legalItems.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/50 to-slate-950/50 px-5 py-6 md:px-6 md:py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-lg md:text-xl font-semibold">
                {t("bottomCta.title")}
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                {t("bottomCta.text")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goRequest}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
              >
                {t("cta.primary")}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={goCalculator}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
              >
                {t("cta.secondary")}
              </button>

              <button
                type="button"
                onClick={goPartnerContact}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
              >
                {t("bottomCta.partnerContact")}
              </button>
            </div>
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

const Accordion = ({ items = [] }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const isOpen = idx === openIndex;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-slate-950/35 border border-slate-800 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold">{it.q}</span>
              <span className="text-slate-400 text-xs">
                {isOpen ? "—" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BankPartnersPage;
