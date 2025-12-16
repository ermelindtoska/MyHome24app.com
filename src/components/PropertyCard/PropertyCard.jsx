// src/components/PropertyCard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getListingImage } from "../../utils/getListingImage";

import { FaHeart, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from "react-icons/fa";

const PropertyCard = ({ listing }) => {
  const { t } = useTranslation(["home", "listing"]);

  const listingId = listing?.id || listing?.listingId || listing?.docId || "";

  const primaryImage = useMemo(() => getListingImage(listing), [listing]);

  const title =
    listing?.title ||
    listing?.headline ||
    t("listing:labels.noTitle", { defaultValue: "Ohne Titel" });

  const purpose = listing?.purpose || listing?.typeOfUse || "buy";
  const propertyType = listing?.propertyType || listing?.type || "house";

  const price = listing?.price ?? listing?.priceEuro ?? null;

  const city = listing?.city || "";
  const postalCode = listing?.postalCode || listing?.zip || "";
  const addressLine = listing?.address || listing?.street || listing?.fullAddress || "";

  const bedrooms = listing?.bedrooms ?? listing?.rooms ?? null;
  const bathrooms = listing?.bathrooms ?? listing?.baths ?? null;
  const size = listing?.size ?? listing?.area ?? listing?.livingSpace ?? null;

  const yearBuilt = listing?.yearBuilt ?? listing?.buildYear ?? null;
  const status = listing?.status || "active";

  const purposeLabel =
    purpose === "rent"
      ? t("listing:labels.forRent", { defaultValue: "Miete" })
      : t("listing:labels.forSale", { defaultValue: "Kauf" });

  const typeLabel =
    propertyType === "apartment"
      ? t("listing:labels.apartment", { defaultValue: "Wohnung" })
      : propertyType === "house"
      ? t("listing:labels.house", { defaultValue: "Haus" })
      : t("listing:labels.property", { defaultValue: "Immobilie" });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-200 flex flex-col">
      <div className="relative">
        <Link to={`/listing/${listingId}`}>
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-52 object-cover"
            loading="lazy"
          />
        </Link>

        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-sky-600 text-white shadow">
          {purposeLabel}
        </div>

        <button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/80 flex items-center justify-center shadow hover:scale-105 transition"
        >
          <FaHeart className="text-slate-400 hover:text-red-500" />
        </button>

        {price != null && (
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 text-white text-sm font-semibold">
            € {typeof price === "number" ? price.toLocaleString("de-DE") : price}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 text-slate-900 dark:text-slate-100">
        <Link to={`/listing/${listingId}`}>
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        </Link>

        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1">
          <FaMapMarkerAlt className="shrink-0" />
          <span className="truncate">
            {addressLine && `${addressLine}, `}
            {postalCode && `${postalCode} `}
            {city}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <FaBed className="text-xs" />
            {bedrooms != null ? bedrooms : "–"} {t("home:rooms", { defaultValue: "Zimmer" })}
          </span>

          <span className="flex items-center gap-1">
            <FaBath className="text-xs" />
            {bathrooms != null ? bathrooms : "–"} {t("home:bathrooms", { defaultValue: "Badezimmer" })}
          </span>

          <span className="flex items-center gap-1">
            <FaRulerCombined className="text-xs" />
            {size != null ? size : "–"} m²
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
            {typeLabel}
          </span>

          {yearBuilt && (
            <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
              {t("listing:labels.yearBuilt", { defaultValue: "Baujahr" })}: {yearBuilt}
            </span>
          )}

          {status && (
            <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 capitalize">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
