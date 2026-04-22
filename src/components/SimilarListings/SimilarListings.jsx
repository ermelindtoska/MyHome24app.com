import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiHome, FiArrowRight, FiMaximize2 } from "react-icons/fi";

const FALLBACK_IMG = "/images/hero-1.jpg";

function firstImage(l) {
  return l?.images?.[0] || l?.imageUrls?.[0] || l?.image || FALLBACK_IMG;
}

function priceNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function formatPrice(value, purpose) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";

  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

  return purpose === "rent" ? `${formatted} / Monat` : formatted;
}

/**
 * Zgjedh listime të ngjashme duke prioritarizuar:
 *  1) të njëjtin qytet
 *  2) të njëjtin tip
 *  3) diferencë të vogël në çmim
 */
export default function SimilarListings({
  currentListing,
  allListings = [],
  limit = 6,
  onPick,
}) {
  const { t } = useTranslation("listing");
  const navigate = useNavigate();

  const basePrice = priceNumber(currentListing?.price);

  const items = useMemo(() => {
    if (!currentListing) return [];

    return allListings
      .filter((l) => l && l.id !== currentListing.id)
      .map((l) => {
        let score = 0;

        if (l.city && currentListing.city && l.city === currentListing.city) {
          score += 100;
        }

        if (l.type && currentListing.type && l.type === currentListing.type) {
          score += 40;
        }

        const p = priceNumber(l.price);
        const diff =
          basePrice != null && p != null ? Math.abs(basePrice - p) : Infinity;

        if (diff !== Infinity) {
          score += Math.max(0, 30 - Math.min(30, diff / 10000));
        }

        return { ...l, _score: score, _priceDiff: diff };
      })
      .sort((a, b) => b._score - a._score || a._priceDiff - b._priceDiff)
      .slice(0, limit);
  }, [allListings, currentListing, basePrice, limit]);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {t("noSimilar", { defaultValue: "Keine ähnlichen Immobilien gefunden." })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((l) => {
        const sameCity =
          l.city && currentListing?.city && l.city === currentListing.city;

        const sameType =
          l.type && currentListing?.type && l.type === currentListing.type;

        return (
          <div
            key={l.id}
            className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden sm:h-auto sm:w-44 sm:min-w-[11rem]">
                <img
                  src={firstImage(l)}
                  alt={l.title || "Listing"}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />

                <div className="absolute bottom-3 left-3 rounded-2xl bg-slate-950/85 px-3 py-2 text-sm font-bold text-white backdrop-blur">
                  {formatPrice(l.price, l.purpose)}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-4 md:p-5">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {sameCity && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {t("sameCity", { defaultValue: "Gleiche Stadt" })}
                      </span>
                    )}

                    {sameType && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        {t("sameType", { defaultValue: "Gleicher Typ" })}
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                    {l.title || "—"}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <FiMapPin size={15} />
                    <span className="line-clamp-1">
                      {l.city || ""}
                      {l.type ? ` • ${l.type}` : ""}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.size ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        <FiMaximize2 size={13} />
                        {l.size} m²
                      </span>
                    ) : null}

                    {l.type ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        <FiHome size={13} />
                        {l.type}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {l._score != null
                      ? t("matchScore", {
                          defaultValue: "Match-Score: {{score}}",
                          score: Math.round(l._score),
                        })
                      : ""}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onPick) {
                        onPick(l);
                      } else {
                        navigate(`/listing/${l.id}`);
                      }
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                    title={t("viewListing", { defaultValue: "Listing ansehen" })}
                  >
                    {t("viewListing", { defaultValue: "Listing ansehen" })}
                    <FiArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

SimilarListings.propTypes = {
  currentListing: PropTypes.object,
  allListings: PropTypes.array,
  limit: PropTypes.number,
  onPick: PropTypes.func,
};