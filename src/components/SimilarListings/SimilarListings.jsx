import React from "react";
import { useTranslation } from "react-i18next";

const SimilarListings = ({ currentListing, allListings }) => {
  const { t } = useTranslation("listing");

  if (!currentListing || !allListings || allListings.length === 0) {
    return null;
  }

  // Filtron listimet që janë të ngjashme
  const similar = allListings.filter(
    (item) =>
      item.id !== currentListing.id &&
      (item.city === currentListing.city || item.type === currentListing.type)
  );

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">{t("similarListings")}</h3>
      <div className="flex overflow-x-auto gap-4 pb-2">
        {similar.map((item) => (
          <div
            key={item.id}
            className="min-w-[220px] bg-white rounded shadow hover:shadow-md transition flex-shrink-0 border"
          >
            <img
              src={item.images?.[0]}
              alt={`${t(item.type.toLowerCase(), { ns: 'listing' })} ${t('in', { ns: 'listing' })} ${t(`cityNames.${item.city}`, { defaultValue: item.city })}`}
              className="w-full h-32 object-cover rounded-t"
            />
            <div className="p-2">
              <p className="font-semibold text-blue-700 mb-1">
                {t(item.type.toLowerCase(), { ns: 'listing' })}{" "}
                {t('in', { ns: 'listing' })}{" "}
                {t(`cityNames.${item.city}`, { defaultValue: item.city })}
              </p>
              <p className="text-gray-800 mb-1">
                📍 {item.city}, {item.postalCode}
              </p>
              <p className="text-gray-600 mb-1">
                💶 {item.price.toLocaleString()} €
              </p>
              <p className="text-gray-600 mb-1">
                🛏 {item.bedrooms} · 📐 {item.size} m²
              </p>
              {item.agent && (
                <p className="text-xs text-gray-500">
                  👤 {t('contactAgent', { ns: 'listing' })}: {item.agent.name}
                </p>
              )}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-2 block w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition"
              >
                {t("viewMore", { ns: 'listing' })}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarListings;
