import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../SearchBar/SearchBar";

const HeroSection = () => {
  const { t } = useTranslation("home");

  return (
    <section
      className="relative w-full h-[120vh] bg-cover bg-center flex flex-col justify-center items-center text-white text-center"
      style={{ backgroundImage: "url('/images/myhomehintergrund.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10" />

      {/* Content */}
      <div className="relative z-20 bg-black bg-opacity-60 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          {t("heroTitle")}
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          {t("heroSubtitle")}
        </p>

        {/* Suspense fallback */}
        <Suspense
          fallback={
            <p className="text-gray-300 dark:text-gray-400">
              {t("loadingSearchBar") || "Lädt Suchleiste..."}
            </p>
          }
        >
          <SearchBar />
        </Suspense>
      </div>
    </section>
  );
};

export default HeroSection;
