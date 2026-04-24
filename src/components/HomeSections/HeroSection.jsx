import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../SearchBar/SearchBar";

const HeroSection = () => {
  const { t } = useTranslation("home");

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/myhomehintergrund.png"
          alt="Hero Background"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>

      {/* Overlay (lighter + better performance) */}
      <div className="absolute inset-0 z-10 bg-black/60" />

      {/* Gradient overlay (Zillow style) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-4xl px-4 text-center">
        <div className="rounded-3xl bg-black/60 p-6 shadow-xl backdrop-blur-md md:p-10">
          {/* Title */}
          <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            {t("heroTitle", {
              defaultValue: "Finden Sie Ihr perfektes Zuhause",
            })}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-200 md:text-xl">
            {t("heroSubtitle", {
              defaultValue:
                "Durchsuchen Sie tausende Immobilien in ganz Deutschland – einfach, schnell und modern.",
            })}
          </p>

          {/* SearchBar */}
          <div className="mt-6 md:mt-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-6">
                  <span className="animate-pulse text-sm text-gray-300">
                    {t("loadingSearchBar", {
                      defaultValue: "Lädt Suchleiste...",
                    })}
                  </span>
                </div>
              }
            >
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);