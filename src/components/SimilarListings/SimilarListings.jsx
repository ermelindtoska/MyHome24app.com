// src/components/SimilarListings/SimilarListings.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FALLBACK_IMG = '/images/hero-1.jpg';

function firstImage(l) {
  return l?.images?.[0] || l?.imageUrls?.[0] || l?.image || FALLBACK_IMG;
}
function priceNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * Zgjedh listime të ngjashme duke prioritarizuar:
 *  1) të njëjtin qytet (pikë të larta)
 *  2) të njëjtin tip (pikë të mesme)
 *  3) diferencë të vogël në çmim (sa më afër aq më mirë)
 */
export default function SimilarListings({
  currentListing,
  allListings = [],
  limit = 6,
  onPick, // opsionale; nëse nuk jepet -> navigon te /listing/:id
}) {
  const { t } = useTranslation('listing');
  const navigate = useNavigate();

  const basePrice = priceNumber(currentListing?.price);

  const items = useMemo(() => {
    if (!currentListing) return [];

    return allListings
      .filter((l) => l && l.id !== currentListing.id)
      .map((l) => {
        let score = 0;
        if (l.city && currentListing.city && l.city === currentListing.city) score += 100;
        if (l.type && currentListing.type && l.type === currentListing.type) score += 40;

        const p = priceNumber(l.price);
        const diff = basePrice != null && p != null ? Math.abs(basePrice - p) : Infinity;
        // sa më afër çmimit, aq më shumë pikë
        if (diff !== Infinity) score += Math.max(0, 30 - Math.min(30, diff / 10000)); // ~1 pikë / 10k €

        return { ...l, _score: score, _priceDiff: diff };
      })
      .sort((a, b) => b._score - a._score || a._priceDiff - b._priceDiff)
      .slice(0, limit);
  }, [allListings, currentListing, basePrice]);

  if (!items.length) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
        {t('noSimilar', 'No similar listings found.')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((l) => (
        <div
          key={l.id}
          className="flex items-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 shadow-sm"
        >
          <img
            src={firstImage(l)}
            alt={l.title}
            className="w-16 h-16 object-cover rounded mr-3"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">{l.title || '—'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
              {l.city || ''} {l.type ? `• ${l.type}` : ''}
            </p>
            {l.price != null && (
              <p className="text-xs text-gray-700 dark:text-gray-200">
                € {Number(l.price).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              if (onPick) {
                onPick(l);
              } else {
                navigate(`/listing/${l.id}`);
              }
            }}
            className="text-blue-600 dark:text-blue-400 text-xs underline ml-2 shrink-0"
            title={t('viewListing', 'View listing')}
          >
            {t('viewListing', 'View listing')}
          </button>
        </div>
      ))}
    </div>
  );
}

SimilarListings.propTypes = {
  currentListing: PropTypes.object,
  allListings: PropTypes.array,
  limit: PropTypes.number,
  onPick: PropTypes.func,
};
