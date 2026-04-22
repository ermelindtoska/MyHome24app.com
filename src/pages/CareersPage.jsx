// src/pages/CareersPage.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  MdWork,
  MdCheckCircle,
  MdArrowForward,
  MdOutlineEmail,
  MdLightbulb,
  MdGroups,
  MdTrendingUp,
  MdAssignmentTurnedIn,
  MdQuestionAnswer,
} from "react-icons/md";

const CareersPage = () => {
  const { t, i18n } = useTranslation("careers");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/careers`;

  const highlights = useMemo(() => {
    const raw = t("hero.highlights", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const values = useMemo(() => {
    const raw = t("values.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const roles = useMemo(() => {
    const raw = t("roles.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const processSteps = useMemo(() => {
    const raw = t("process.steps", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const benefits = useMemo(() => {
    const raw = t("benefits.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const faq = useMemo(() => {
    const raw = t("faq.items", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const goApply = () => navigate("/contact?topic=career");
  const goOpenRoles = () => {
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const valueIcons = [MdLightbulb, MdGroups, MdTrendingUp];
  const roleIcons = [MdWork, MdAssignmentTurnedIn, MdTrendingUp, MdGroups];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("meta.title")}
        description={t("meta.description")}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-careers.jpg`}
      />

      {/* HERO */}
      <section className="border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link to="/" className="hover:underline">
              {t("breadcrumbs.home")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700 dark:text-slate-200">
              {t("breadcrumbs.current")}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                <MdWork className="text-lg" />
                {t("hero.badge")}
              </div>

              <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
                {t("hero.title")}
              </h1>

              <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                {t("hero.subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goApply}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  {t("hero.ctaPrimary")}
                  <MdArrowForward className="ml-2 text-lg" />
                </button>

                <button
                  type="button"
                  onClick={goOpenRoles}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("hero.ctaSecondary")}
                </button>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-500/15 transition dark:text-emerald-200"
                >
                  {t("hero.ctaAbout")}
                </Link>
              </div>

              {highlights.length > 0 && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {highlights.map((x, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200"
                    >
                      <MdCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                {t("hero.note")}
              </p>
            </div>

            {/* Right card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <MdOutlineEmail className="text-xl text-slate-700 dark:text-slate-200" />
                <h2 className="text-base font-semibold">{t("quickBox.title")}</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("quickBox.text")}
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 dark:bg-slate-950/40 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {t("quickBox.tipTitle")}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {t("quickBox.tipText")}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goApply}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {t("quickBox.cta")}
                  <MdArrowForward className="ml-2 text-lg" />
                </button>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("quickBox.secondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold">{t("values.title")}</h2>
        <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
          {t("values.subtitle")}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {values.map((c, idx) => {
            const Icon = valueIcons[idx % valueIcons.length];
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800"
              >
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <Icon className="text-emerald-700 dark:text-emerald-300 text-xl" />
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

      {/* OPEN ROLES */}
      <section id="open-roles" className="border-t border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{t("roles.title")}</h2>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
                {t("roles.subtitle")}
              </p>
            </div>

            <button
              type="button"
              onClick={goApply}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              {t("roles.cta")}
              <MdArrowForward className="ml-2 text-lg" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((r, idx) => {
              const Icon = roleIcons[idx % roleIcons.length];
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-950/40 dark:border-slate-800">
                      <Icon className="text-xl text-slate-700 dark:text-slate-200" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {r.location} · {r.type}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                        {r.text}
                      </div>

                      {Array.isArray(r.bullets) && r.bullets.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          {r.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <MdCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={goApply}
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          {t("roles.apply")}
                          <MdArrowForward className="ml-2" />
                        </button>

                        <Link
                          to="/contact"
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                        >
                          {t("roles.ask")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {t("roles.note")}
          </p>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MdAssignmentTurnedIn className="text-emerald-700 dark:text-emerald-300 text-xl" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{t("process.title")}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("process.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50 border border-slate-200 p-4 dark:bg-slate-950/40 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    {idx + 1}
                  </div>
                  <div className="font-semibold">{s.title}</div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {s.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS + FAQ */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <h2 className="text-lg md:text-xl font-bold">{t("benefits.title")}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("benefits.subtitle")}
            </p>

            <ul className="mt-5 space-y-2">
              {benefits.map((b, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-200"
                >
                  <MdCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-950/40 dark:border-slate-800">
                <MdQuestionAnswer className="text-slate-700 dark:text-slate-200 text-xl" />
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
        </div>
      </section>

      {/* BOTTOM CTA */}
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
                <button
                  type="button"
                  onClick={goApply}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t("bottomCta.primary")}
                  <MdArrowForward className="ml-2 text-lg" />
                </button>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
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
  const [openIndex, setOpenIndex] = useState(0);

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

export default CareersPage;