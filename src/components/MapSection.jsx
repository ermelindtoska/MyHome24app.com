import React from "react";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiNavigation, FiHome } from "react-icons/fi";

const MapSection = () => {
  const { t } = useTranslation("map");

  const highlights = [
    {
      icon: <FiMapPin size={20} />,
      title: t("sectionHighlights.locationTitle", {
        defaultValue: "Präzise Standorte",
      }),
      text: t("sectionHighlights.locationText", {
        defaultValue:
          "Entdecken Sie Immobilien nach Stadt, Region und genauer Lage auf einer interaktiven Karte.",
      }),
    },
    {
      icon: <FiNavigation size={20} />,
      title: t("sectionHighlights.navigationTitle", {
        defaultValue: "Schnelle Orientierung",
      }),
      text: t("sectionHighlights.navigationText", {
        defaultValue:
          "Filtern Sie passende Objekte direkt auf der Karte und behalten Sie den Überblick über alle sichtbaren Angebote.",
      }),
    },
    {
      icon: <FiHome size={20} />,
      title: t("sectionHighlights.propertiesTitle", {
        defaultValue: "Mehr passende Objekte",
      }),
      text: t("sectionHighlights.propertiesText", {
        defaultValue:
          "Vergleichen Sie mehrere Immobilien schneller und finden Sie das passende Zuhause in Ihrer Wunschlage.",
      }),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-6 py-10 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:px-10 md:py-14">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pointer-events-none" />

      <div className="relative z-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {t("badge", { defaultValue: "Interaktive Karte" })}
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {t("title", { defaultValue: "Immobilien auf der Karte entdecken" })}
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
            {t("description", {
              defaultValue:
                "Nutzen Sie unsere interaktive Kartenansicht, um Immobilien in ganz Deutschland visuell zu entdecken, gezielt zu filtern und schneller die passende Lage zu finden.",
            })}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {item.icon}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-blue-300 bg-blue-50/70 p-6 text-center dark:border-blue-800 dark:bg-blue-900/10">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {t("mapPlaceholder", {
              defaultValue:
                "Hier kann später eine interaktive Map oder ein Karten-Preview integriert werden.",
            })}
          </p>
        </div>
      </div>
    </section>
  );
};

export default MapSection;