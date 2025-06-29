import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';

const PropertyCard = ({ listing }) => {
  const { t } = useTranslation('home');

  const {
    id,
    title = t('noTitle'),
    price,
    city = '-',
    state = '',
    rooms,
    bathrooms,
    size,
    imageUrls
  } = listing;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <Link to={`/listing/${id}`}>
        <img
          src={imageUrls?.[0] || '/images/placeholder-house.jpg'}
          alt={title}
          className="w-full h-56 object-cover"
        />
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {title}
          </h3>
          <FaHeart className="text-gray-400 hover:text-red-500 cursor-pointer" />
        </div>

        <p className="text-blue-600 font-bold text-xl mt-1">
          € {price?.toLocaleString() || '–'}
        </p>
        <p className="text-gray-600 text-sm">{city}, {state}</p>

        <div className="flex justify-between items-center text-gray-500 text-sm mt-3">
          <span className="flex items-center gap-1"><FaBed /> {rooms || '-'} {t('rooms')}</span>
          <span className="flex items-center gap-1"><FaBath /> {bathrooms || '-'} {t('bathrooms')}</span>
          <span className="flex items-center gap-1"><FaRulerCombined /> {size || '-'} m²</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
