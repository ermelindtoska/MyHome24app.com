import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ListingDetailsModal = ({ listing, onClose }) => {
  const { t } = useTranslation('listing');
  const [current, setCurrent] = useState(0);

  const images = listing?.images || [];

  const nextImage = () => setCurrent((current + 1) % images.length);
  const prevImage = () => setCurrent((current - 1 + images.length) % images.length);

  if (!listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-black"
        >
          ✖
        </button>

        {images.length > 0 && (
          <div className="relative mb-4">
            <img
              src={images[current]}
              alt={`slide-${current}`}
              className="w-full h-56 object-cover rounded"
            />
            {images.length > 1 && (
              <div className="absolute inset-0 flex justify-between items-center px-2">
                <button onClick={prevImage} className="bg-white bg-opacity-70 px-2 py-1 rounded-full shadow">←</button>
                <button onClick={nextImage} className="bg-white bg-opacity-70 px-2 py-1 rounded-full shadow">→</button>
              </div>
            )}
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-2">{listing.title}</h2>
        <p><strong>📍 {t('city')}:</strong> {listing.city} ({listing.postalCode})</p>
        <p><strong>💶 {t('price')}:</strong> € {listing.price.toLocaleString()}</p>
        <p><strong>🏠 {t('type')}:</strong> {listing.type}</p>
        <p><strong>🎯 {t('purpose')}:</strong> {listing.purpose}</p>
        <p><strong>🛏️ {t('bedrooms')}:</strong> {listing.bedrooms}</p>
        <p><strong>📐 {t('size')}:</strong> {listing.size} m²</p>

        {listing.description && (
          <p className="mt-2 text-gray-700 whitespace-pre-line">{listing.description}</p>
        )}
      </div>
    </div>
  );
};

export default ListingDetailsModal;
