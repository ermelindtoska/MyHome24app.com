import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FiMapPin,
  FiHome,
  FiMaximize2,
  FiBed,
} from "react-icons/fi";

const FALLBACK_IMG = "/images/hero-1.jpg";

function firstImage(item) {
  return (
    item?.images?.[0] ||
    item?.imageUrls?.[0] ||
    item?.imageUrl ||
    item?.image ||
    FALLBACK_IMG
  );
}

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

const CompareItem = ({ listing }) => {
  const { t } = useTranslation("compare");

  const image = useMemo(() => firstImage(listing), [listing]);

  if (!listing) return null;

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition duration-300">
      
      {/* IMAGE */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={listing.title || "Property"}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        />

        {/* PRICE BADGE */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-sm font-bold px-3 py-1.5 rounded-lg">
          {formatPrice(listing.price)}
        </div>

        {/* TYPE BADGE */}
        {listing.type && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {t(`fields.type${listing.type}`, {
              defaultValue: listing.type,
            })}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        
        {/* TITLE */}
        <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
          {listing.title || "—"}
        </h4>

        {/* LOCATION */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <FiMapPin size={14} />
          {listing.city || "—"}
        </div>

        {/* FEATURES */}
        <div className="flex flex-wrap gap-3 text-sm text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <FiBed size={14} />
            {listing.rooms ?? "—"} {t("rooms")}
          </span>

          <span className="flex items-center gap-1">
            <FiMaximize2 size={14} />
            {listing.size ?? "—"} m²
          </span>

          <span className="flex items-center gap-1">
            <FiHome size={14} />
            {listing.type || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompareItem;