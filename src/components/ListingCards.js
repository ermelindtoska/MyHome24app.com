// src/components/ListingCards.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const ListingCards = ({ listings }) => {
  const { t } = useTranslation();

  if (!listings || listings.length === 0) {
    return <p className="text-center text-gray-400 italic">{t('noListings')}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border"
        >
          {listing.images?.length > 1 ? (
            <Carousel showThumbs={false} showStatus={false} infiniteLoop autoPlay>
              {listing.images.map((url, i) => (
                <div key={i}>
                  <img src={url} alt={`photo-${i}`} className="h-48 w-full object-cover" />
                </div>
              ))}
            </Carousel>
          ) : listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">{t('noImage')}</span>
            </div>
          )}

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{listing.title}</h3>
            <p className="text-sm text-gray-600">📍 {listing.city}</p>
            <p className="text-gray-500 text-sm line-clamp-2 mt-1">{listing.description}</p>
            <p className="text-sm italic text-gray-400 mt-1">{listing.category} – {listing.type}</p>
            {listing.price && (
              <p className="text-right text-blue-600 font-bold mt-2">
                {parseFloat(listing.price).toLocaleString()} €
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingCards;