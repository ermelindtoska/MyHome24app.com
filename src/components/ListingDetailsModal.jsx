import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ListingDetailsModal = ({ listing, onClose }) => {
  const { t } = useTranslation('listing');
  const [current, setCurrent] = useState(0);
  const images = listing?.images || [];

  const nextImage = () => setCurrent((current + 1) % images.length);
  const prevImage = () => setCurrent((current - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Kontroll bosh
  if (!listing) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end"
      onClick={onClose} // Klik jashtë e mbyll
    >
      <div
        className="bg-white w-full sm:max-w-md h-full overflow-y-auto p-6 shadow-xl animate-slideInRight relative"
        onClick={(e) => e.stopPropagation()} // Mos lejo mbyllje kur klikon brenda modalit
      >
        {/* Butoni X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl font-bold text-gray-500 hover:text-black transition-all z-50"
        >
          ✖
        </button>

        {/* Slider */}
        {images.length > 0 && (
          <div className="relative mb-4 rounded overflow-hidden shadow-md">
            <img
              src={images[current]}
              alt={`slide-${current}`}
              className="w-full h-60 object-cover transition-all duration-300"
            />
            {images.length > 1 && (
              <div className="absolute inset-0 flex justify-between items-center px-3">
                <button
                  onClick={prevImage}
                  className="bg-white bg-opacity-70 px-2 py-1 rounded-full hover:scale-105 transition"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="bg-white bg-opacity-70 px-2 py-1 rounded-full hover:scale-105 transition"
                >
                  →
                </button>
              </div>
            )}
            <div className="absolute bottom-2 right-3 text-sm text-gray-700 bg-white bg-opacity-70 px-2 py-0.5 rounded">
              {current + 1}/{images.length}
            </div>
          </div>
        )}

        {/* Detajet e listimit */}
        <h2 className="text-2xl font-semibold mb-2">{listing.title}</h2>
        <p className="mb-1"><strong>📍 {t('city')}:</strong> {listing.city} ({listing.postalCode})</p>
        <p className="mb-1"><strong>💶 {t('price')}:</strong> € {listing.price.toLocaleString()}</p>
        <p className="mb-1"><strong>🏠 {t('type')}:</strong> {listing.type}</p>
        <p className="mb-1"><strong>🎯 {t('purpose')}:</strong> {listing.purpose}</p>
        <p className="mb-1"><strong>🛏️ {t('bedrooms')}:</strong> {listing.bedrooms}</p>
        <p className="mb-1"><strong>📐 {t('size')}:</strong> {listing.size} m²</p>

        {listing.description && (
          <p className="mt-4 text-gray-700 whitespace-pre-line leading-relaxed">
            {listing.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ListingDetailsModal;
