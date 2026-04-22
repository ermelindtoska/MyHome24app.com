import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiMapPin,
  FiHome,
  FiMaximize2,
  FiMessageSquare,
} from "react-icons/fi";
import { FaBalanceScale } from "react-icons/fa";
import FavoriteButton from "./FavoriteButton";

const FALLBACK_IMG = "/images/hero-1.jpg";

function formatPrice(value) {
  if (value == null || value === "") return "–";
  const n = Number(value);
  return Number.isNaN(n)
    ? String(value)
    : n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

function firstImage(item) {
  return (
    item?.images?.[0] ||
    item?.imageUrls?.[0] ||
    item?.imageUrl ||
    item?.image ||
    item?.primaryImageUrl ||
    FALLBACK_IMG
  );
}

function safeText(value, fallback = "–") {
  if (value == null || value === "") return fallback;
  return String(value);
}

const PropertyCard = ({
  item,
  onCardClick,
  showComments = false,
  comments = [],
  newComment = {},
  onCommentChange,
  onSubmitComment,
  showCompare = false,
  isInCompare = false,
  toggleCompare,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["listing", "favorites"]);
  const img = firstImage(item);

  const handleCardClick = () => {
    if (typeof onCardClick === "function") {
      onCardClick(item);
      return;
    }
    navigate(`/listing/${item.id}`);
  };

  const handleImageError = (e) => {
    e.currentTarget.src = FALLBACK_IMG;
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/20">
      {/* Bildbereich */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={img}
          alt={item?.title || item?.city || "Listing"}
          onError={handleImageError}
          onClick={handleCardClick}
          loading="lazy"
          className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-2">
            {item?.isNew && (
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                {t("new", { ns: "favorites", defaultValue: "Neu" })}
              </span>
            )}

            {item?.purpose && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-100">
                {t(`fields.${item.purpose}`, {
                  ns: "listing",
                  defaultValue: item.purpose,
                })}
              </span>
            )}
          </div>

          <div className="shrink-0">
            <FavoriteButton listingId={item.id} />
          </div>
        </div>

        <div className="absolute bottom-3 left-3">
          <div className="rounded-xl bg-white/95 px-3 py-1.5 text-sm font-bold text-gray-900 shadow-lg backdrop-blur dark:bg-gray-900/90 dark:text-white">
            € {formatPrice(item?.price)}
          </div>
        </div>
      </div>

      {/* Inhalt */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              className="cursor-pointer truncate text-base font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              onClick={handleCardClick}
              title={item?.title || ""}
            >
              {safeText(item?.title)}
            </h2>

            <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <FiMapPin className="shrink-0 text-blue-500" />
              <span className="truncate">
                {safeText(item?.city, "")}
                {item?.state ? `, ${item.state}` : ""}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
          <div className="flex flex-col items-center justify-center text-center">
            <FiHome className="mb-1 text-sm text-blue-500" />
            <span className="font-semibold">{safeText(item?.bedrooms)}</span>
            <span>{t("bedrooms", { defaultValue: "Schlafzimmer" })}</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <FiHome className="mb-1 text-sm text-violet-500" />
            <span className="font-semibold">{safeText(item?.bathrooms)}</span>
            <span>{t("bathrooms", { defaultValue: "Badezimmer" })}</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <FiMaximize2 className="mb-1 text-sm text-emerald-500" />
            <span className="font-semibold">
              {item?.size ? `${item.size}` : "–"}
            </span>
            <span>m²</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {item?.type && (
            <span className="rounded-full border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300">
              {t(`fields.${item.type}`, {
                ns: "listing",
                defaultValue: item.type,
              })}
            </span>
          )}

          {item?.status && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {safeText(item.status)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCardClick}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t("details", { ns: "listing", defaultValue: "Details" })}
          </button>

          {showCompare && (
            <button
              onClick={toggleCompare}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                isInCompare
                  ? "bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <FaBalanceScale />
              {isInCompare
                ? t("favorites:removeFromCompare")
                : t("favorites:addToCompare")}
            </button>
          )}
        </div>

        {/* Kommentare */}
        {showComments && (
          <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <FiMessageSquare className="text-blue-500" />
              {t("favorites:comments")}
            </h3>

            <div className="mb-3 space-y-2">
              {comments?.length > 0 ? (
                comments.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {c.name}
                    </span>
                    : {c.text}{" "}
                    <span className="text-amber-500">({c.rating}★)</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("favorites:noComments", {
                    defaultValue: "Noch keine Kommentare vorhanden.",
                  })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder={t("favorites:name")}
                value={newComment?.name || ""}
                onChange={(e) =>
                  onCommentChange?.(item.id, "name", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />

              <textarea
                placeholder={t("favorites:text")}
                value={newComment?.text || ""}
                onChange={(e) =>
                  onCommentChange?.(item.id, "text", e.target.value)
                }
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />

              <input
                type="number"
                min="1"
                max="5"
                placeholder={t("favorites:rating")}
                value={newComment?.rating || 5}
                onChange={(e) =>
                  onCommentChange?.(item.id, "rating", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />

              <button
                onClick={onSubmitComment}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t("favorites:submit")}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

PropertyCard.propTypes = {
  item: PropTypes.object.isRequired,
  onCardClick: PropTypes.func,
  showComments: PropTypes.bool,
  comments: PropTypes.array,
  newComment: PropTypes.object,
  onCommentChange: PropTypes.func,
  onSubmitComment: PropTypes.func,
  showCompare: PropTypes.bool,
  isInCompare: PropTypes.bool,
  toggleCompare: PropTypes.func,
};

export default PropertyCard;