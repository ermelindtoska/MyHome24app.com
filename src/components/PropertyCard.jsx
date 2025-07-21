// components/PropertyCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';

const PropertyCard = ({
  item,
  showComments = false,
  comments = [],
  newComment = {},
  onCommentChange,
  onSubmitComment,
  showCompare = false,
  isInCompare = false,
  toggleCompare
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['listing', 'favorites']);

  const handleCardClick = () => {
    navigate(`/listing/${item.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 relative text-gray-800 dark:text-gray-100">
      <div className="cursor-pointer" onClick={handleCardClick}>
        <img
          src={item.imageUrls?.[0] || '/no-image.jpg'}
          alt={item.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h2>
        <p className="text-blue-600 dark:text-blue-400 font-semibold">€ {item.price}</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.city}</p>
        <div className="flex gap-2 text-sm mt-2 text-gray-500 dark:text-gray-400">
          <span>{item.bedrooms} {t('listing:bedrooms')}</span>
          <span>{item.bathrooms} {t('listing:bathrooms')}</span>
          <span>{item.size} m²</span>
        </div>
      </div>

      {/* ❤️ Favorite Button */}
      <div className="absolute top-4 right-4">
        <FavoriteButton listingId={item.id} />
      </div>

      {/* 🔄 Compare */}
      {showCompare && (
        <button
          onClick={toggleCompare}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isInCompare ? t('favorites:removeFromCompare') : t('favorites:addToCompare')}
        </button>
      )}

      {/* 💬 Comments Section */}
      {showComments && (
        <div className="mt-4">
          <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">
            {t('favorites:comments')}
          </h3>
          <div className="space-y-1 mb-2">
            {comments?.map((c, i) => (
              <div key={i} className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                <strong>{c.name}</strong>: {c.text} ({c.rating}⭐)
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder={t('favorites:name')}
            value={newComment?.name || ''}
            onChange={(e) => onCommentChange(item.id, 'name', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-2 mb-2 rounded"
          />
          <textarea
            placeholder={t('favorites:text')}
            value={newComment?.text || ''}
            onChange={(e) => onCommentChange(item.id, 'text', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-2 mb-2 rounded"
          />
          <input
            type="number"
            min="1"
            max="5"
            placeholder={t('favorites:rating')}
            value={newComment?.rating || 5}
            onChange={(e) => onCommentChange(item.id, 'rating', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-2 mb-2 rounded"
          />
          <button
            onClick={onSubmitComment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            {t('favorites:submit')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
