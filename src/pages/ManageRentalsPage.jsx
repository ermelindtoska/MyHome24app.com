import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import manageImg from "../assets/manage-rentals.png";
import logo from "../assets/logo.png";
import {
  FaListAlt,
  FaEdit,
  FaChartBar,
  FaBell,
  FaArrowRight,
  FaShieldAlt,
  FaHome,
} from "react-icons/fa";
import SiteMeta from "../components/SEO/SiteMeta";

const ManageRentalsPage = () => {
  const { t, i18n } = useTranslation("manageRentals");
  const navigate = useNavigate();

  const rawFeatures = t("features", { returnObjects: true });
  const features = Array.isArray(rawFeatures) ? rawFeatures : [];

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/manage-rentals`;

  const icons = [
    <FaListAlt className="text-indigo-600 dark:text-indigo-400 text-lg" />,
    <FaEdit className="text-blue-600 dark:text-blue-400 text-lg" />,
    <FaChartBar className="text-emerald-600 dark:text-emerald-400 text-lg" />,
    <FaBell className="text-orange-600 dark:text-orange-400 text-lg" />,
  ];

  const handleGoToDashboard = () => navigate("/dashboard");
  const handleGoToPublish = () => navigate("/publish");
  const handleGoToContact = () => navigate("/contact?topic=rentals");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={
          t("metaTitle", {
            defaultValue: "Mietobjekte verwalten – MyHome24App",
          }) || "Mietobjekte verwalten – MyHome24App"
        }
        description={
          t("metaDescription", {
            defaultValue:
              "Verwalten Sie Mietobjekte, Anfragen, Änderungen und Performance zentral an einem Ort – modern, übersichtlich und effizient.",
          }) ||
          "Verwalten Sie Mietobjekte, Anfragen, Änderungen und Performance zentral an einem Ort."
        }
        canonical={canonical}
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
          {/* Bild */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <img
              src={manageImg}
              alt={t("imageAlt")}
              className="w-full h-[320px] md:h-[500px] object-cover object-top"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-12 w-auto drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 space-y-3 text-white">
              <span className="inline-flex items-center rounded-full bg-indigo-600/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                <FaHome className="mr-2" />
                {t("heroBadge", { defaultValue: "Rental Management" })}
              </span>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("title")}
              </h1>

              <p className="text-sm md:text-base text-slate-100 max-w-xl">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Text / CTA */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-indigo-700 dark:text-indigo-400">
                {t("sectionTitle", {
                  defaultValue: "Alles an einem Ort verwalten",
                })}
              </h2>

              <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
                {t("sectionIntro", {
                  defaultValue:
                    "Behalten Sie Ihre Mietobjekte, Änderungen, Leistungsdaten und Benachrichtigungen im Blick – mit einer klaren Oberfläche, die an moderne Immobilienplattformen wie Zillow erinnert.",
                })}
              </p>
            </div>

            {/* Trust cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <TrustCard
                icon={<FaShieldAlt className="text-emerald-600 dark:text-emerald-400" />}
                title={t("trust.0.title", { defaultValue: "Übersichtlich" })}
                text={t("trust.0.text", {
                  defaultValue: "Klare Verwaltung statt Chaos in Excel oder E-Mail.",
                })}
              />
              <TrustCard
                icon={<FaChartBar className="text-blue-600 dark:text-blue-400" />}
                title={t("trust.1.title", { defaultValue: "Messbar" })}
                text={t("trust.1.text", {
                  defaultValue: "Performance und Nachfrage besser verstehen.",
                })}
              />
              <TrustCard
                icon={<FaBell className="text-orange-600 dark:text-orange-400" />}
                title={t("trust.2.title", { defaultValue: "Reaktionsschnell" })}
                text={t("trust.2.text", {
                  defaultValue: "Wichtige Updates und Aktivitäten direkt sehen.",
                })}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition"
              >
                {t("button", { defaultValue: "Jetzt verwalten" })}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={handleGoToPublish}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {t("secondaryButton", { defaultValue: "Immobilie hinzufügen" })}
              </button>

              <button
                type="button"
                onClick={handleGoToContact}
                className="inline-flex items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-500/15 transition dark:text-indigo-300"
              >
                {t("contactButton", { defaultValue: "Beratung anfragen" })}
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:px-6 md:py-7">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">
              {t("featuresTitle", {
                defaultValue: "Was Sie mit dem Bereich verwalten können",
              })}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300">
              {t("featuresIntro", {
                defaultValue:
                  "Von der Objektübersicht bis zu Benachrichtigungen: alles in einer professionellen Oberfläche.",
              })}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-10 w-10 flex-none rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center">
                    {icons[index % icons.length]}
                  </div>

                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INFO BOX */}
        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 px-5 py-6 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <h2 className="text-lg md:text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
              {t("tipTitle")}
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200">
              {t("tipText")}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h3 className="text-lg font-semibold mb-2">
              {t("ctaBoxTitle", {
                defaultValue: "Bereit für den nächsten Schritt?",
              })}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {t("ctaBoxText", {
                defaultValue:
                  "Erstellen Sie neue Mietobjekte, pflegen Sie bestehende Inserate und behalten Sie die wichtigsten Kennzahlen jederzeit im Blick.",
              })}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                {t("button", { defaultValue: "Jetzt verwalten" })}
              </button>

              <button
                type="button"
                onClick={handleGoToPublish}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {t("secondaryButton", { defaultValue: "Immobilie hinzufügen" })}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const TrustCard = ({ icon, title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
    <div className="flex items-center gap-2 mb-2">
      <span className="h-9 w-9 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 flex items-center justify-center">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
    </div>
    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
      {text}
    </p>
  </div>
);

export default ManageRentalsPage;