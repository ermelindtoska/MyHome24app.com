import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiMapPin,
  FiMaximize2,
  FiHome,
  FiDroplet,
  FiArrowUpRight,
} from "react-icons/fi";
import FavoriteButton from "./FavoriteButton";
import { getListingImage } from "../utils/getListingImage";

const FALLBACK_IMAGE = "/images/hero-1.jpg";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const formatPrice = (value, purpose, t) => {
  const n = toNumber(value);
  if (n == null) return "€ 0";

  const formatted = n.toLocaleString("de-DE", {
    maximumFractionDigits: 0,
  });

  const isRent = String(purpose || "").trim().toLowerCase() === "rent";

  return isRent
    ? `€ ${formatted} ${t("perMonthShort", { defaultValue: "/Monat" })}`
    : `€ ${formatted}`;
};

const getAddressLine = (listing) => {
  const city = listing?.city || "";
  const zip = listing?.postalCode || listing?.zipCode || listing?.zip || "";
  const address = listing?.address || "";

  if (address && city) return `${address}, ${zip} ${city}`.trim();
  if (city) return `${zip} ${city}`.trim();
  return "—";
};

const ListingCard = ({ listing }) => {
  const { t } = useTranslation("listing");

  if (!listing) return null;

  const image = getListingImage(listing);
  const title = listing.title || t("untitled", { defaultValue: "Ohne Titel" });
  const addressLine = getAddressLine(listing);
  const price = formatPrice(listing.price, listing.purpose, t);

  const bedrooms = listing.bedrooms ?? listing.beds ?? listing.rooms ?? 0;
  const bathrooms = listing.bathrooms ?? listing.baths ?? 0;
  const size = listing.size ?? listing.area ?? listing.livingArea ?? 0;
  const type = listing.type || listing.category || "";

  const isFeatured = Boolean(listing.isFeatured || listing.isPremium);
  const isLuxury = Boolean(listing.isLuxury);
  const isNew = Boolean(listing.isNew);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div className="relative">
        <Link to={`/listing/${listing.id}`} className="block">
          <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 sm:h-56">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isFeatured && (
            <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-semibold text-yellow-950 shadow-sm">
              {t("featured", { defaultValue: "Featured" })}
            </span>
          )}

          {isLuxury && (
            <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              {t("luxury", { defaultValue: "Luxury" })}
            </span>
          )}

          {isNew && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              {t("new", { defaultValue: "Neu" })}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/90 shadow-sm backdrop-blur dark:border-gray-600 dark:bg-gray-900/85"
            onClick={(e) => e.stopPropagation()}
          >
            <FavoriteButton listingId={listing.id} />
          </div>
        </div>

        <div className="absolute bottom-3 left-3">
          <div className="rounded-xl bg-white/95 px-3 py-2 shadow-md backdrop-blur dark:bg-gray-900/90">
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {price}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/listing/${listing.id}`} className="block">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h2 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>

            <span className="mt-0.5 inline-flex flex-shrink-0 items-center justify-center rounded-full bg-blue-50 p-2 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-300">
              <FiArrowUpRight size={16} />
            </span>
          </div>

          <div className="mb-3 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-300">
            <FiMapPin className="mt-0.5 shrink-0 text-blue-500" />
            <p className="line-clamp-2">{addressLine}</p>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            {type ? (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-200">
                {t(type.toLowerCase(), { defaultValue: type })}
              </span>
            ) : null}

            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-200">
              {listing.purpose === "rent"
                ? t("rent", { defaultValue: "Mieten" })
                : t("buy", { defaultValue: "Kaufen" })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-200">
            <span className="inline-flex items-center gap-1.5">
              <FiHome className="text-blue-500" />
              <span>
                {bedrooms} {t("bedroomsShort", { defaultValue: "SZ" })}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <FiDroplet className="text-blue-500" />
              <span>
                {bathrooms} {t("bathroomsShort", { defaultValue: "BZ" })}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <FiMaximize2 className="text-blue-500" />
              <span>{size ? `${size} m²` : "— m²"}</span>
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.object,
};

export default React.memo(ListingCard, (prev, next) => {
  return (
    prev.listing?.id === next.listing?.id &&
    prev.listing?.title === next.listing?.title &&
    prev.listing?.price === next.listing?.price &&
    prev.listing?.imageUrl === next.listing?.imageUrl &&
    prev.listing?.coverImage === next.listing?.coverImage
  );
});