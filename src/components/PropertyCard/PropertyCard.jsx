// src/components/PropertyCard/PropertyCard.jsx
import React, { memo, useMemo } from "react";
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

function formatPrice(price) {
  if (price == null || price === "") return "—";

  const n = Number(price);
  if (Number.isFinite(n)) {
    return `€ ${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
  }

  return `€ ${price}`;
}

function getListingId(listing) {
  return listing?.id || listing?.listingId || listing?.docId || "";
}

const PropertyCard = ({ listing, item, onCardClick }) => {
  const { t } = useTranslation(["home", "listing"]);
  const data = listing || item || {};

  const listingId = getListingId(data);

  const primaryImage = useMemo(() => {
    try {
      return getListingImage(data) || FALLBACK_IMG;
    } catch {
      return FALLBACK_IMG;
    }
  }, [data]);

  const title =
    data?.title ||
    data?.headline ||
    t("listing:labels.noTitle", { defaultValue: "Ohne Titel" });

  const purpose = data?.purpose || data?.typeOfUse || "buy";
  const propertyType = data?.propertyType || data?.type || "house";

  const price = data?.price ?? data?.priceEuro ?? null;

  const city = data?.city || "";
  const postalCode = data?.postalCode || data?.zip || "";
  const addressLine = data?.address || data?.street || data?.fullAddress || "";

  const bedrooms = data?.bedrooms ?? data?.rooms ?? null;
  const bathrooms = data?.bathrooms ?? data?.baths ?? null;
  const size = data?.size ?? data?.area ?? data?.livingSpace ?? null;

  const yearBuilt = data?.yearBuilt ?? data?.buildYear ?? null;
  const status = data?.status || "active";

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

  const formattedPrice = formatPrice(price);

  const addressText =
    [addressLine, postalCode, city].filter(Boolean).join(", ") || "—";

  const cardInner = (
    <>
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={primaryImage}
          alt={title}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          draggable={false}
          onError={(e) => {
            if (e.currentTarget.src !== window.location.origin + FALLBACK_IMG) {
              e.currentTarget.src = FALLBACK_IMG;
            }
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

        {listingId && (
          <div
            className="absolute right-3 top-3 z-10"
            onClick={(e) => e.preventDefault()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow dark:bg-slate-950/90">
              <FavoriteButton listingId={listingId} />
            </div>
          </div>
        )}

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
          {yearBuilt ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
              {t("listing:labels.yearBuilt", { defaultValue: "Baujahr" })}:{" "}
              {yearBuilt}
            </span>
          ) : null}

          {status ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 capitalize dark:border-slate-700">
              {status}
            </span>
          ) : null}
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
        onClick={() => onCardClick(data)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
      >
        {cardInner}
      </button>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
      <Link to={`/listing/${listingId}`} className="flex h-full flex-col">
        {cardInner}
      </Link>
    </article>
  );
};

export default memo(PropertyCard);