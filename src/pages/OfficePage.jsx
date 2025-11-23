// src/pages/OfficePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import officeImg from "../assets/office-space.png";
import logo from "../assets/logo.png";

const OfficePage = () => {
  const { t, i18n } = useTranslation("office");
  const navigate = useNavigate();

  const features = t("features", { returnObjects: true }) || [];

  // SEO
  const seoTitle =
    t("seo.title", {
      defaultValue: "Büros & Gewerbeflächen mieten – MyHome24App",
    }) || "Büros & Gewerbeflächen mieten – MyHome24App";

  const seoDescription =
    t("seo.description", {
      defaultValue:
        "Finden Sie moderne Büros und Gewerbeflächen zur Miete in ganz Deutschland – mit Kartenansicht, Filtern und direktem Kontakt.",
    }) ||
    "Moderne Büros und Gewerbeflächen zur Miete in Deutschland.";

  const canonical = `${window.location.origin}/rent/office`;
  const lang = i18n.language?.slice(0, 2) || "de";

  const goToOfficeMap = () => {
    navigate("/map?purpose=rent&category=office");
  };

  return (
    <>
      <SiteMeta
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        lang={lang}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">

          {/* HERO */}
          <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 mb-12">
            <img
              src={officeImg}
              alt={t("imgAlt")}
              className="w-full h-[320px] md:h-[450px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-12 drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 text-white space-y-3">
              <h1 className="text-2xl md:text-4xl font-bold">
                {t("hero.title")}
              </h1>
              <p className="text-sm md:text-lg max-w-2xl">
                {t("hero.subtitle")}
              </p>

              <button
                onClick={goToOfficeMap}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg transition"
              >
                {t("cta.primary")}
              </button>
            </div>
          </section>

          {/* FEATURES */}
          <section className="space-y-8">
            <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
              {t("featuresTitle")}
            </h2>

            <div className="space-y-4">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm"
                >
                  <div className="mt-1 h-8 w-8 flex-none rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-500 text-sm font-semibold">
                    {idx + 1}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* INFO BOX */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-6 rounded-2xl shadow-md">
              <h3 className="text-blue-700 dark:text-blue-300 font-bold mb-2">
                {t("tipTitle")}
              </h3>
              <p className="text-gray-700 dark:text-gray-200">{t("tipText")}</p>
            </div>

            <div className="pt-8 text-center">
              <button
                onClick={goToOfficeMap}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold shadow-lg transition"
              >
                {t("cta.primary")}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default OfficePage;
