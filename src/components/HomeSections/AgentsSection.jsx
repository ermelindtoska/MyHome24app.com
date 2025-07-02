import React from "react";
import { useTranslation } from "react-i18next";

const AgentsSection = () => {
  const { t } = useTranslation("home");

  return (
    <section className="bg-gray-100 dark:bg-gray-800 py-20 px-4 animate-fade-in">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-10 text-gray-800 dark:text-gray-100">
          {t("agentsTitle") || "Treffen Sie unsere Agent*innen"}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t("agentsSubtitle") || "Erfahrene Expert*innen, bereit Ihnen zu helfen."}
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md"
            >
              <img
                src={`/images/agent${i}.jpg`}
                alt={`Agent ${i}`}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Agent {i}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {t("agentsSpecialty") || "Immobilienberater*in"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentsSection;
