import React from "react";
import PropTypes from "prop-types";
import GoogleMapReact from "google-map-react";
import { FiX, FiMapPin, FiExternalLink } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const DEFAULT_CENTER = {
  lat: 52.52,
  lng: 13.405,
};

const Marker = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-red-500 text-lg text-white shadow-lg">
    📍
  </div>
);

const ListingMapModal = ({ listing, onClose }) => {
  const { t } = useTranslation("listing");

  const lat = Number(listing?.lat ?? listing?.latitude ?? DEFAULT_CENTER.lat);
  const lng = Number(listing?.lng ?? listing?.longitude ?? DEFAULT_CENTER.lng);

  const center = {
    lat: Number.isFinite(lat) ? lat : DEFAULT_CENTER.lat,
    lng: Number.isFinite(lng) ? lng : DEFAULT_CENTER.lng,
  };

  const address =
    listing?.address ||
    [listing?.street, listing?.zipCode || listing?.zip, listing?.city]
      .filter(Boolean)
      .join(", ") ||
    listing?.city ||
    "—";

  const externalMapUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label={t("close", { defaultValue: "Schließen" })}
        >
          <FiX size={18} />
        </button>

        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-6 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {t("mapModal.badge", { defaultValue: "Standort" })}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("mapModal.title", { defaultValue: "Immobilie auf der Karte" })}
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t("mapModal.subtitle", {
              defaultValue:
                "Sehen Sie den Standort dieser Immobilie direkt auf der Karte.",
            })}
          </p>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 dark:border-gray-700 dark:bg-gray-800/80 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                <FiMapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {listing?.title ||
                    t("mapModal.fallbackTitle", {
                      defaultValue: "Immobilie",
                    })}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {address}
                </p>
              </div>
            </div>

            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiExternalLink size={16} />
              {t("mapModal.openInMaps", {
                defaultValue: "In Google Maps öffnen",
              })}
            </a>
          </div>
        </div>

        <div className="p-6">
          <div className="h-[340px] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-700 md:h-[500px]">
            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
              }}
              defaultCenter={center}
              center={center}
              defaultZoom={11}
              options={{
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControl: true,
              }}
            >
              <Marker lat={center.lat} lng={center.lng} />
            </GoogleMapReact>
          </div>
        </div>
      </div>
    </div>
  );
};

ListingMapModal.propTypes = {
  listing: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ListingMapModal;