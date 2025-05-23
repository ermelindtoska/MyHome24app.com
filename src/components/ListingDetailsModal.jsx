import React, { useState } from 'react';

const ListingDetailsModal = ({ listing, onClose }) => {
  const [current, setCurrent] = useState(0);
  const images = listing.images || [];

  const nextImage = () => setCurrent((current + 1) % images.length);
  const prevImage = () => setCurrent((current - 1 + images.length) % images.length);

  if (!listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-black">
          ✖
        </button>

        {images.length > 0 && (
          <div className="relative mb-4">
            <img src={images[current]} alt={`slide-${current}`} className="w-full h-48 object-cover rounded" />
            {images.length > 1 && (
              <div className="absolute inset-0 flex justify-between items-center px-2">
                <button onClick={prevImage} className="bg-white bg-opacity-50 p-1 rounded-full">←</button>
                <button onClick={nextImage} className="bg-white bg-opacity-50 p-1 rounded-full">→</button>
              </div>
            )}
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-2">{listing.title}</h2>
        <p><strong>📍 Stadt:</strong> {listing.city}</p>
        <p><strong>💶 Preis:</strong> €{listing.price}</p>
        <p><strong>🏠 Typ:</strong> {listing.type}</p>
        <p><strong>🎯 Zweck:</strong> {listing.purpose}</p>
      </div>
    </div>
  );
};

export default ListingDetailsModal;
