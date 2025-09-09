// src/components/Map/MapFilters.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MapFilters = ({ filters, sortBy, onFilterChange, onSortChange }) => {
  const { t } = useTranslation(['listing', 'filterBar']);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-wrap gap-2 border border-gray-200 dark:border-gray-700">
      <input
        type="text"
        placeholder={t('city', { ns: 'filterBar' })}
        value={filters.city}
        onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />
      <select
        value={filters.type}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      >
        <option value="">{t('typeAll', { ns: 'filterBar' })}</option>
        <option value="Apartment">{t('apartment', { ns: 'filterBar' })}</option>
        <option value="House">{t('house', { ns: 'filterBar' })}</option>
        <option value="Office">{t('office', { ns: 'filterBar' })}</option>
      </select>
      <input
        type="number"
        placeholder={t('minPrice', { ns: 'filterBar' })}
        value={filters.priceMin}
        onChange={(e) => onFilterChange({ ...filters, priceMin: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />
      <input
        type="number"
        placeholder={t('maxPrice', { ns: 'filterBar' })}
        value={filters.priceMax}
        onChange={(e) => onFilterChange({ ...filters, priceMax: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      >
        <option value="">{t('default', { ns: 'filterBar' })}</option>
        <option value="priceAsc">{t('priceAsc', { ns: 'filterBar' })}</option>
        <option value="priceDesc">{t('priceDesc', { ns: 'filterBar' })}</option>
      </select>
    </div>
  );
};

export default MapFilters;