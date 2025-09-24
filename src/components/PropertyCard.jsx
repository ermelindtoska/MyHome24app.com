import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';

const FALLBACK_IMG = '/images/hero-1.jpg';

function formatPrice(v) {
  if (v == null) return '–';
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function firstImage(item) {
  return (
    item?.images?.[0] ||
    item?.imageUrls?.[0] ||
    item?.image ||
    FALLBACK_IMG
  );
}

const PropertyCard = ({
  item,
  onCardClick,
  showComments = false,
  comments = [],
  newComment = {},
  onCommentChange,
  onSubmitComment,
  showCompare = false,
  isInCompare = false,
  toggleCompare,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['listing', 'favorites']);
  const img = firstImage(item);

  const handleCardClick = () => {
    if (typeof onCardClick === 'function') return onCardClick(item);
    navigate(`/listing/${item.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition relative text-gray-800 dark:text-gray-100">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
        <img
          src={img}
          alt={item.title || item.city || 'Listing'}
          className="h-full w-full object-cover cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
          onClick={handleCardClick}
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <FavoriteButton listingId={item.id} />
        </div>
        <div className="absolute bottom-2 left-2 rounded-md bg-white/95 dark:bg-gray-900/90 px-2 py-1 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow">
          € {formatPrice(item.price)}
        </div>
      </div>

      <div className="p-3.5">
        <h2
          className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 cursor-pointer"
          onClick={handleCardClick}
          title={item.title}
        >
          {item.title || '—'}
        </h2>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
          {item.city || ''} {item.state ? `• ${item.state}` : ''}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
          <span>{item.bedrooms ?? '–'} {t('bedrooms')}</span>
          <span>{item.bathrooms ?? '–'} {t('bathrooms')}</span>
          <span>{item.size ? `${item.size} m²` : `– m²`}</span>
          {item.type && (
            <span className="rounded-full border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-300">
              {item.type}
            </span>
          )}
        </div>

        {showCompare && (
          <button
            onClick={toggleCompare}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isInCompare ? t('favorites:removeFromCompare') : t('favorites:addToCompare')}
          </button>
        )}

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
              onChange={(e) => onCommentChange?.(item.id, 'name', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-2 mb-2 rounded"
            />
            <textarea
              placeholder={t('favorites:text')}
              value={newComment?.text || ''}
              onChange={(e) => onCommentChange?.(item.id, 'text', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-2 mb-2 rounded"
            />
            <input
              type="number"
              min="1"
              max="5"
              placeholder={t('favorites:rating')}
              value={newComment?.rating || 5}
              onChange={(e) => onCommentChange?.(item.id, 'rating', e.target.value)}
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
    </div>
  );
};

PropertyCard.propTypes = {
  item: PropTypes.object.isRequired,
  onCardClick: PropTypes.func,
  showComments: PropTypes.bool,
  comments: PropTypes.array,
  newComment: PropTypes.object,
  onCommentChange: PropTypes.func,
  onSubmitComment: PropTypes.func,
  showCompare: PropTypes.bool,
  isInCompare: PropTypes.bool,
  toggleCompare: PropTypes.func,
};

export default PropertyCard;
