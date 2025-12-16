// src/components/ListingSidebar.jsx
import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import FavoriteButton from "./FavoriteButton";
import { useTranslation } from "react-i18next";

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
  return item?.images?.[0] || item?.imageUrls?.[0] || item?.image || FALLBACK_IMG;
}

function formatAddress(item) {
  const parts = [item?.address || item?.street || "", item?.zip || "", item?.city || ""].filter(Boolean);
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
  const promo = (item?.promotion || item?.tier || item?.plan || "").toString().toLowerCase();
  if (promo.includes("showcase") || promo.includes("premium")) return { key: "showcase", label: "Showcase" };
  if (promo.includes("featured")) return { key: "featured", label: "Featured" };
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
  } catch {
    // ignore
  }

  try {
    await navigator.clipboard.writeText(url);
    dispatchMiniToast(t("toastLinkCopied", { ns: "listingDetails", defaultValue: "Link kopiert" }));
  } catch {
    dispatchMiniToast(t("toastCopyFailed", { ns: "listingDetails", defaultValue: "Kopieren fehlgeschlagen" }));
  }
}

const ListingCard = memo(function ListingCard({ item, onClickItem, onHover }) {
  const { t } = useTranslation(["listing", "map", "listingDetails"]);

  const img = firstImage(item);
  const badge = getBadge(item);
  const isNew = isNewish(item);

  const price = formatPrice(item?.price);
  const purpose = (item?.purpose || item?.intent || "").toString().toLowerCase();

  const rentSuffix =
    purpose === "rent" || item?.isRent
      ? ` ${t("perMonthShort", { ns: "listing", defaultValue: "/mo" })}`
      : "";

  const beds = item?.bedrooms ?? item?.rooms ?? "–";
  const baths = item?.bathrooms ?? "–";
  const size = item?.size ? `${item.size} m²` : `– m²`;
  const type = item?.type || item?.category || "";

  const verified = Boolean(item?.verified);
  const openHouse = item?.openHouseText || item?.openHouse || "";

  return (
    <article
      onMouseEnter={() => onHover?.(item)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClickItem?.(item)}
      className="group cursor-pointer rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition overflow-hidden"
      role="button"
      tabIndex={0}
    >
      <div className="relative aspect-[16/10] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={img}
          alt={item?.title || item?.city || "Listing"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

        <div className="absolute left-2 top-2 flex flex-wrap gap-2">
          {badge && (
            <span className="rounded-full bg-black/70 text-white text-[11px] px-2 py-1">
              {badge.label}
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-blue-600 text-white text-[11px] px-2 py-1">
              {t("new", { ns: "listing", defaultValue: "Neu" })}
            </span>
          )}
          {verified && (
            <span className="rounded-full bg-emerald-600 text-white text-[11px] px-2 py-1">
              {t("verified", { ns: "listing", defaultValue: "Verifiziert" })}
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              shareListing(item, t);
            }}
            className="h-9 w-9 rounded-full bg-white/95 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-700 grid place-items-center text-gray-700 dark:text-gray-200 hover:scale-[1.03] transition"
            aria-label={t("share", { ns: "listingDetails", defaultValue: "Teilen" })}
            title={t("share", { ns: "listingDetails", defaultValue: "Teilen" })}
          >
            ↗
          </button>

          <div
            className="h-9 w-9 rounded-full bg-white/95 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-700 grid place-items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <FavoriteButton listingId={item?.id} />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 rounded-xl bg-white/95 dark:bg-gray-950/85 px-2.5 py-1.5 shadow border border-gray-200/60 dark:border-gray-700/60">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            € {price}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{rentSuffix}</span>
          </div>
        </div>

        {openHouse ? (
          <div className="absolute bottom-2 right-2 rounded-xl bg-black/70 text-white text-[11px] px-2 py-1">
            {openHouse}
          </div>
        ) : null}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
          {item?.title || "—"}
        </h3>

        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
          {formatAddress(item)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">🛏</span> {beds} {t("bdShort", { ns: "listing", defaultValue: "bd" })}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">🛁</span> {baths} {t("baShort", { ns: "listing", defaultValue: "ba" })}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">📐</span> {size}
          </span>

          {type ? (
            <span className="ml-auto rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-300">
              {type}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span className="truncate">
            {t("listingId", { ns: "listing", defaultValue: "ID" })}: {item?.id?.slice?.(0, 6) || "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("active", { ns: "listing", defaultValue: "Aktiv" })}
          </span>
        </div>
      </div>
    </article>
  );
});

const ListingSidebar = ({ listings = [], onClickItem, onHoverItem }) => {
  const { t } = useTranslation(["map", "listing"]);

  const safe = useMemo(() => (Array.isArray(listings) ? listings : []), [listings]);

  if (safe.length === 0) {
    return (
      <div className="h-full p-6 flex flex-col items-center justify-center text-center">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("noResultsTitle", { ns: "map", defaultValue: "Keine Ergebnisse" })}
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 max-w-sm">
          {t("noResultsDesc", {
            ns: "map",
            defaultValue: "In diesem Kartenausschnitt wurden keine Immobilien gefunden. Zoome heraus oder ändere die Filter.",
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {safe.map((item) => (
          <ListingCard key={item.id} item={item} onClickItem={onClickItem} onHover={onHoverItem} />
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
