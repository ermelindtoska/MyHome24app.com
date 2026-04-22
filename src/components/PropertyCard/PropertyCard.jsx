// src/components/PropertyCard/PropertyCard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getListingImage } from "../../utils/getListingImage";
import FavoriteButton from "../FavoriteButton";

import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarkerAlt,
} from "react-icons/fa";

const FALLBACK_IMG = "/images/hero-1.jpg";

const PropertyCard = ({ listing, onCardClick }) => {
  const { t } = useTranslation(["home", "listing"]);

  const listingId = listing?.id || listing?.listingId || listing?.docId || "";

  const primaryImage = useMemo(() => {
    try {
      return getListingImage(listing) || FALLBACK_IMG;
    } catch {
      return FALLBACK_IMG;
    }
  }, [listing]);

  const title =
    listing?.title ||
    listing?.headline ||
    t("listing:labels.noTitle", { defaultValue: "Ohne Titel" });

  const purpose = listing?.purpose || listing?.typeOfUse || "buy";
  const propertyType = listing?.propertyType || listing?.type || "house";

  const price = listing?.price ?? listing?.priceEuro ?? null;

  const city = listing?.city || "";
  const postalCode = listing?.postalCode || listing?.zip || "";
  const addressLine =
    listing?.address || listing?.street || listing?.fullAddress || "";

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
      : propertyType === "office"
      ? t("listing:labels.office", { defaultValue: "Büro" })
      : t("listing:labels.property", { defaultValue: "Immobilie" });

  const formattedPrice =
    price != null
      ? `€ ${typeof price === "number" ? price.toLocaleString("de-DE") : price}`
      : "—";

  const addressText =
    [addressLine, postalCode ? `${postalCode}` : "", city]
      .filter(Boolean)
      .join(", ") || "—";

  const cardInner = (
    <>
      <div className="relative overflow-hidden">
        <img
          src={primaryImage}
          alt={title}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white shadow">
            {purposeLabel}
          </span>

          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow dark:bg-slate-950/90 dark:text-slate-100">
            {typeLabel}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          {listingId ? (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow dark:bg-slate-950/90"
              onClick={(e) => e.stopPropagation()}
            >
              <FavoriteButton listingId={listingId} />
            </div>
          ) : null}
        </div>

        {price != null && (
          <div className="absolute bottom-3 left-3 rounded-2xl bg-slate-950/85 px-3 py-2 text-sm font-bold text-white backdrop-blur">
            {formattedPrice}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 text-slate-900 dark:text-slate-100">
        <h3 className="line-clamp-1 text-lg font-bold">{title}</h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <FaMapMarkerAlt className="shrink-0" />
          <span className="line-clamp-1">{addressText}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700 dark:text-slate-300">
          <span className="inline-flex items-center gap-1">
            <FaBed className="text-xs" />
            {bedrooms != null ? bedrooms : "–"}{" "}
            {t("home:rooms", { defaultValue: "Zimmer" })}
          </span>

          <span className="inline-flex items-center gap-1">
            <FaBath className="text-xs" />
            {bathrooms != null ? bathrooms : "–"}{" "}
            {t("home:bathrooms", { defaultValue: "Badezimmer" })}
          </span>

          <span className="inline-flex items-center gap-1">
            <FaRulerCombined className="text-xs" />
            {size != null ? size : "–"} m²
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {yearBuilt && (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
              {t("listing:labels.yearBuilt", { defaultValue: "Baujahr" })}:{" "}
              {yearBuilt}
            </span>
          )}

          {status && (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 capitalize dark:border-slate-700">
              {status}
            </span>
          )}
        </div>

        <div className="mt-5">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {t("listing:viewMore", { defaultValue: "Mehr ansehen" })}
          </span>
        </div>
      </div>
    </>
  );

  if (onCardClick && typeof onCardClick === "function") {
    return (
      <button
        type="button"
        onClick={() => onCardClick(listing)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        {cardInner}
      </button>
    );
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950">
      <Link to={`/listing/${listingId}`} className="flex h-full flex-col">
        {cardInner}
      </Link>
    </div>
  );
};

export default PropertyCard;