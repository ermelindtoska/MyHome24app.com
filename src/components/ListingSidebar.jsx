import React, { memo, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import FavoriteButton from "./FavoriteButton";
import { useTranslation } from "react-i18next";
import {
  FiShare2,
  FiMapPin,
  FiHome,
  FiCheckCircle,
} from "react-icons/fi";

const FALLBACK_IMG = "/images/hero-1.jpg";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatPrice(v) {
  const n = toNumber(v);
  if (n == null) return "–";
  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

function firstImage(item) {
  return (
    item?.images?.[0] ||
    item?.imageUrls?.[0] ||
    item?.imageUrl ||
    item?.image ||
    FALLBACK_IMG
  );
}

function formatAddress(item) {
  const parts = [
    item?.address || item?.street || "",
    item?.zip || item?.zipCode || "",
    item?.city || "",
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : item?.city || "—";
}

function isNewish(item) {
  const sec = item?.createdAt?.seconds;
  if (sec) {
    const ageMs = Date.now() - sec * 1000;
    return ageMs <= 1000 * 60 * 60 * 24 * 14;
  }

  const d = item?.createdAt ? new Date(item.createdAt) : null;
  if (d && !Number.isNaN(d.getTime())) {
    return Date.now() - d.getTime() <= 1000 * 60 * 60 * 24 * 14;
  }

  return false;
}

function getBadge(item) {
  const promo = (item?.promotion || item?.tier || item?.plan || "")
    .toString()
    .toLowerCase();

  if (promo.includes("showcase") || promo.includes("premium")) {
    return { key: "showcase", label: "Showcase" };
  }

  if (promo.includes("featured")) {
    return { key: "featured", label: "Featured" };
  }

  return null;
}

function dispatchMiniToast(message) {
  try {
    window.dispatchEvent(new CustomEvent("mh24:toast", { detail: { message } }));
  } catch {}
}

async function shareListing(item, t) {
  const url = `${window.location.origin}/listing/${item?.id || ""}`;
  const title = item?.title || "Listing";

  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
  } catch {}

  try {
    await navigator.clipboard.writeText(url);
    dispatchMiniToast(
      t("toastLinkCopied", {
        ns: "listingDetails",
        defaultValue: "Link kopiert",
      })
    );
  } catch {
    dispatchMiniToast(
      t("toastCopyFailed", {
        ns: "listingDetails",
        defaultValue: "Kopieren fehlgeschlagen",
      })
    );
  }
}

const ListingCard = memo(function ListingCard({ item, onClickItem, onHover }) {
  const { t } = useTranslation(["listing", "listingDetails"]);

  const img = firstImage(item);
  const badge = getBadge(item);
  const isNew = isNewish(item);

  const price = formatPrice(item?.price);
  const purpose = (item?.purpose || item?.intent || "")
    .toString()
    .toLowerCase();

  const rentSuffix =
    purpose === "rent" || item?.isRent
      ? ` ${t("perMonthShort", { ns: "listing", defaultValue: "/Monat" })}`
      : "";

  const beds = item?.bedrooms ?? item?.rooms ?? "–";
  const baths = item?.bathrooms ?? "–";
  const size = item?.size ? `${item.size} m²` : "– m²";
  const type = item?.type || item?.category || "";

  const verified = Boolean(item?.verified);
  const openHouse = item?.openHouseText || item?.openHouse || "";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClickItem?.(item);
    }
  };

  return (
    <article
      onMouseEnter={() => onHover?.(item)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClickItem?.(item)}
      onKeyDown={handleKeyDown}
      className="
        group cursor-pointer overflow-hidden rounded-3xl
        border border-gray-200 bg-white text-gray-900 shadow-sm transition
        hover:-translate-y-0.5 hover:shadow-xl
        dark:border-slate-800 dark:bg-slate-950 dark:text-gray-100
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      "
      role="button"
      tabIndex={0}
      aria-label={item?.title || "Listing"}
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-slate-900">
        <img
          src={img}
          alt={item?.title || item?.city || "Listing"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Top badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-2">
          {badge && (
            <span className="rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white">
              {badge.label}
            </span>
          )}

          {isNew && (
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              {t("new", { ns: "listing", defaultValue: "Neu" })}
            </span>
          )}

          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              <FiCheckCircle size={12} />
              {t("verified", { ns: "listing", defaultValue: "Verifiziert" })}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              shareListing(item, t);
            }}
            className="
              grid h-9 w-9 place-items-center rounded-full border
              border-white/70 bg-white/95 text-gray-800 shadow-sm transition hover:scale-[1.03]
              dark:border-slate-700 dark:bg-slate-900/95 dark:text-gray-100
            "
            aria-label={t("share", {
              ns: "listingDetails",
              defaultValue: "Teilen",
            })}
            title={t("share", {
              ns: "listingDetails",
              defaultValue: "Teilen",
            })}
          >
            <FiShare2 size={15} />
          </button>

          <div
            className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/95 shadow-sm dark:border-slate-700 dark:bg-slate-900/95"
            onClick={(e) => e.stopPropagation()}
          >
            <FavoriteButton listingId={item?.id} />
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-2.5 left-2.5 rounded-2xl bg-slate-950/85 px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur">
          € {price}
          <span className="ml-1 text-xs font-medium text-white/80">
            {rentSuffix}
          </span>
        </div>

        {/* Open house */}
        {openHouse ? (
          <div className="absolute bottom-2.5 right-2.5 rounded-xl bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow dark:bg-slate-900/95 dark:text-slate-100">
            {openHouse}
          </div>
        ) : null}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="line-clamp-1 text-[15px] font-bold leading-5 text-slate-900 dark:text-white">
          {item?.title || "—"}
        </h3>

        <p className="mt-1.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          {formatAddress(item)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">🛏</span> {beds}{" "}
            {t("bdShort", { ns: "listing", defaultValue: "Zi." })}
          </span>

          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">🛁</span> {baths}{" "}
            {t("baShort", { ns: "listing", defaultValue: "Bad" })}
          </span>

          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">📐</span> {size}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <FiMapPin size={12} />
            <span className="truncate">{item?.city || "—"}</span>
          </div>

          {type ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <FiHome size={11} />
              {type}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate">
            {t("listingId", { ns: "listing", defaultValue: "ID" })}:{" "}
            {item?.id?.slice?.(0, 6) || "—"}
          </span>

          <span className="inline-flex items-center gap-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("active", { ns: "listing", defaultValue: "Aktiv" })}
          </span>
        </div>
      </div>
    </article>
  );
});

const ListingSidebar = ({ listings = [], onClickItem, onHoverItem }) => {
  const { t } = useTranslation(["map"]);

  const safe = useMemo(
    () => (Array.isArray(listings) ? listings : []),
    [listings]
  );

  const handleClick = useCallback((item) => onClickItem?.(item), [onClickItem]);
  const handleHover = useCallback((item) => onHoverItem?.(item), [onHoverItem]);

  if (safe.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t("noResultsTitle", {
            ns: "map",
            defaultValue: "Keine Ergebnisse",
          })}
        </div>
        <div className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {t("noResultsDesc", {
            ns: "map",
            defaultValue:
              "In diesem Kartenausschnitt wurden keine Immobilien gefunden. Zoome heraus oder ändere die Filter.",
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* 1 auf klein, 2 auf mittel, 3 auf groß */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
        {safe.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            onClickItem={handleClick}
            onHover={handleHover}
          />
        ))}
      </div>
    </div>
  );
};

ListingSidebar.propTypes = {
  listings: PropTypes.arrayOf(PropTypes.object),
  onClickItem: PropTypes.func,
  onHoverItem: PropTypes.func,
};

ListingCard.propTypes = {
  item: PropTypes.object,
  onClickItem: PropTypes.func,
  onHover: PropTypes.func,
};

export default ListingSidebar;