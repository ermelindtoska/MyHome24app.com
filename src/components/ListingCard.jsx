// src/components/ListingCard.jsx — FINAL ZUMPER/ZILLOW STYLE
import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { useTranslation } from 'react-i18next';

const ListingCard = ({ listing }) => {
  const { t } = useTranslation('listing');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-lg transition duration-300">
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative">
          <img
            src={listing.imageUrls?.[0] || '/placeholder.jpg'}
            alt={listing.title}
            className="w-full h-48 sm:h-56 object-cover"
          />
          {listing.isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded">
              {t('featured')}
            </span>
          )}
          {listing.isLuxury && (
            <span className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {t('luxury')}
            </span>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-white truncate">{listing.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">📍 {listing.city}, {listing.postalCode}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">🛏 {listing.bedrooms} · 📐 {listing.size} m²</p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-base">
            € {listing.price?.toLocaleString() || '0'}
          </p>
        </div>
      </Link>
      <div className="p-2">
        <FavoriteButton listingId={listing.id} />
      </div>
    </div>
  );
};

export default ListingCard;
