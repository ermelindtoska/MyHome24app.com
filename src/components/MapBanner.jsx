import React from "react";
import { useTranslation } from "react-i18next";
import { FiMap } from "react-icons/fi";

const germanStates = [
  { id: "berlin", name: "Berlin" },
  { id: "bayern", name: "Bayern" },
  { id: "baden-wuerttemberg", name: "Baden-Württemberg" },
  { id: "hamburg", name: "Hamburg" },
  { id: "niedersachsen", name: "Niedersachsen" },
  { id: "nordrhein-westfalen", name: "Nordrhein-Westfalen" },
  { id: "hessen", name: "Hessen" },
  { id: "sachsen", name: "Sachsen" },
  { id: "sachsen-anhalt", name: "Sachsen-Anhalt" },
  { id: "thueringen", name: "Thüringen" },
  { id: "brandenburg", name: "Brandenburg" },
  { id: "mecklenburg-vorpommern", name: "Mecklenburg-Vorpommern" },
  { id: "schleswig-holstein", name: "Schleswig-Holstein" },
  { id: "rheinland-pfalz", name: "Rheinland-Pfalz" },
  { id: "saarland", name: "Saarland" },
  { id: "bremen", name: "Bremen" },
];

const MapBanner = ({ onRegionSelect }) => {
  const { t } = useTranslation("map");

  return (
    <section className="relative overflow-hidden border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white py-12 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="flex justify-center mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FiMap size={20} />
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t("banner.title", {
              defaultValue: "Region auswählen",
            })}
          </h3>

          <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
            {t("banner.subtitle", {
              defaultValue:
                "Wählen Sie ein Bundesland, um passende Immobilien schneller zu finden.",
            })}
          </p>
        </div>

        {/* STATES GRID */}
        <div className="flex flex-wrap justify-center gap-3">
          {germanStates.map((state) => (
            <button
              key={state.id}
              onClick={() => onRegionSelect?.(state.name)}
              className="
                group
                px-4 py-2.5
                rounded-full
                border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800
                text-sm font-medium
                text-gray-700 dark:text-gray-200
                hover:bg-blue-600 hover:text-white
                hover:border-blue-600
                dark:hover:bg-blue-600
                transition-all duration-200
                shadow-sm hover:shadow-md
              "
            >
              {state.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MapBanner;