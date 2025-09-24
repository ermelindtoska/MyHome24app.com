import React from 'react';
import PropTypes from 'prop-types';
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

const ListingSidebar = ({ listings = [], onClickItem }) => {
  if (!Array.isArray(listings) || listings.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Keine Ergebnisse in diesem Kartenausschnitt.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {listings.map((item) => {
        const img = firstImage(item);
        return (
          <article
            key={item.id}
            onClick={() => onClickItem?.(item)}
            className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-700">
              <img
                src={img}
                alt={item.title || item.city || 'Listing'}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton listingId={item.id} />
              </div>
              <div className="absolute bottom-2 left-2 rounded-md bg-white/95 dark:bg-gray-900/90 px-2 py-1 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow">
                € {formatPrice(item.price)}
              </div>
            </div>

            <div className="px-3.5 py-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
                {item.title || '—'}
              </h3>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                {item.city || ''} {item.state ? `• ${item.state}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
                <span>{item.bedrooms ?? '–'} bd</span>
                <span>{item.bathrooms ?? '–'} ba</span>
                <span>{item.size ? `${item.size} m²` : '– m²'}</span>
                {item.type && (
                  <span className="rounded-full border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-300">
                    {item.type}
                  </span>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

ListingSidebar.propTypes = {
  listings: PropTypes.arrayOf(PropTypes.object),
  onClickItem: PropTypes.func,
};

export default ListingSidebar;
