import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FALLBACK_IMAGE = "/images/hero-1.jpg";

const ImageModal = ({ images = [], isOpen, onClose }) => {
  const { t } = useTranslation("admin");
  const safeImages = useMemo(() => {
    const arr = Array.isArray(images) ? images.filter(Boolean) : [];
    return arr.length ? arr : [FALLBACK_IMAGE];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % safeImages.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, safeImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-3 py-4 backdrop-blur-sm md:px-6"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800 md:px-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white md:text-lg">
              {t("imagePreview", { defaultValue: "Bildvorschau" })}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">
              {currentIndex + 1} / {safeImages.length}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            aria-label={t("close", { defaultValue: "Schließen" })}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Main image area */}
        <div className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-950">
          <img
            src={safeImages[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[72vh] w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          {safeImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-700 md:left-5"
                aria-label={t("previous", { defaultValue: "Zurück" })}
              >
                <FiChevronLeft size={22} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-700 md:right-5"
                aria-label={t("next", { defaultValue: "Weiter" })}
              >
                <FiChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {safeImages.length > 1 && (
          <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 md:p-4">
            <div className="flex gap-2 overflow-x-auto">
              {safeImages.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border transition ${
                    idx === currentIndex
                      ? "border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <img
                    src={src}
                    alt={`Thumb ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;