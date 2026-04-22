import React from "react";
import PropertyCard from "../PropertyCard/PropertyCard";
import { useTranslation } from "react-i18next";
import { FiHome } from "react-icons/fi";

const PropertyList = ({ listings = [], onCardClick }) => {
  const { t } = useTranslation("property");

  if (!Array.isArray(listings) || listings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
          <FiHome className="text-2xl" />
        </div>

        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          {t("emptyTitle", { defaultValue: "Keine Immobilien gefunden" })}
        </h3>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t("noListings", {
            defaultValue: "Keine Anzeigen.",
          })}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("title", { defaultValue: "Immobilien" })}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("resultsCount", {
              defaultValue: "{{count}} Anzeigen gefunden",
              count: listings.length,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing, index) => (
          <PropertyCard
            key={listing?.id || listing?.listingId || listing?.docId || `listing-${index}`}
            listing={listing}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </section>
  );
};

export default PropertyList;