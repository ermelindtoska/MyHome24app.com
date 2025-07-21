import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ImageModal = ({ images, isOpen, onClose }) => {
  const { t } = useTranslation('admin');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 dark:bg-opacity-90">
      <div className="relative w-full max-w-4xl mx-auto p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t('close')}
        </button>

        {/* Image Display */}
        <div className="flex flex-col items-center">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[70vh] w-full object-contain rounded shadow-lg"
          />

          {/* Controls */}
          <div className="mt-4 flex justify-between w-full">
            <button
              onClick={handlePrev}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ⬅ {t('previous')}
            </button>
            <span className="text-sm text-gray-300 dark:text-gray-400">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={handleNext}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {t('next')} ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
