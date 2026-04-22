import React, { useEffect } from "react";
import { FaTimes, FaArrowRight } from "react-icons/fa";

const SpecialFeatureModal = ({ feature, onClose, onCtaClick }) => {
  useEffect(() => {
    if (!feature) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [feature, onClose]);

  if (!feature) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Modal schließen"
        >
          <FaTimes size={16} />
        </button>

        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 px-6 py-8 text-white md:px-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-4xl shadow-lg">
              {feature.icon}
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold md:text-3xl">
            {feature.title}
          </h2>

          {feature.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/90 md:text-base">
              {feature.subtitle}
            </p>
          )}
        </div>

        <div className="px-6 py-6 md:px-8 md:py-8">
          <p className="text-center text-base leading-7 text-gray-700 dark:text-gray-300">
            {feature.description}
          </p>

          {feature.highlights && Array.isArray(feature.highlights) && (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {feature.highlights.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300"
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {(feature.ctaText || feature.linkText) && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => onCtaClick?.(feature)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                {feature.ctaText || feature.linkText || "Mehr erfahren"}
                <FaArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialFeatureModal;