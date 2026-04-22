import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FiX,
  FiMapPin,
  FiHome,
  FiMaximize2,
  FiDroplet,
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

const CompareModal = ({ onClose, listing }) => {
  const { t } = useTranslation("compare");
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  const facts = useMemo(
    () => [
      {
        icon: <FiMapPin />,
        label: t("location", { defaultValue: "Ort" }),
        value: listing?.city || "—",
      },
      {
        icon: <FiHome />,
        label: t("type", { defaultValue: "Immobilientyp" }),
        value: listing?.type || "—",
      },
      {
        icon: <FiMaximize2 />,
        label: t("size", { defaultValue: "Fläche" }),
        value: listing?.size ? `${listing.size} m²` : "—",
      },
      {
        icon: <FiBed />,
        label: t("bedrooms", { defaultValue: "Schlafzimmer" }),
        value: listing?.bedrooms ?? listing?.rooms ?? "—",
      },
      {
        icon: <FiDroplet />,
        label: t("bathrooms", { defaultValue: "Bäder" }),
        value: listing?.bathrooms ?? "—",
      },
    ],
    [listing, t]
  );

  if (!listing) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white/95 text-gray-600 transition hover:bg-gray-50 hover:text-black dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={t("actions.close", { defaultValue: "Schließen" })}
        >
          <FiX size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* IMAGE */}
          <div className="relative h-72 md:h-full min-h-[320px] bg-slate-100 dark:bg-slate-900">
            <img
              src={firstImage(listing)}
              alt={listing?.title || t("property", { defaultValue: "Immobilie" })}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />

            <div className="absolute bottom-4 left-4 rounded-2xl bg-slate-950/85 px-4 py-2 text-lg font-bold text-white backdrop-blur">
              {formatPrice(listing?.price)}
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex flex-col p-6 md:p-7">
            <div className="mb-5">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                {t("compareTitle", {
                  defaultValue: "Vergleich von bis zu 3 Objekten",
                })}
              </div>

              <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
                {listing?.title || "—"}
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {listing?.description ||
                  t("details.noDescription", {
                    defaultValue: "Keine Beschreibung verfügbar.",
                  })}
              </p>
            </div>

            {/* FACTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facts.map((fact, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {fact.icon}
                    {fact.label}
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("actions.close", { defaultValue: "Schließen" })}
              </button>

              {listing?.id ? (
                <a
                  href={`/listing/${listing.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t("actions.viewDetails", { defaultValue: "Details ansehen" })}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;