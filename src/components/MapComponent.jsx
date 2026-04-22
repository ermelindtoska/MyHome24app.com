import React from "react";
import { FiMapPin, FiExternalLink } from "react-icons/fi";

const MapComponent = ({ lat, lng, address = "" }) => {
  if (!lat || !lng) return null;

  return (
    <div className="relative w-full h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      
      {/* MAP */}
      <iframe
        title="map"
        width="100%"
        height="100%"
        loading="lazy"
        className="w-full h-full"
        style={{ border: 0 }}
        src={`https://www.google.com/maps?q=${lat},${lng}&hl=de&z=14&output=embed`}
        allowFullScreen
      />

      {/* GRADIENT OVERLAY (Zillow feel) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* ADDRESS CARD */}
      {address && (
        <div className="absolute bottom-3 left-3 right-3 md:left-4 md:right-auto md:max-w-md">
          <div className="flex items-center gap-3 rounded-xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 shadow-md border border-gray-200 dark:border-gray-700">
            
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FiMapPin />
            </div>

            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Standort
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                {address}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Öffnen
              <FiExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;