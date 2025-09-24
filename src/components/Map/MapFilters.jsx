// src/components/Map/MapFilters.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MapFilters({ filters, sortBy, onFilterChange, onSortChange }) {
  const { t } = useTranslation(['listing', 'filterBar']);

  const set = (patch) => onFilterChange({ ...filters, ...patch });
  const reset = () =>
    onFilterChange({ city: '', type: '', priceMin: '', priceMax: '' });

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-lg p-3 md:p-4 flex flex-wrap items-center gap-2 border border-gray-200 dark:border-gray-700">
      {/* City */}
      <input
        type="text"
        placeholder={t('city', { ns: 'filterBar' })}
        value={filters.city}
        onChange={(e) => set({ city: e.target.value })}
        className="min-w-[140px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />

      {/* Type */}
      <select
        value={filters.type}
        onChange={(e) => set({ type: e.target.value })}
        className="min-w-[140px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      >
        <option value="">{t('typeAll', { ns: 'filterBar' })}</option>
        <option value="Apartment">{t('apartment', { ns: 'filterBar' })}</option>
        <option value="House">{t('house', { ns: 'filterBar' })}</option>
        <option value="Office">{t('office', { ns: 'filterBar' })}</option>
      </select>

      {/* Min price */}
      <input
        type="number"
        min="0"
        inputMode="numeric"
        placeholder={t('minPrice', { ns: 'filterBar' })}
        value={filters.priceMin}
        onChange={(e) => set({ priceMin: e.target.value })}
        className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />

      {/* Max price */}
      <input
        type="number"
        min="0"
        inputMode="numeric"
        placeholder={t('maxPrice', { ns: 'filterBar' })}
        value={filters.priceMax}
        onChange={(e) => set({ priceMax: e.target.value })}
        className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="min-w-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      >
        <option value="">{t('default', { ns: 'filterBar' })}</option>
        <option value="priceAsc">{t('priceAsc', { ns: 'filterBar' })}</option>
        <option value="priceDesc">{t('priceDesc', { ns: 'filterBar' })}</option>
      </select>

      {/* Reset */}
      <button
        type="button"
        onClick={reset}
        className="ml-auto px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        title={t('reset', { ns: 'filterBar', defaultValue: 'Zurücksetzen' })}
      >
        {t('reset', { ns: 'filterBar', defaultValue: 'Zurücksetzen' })}
      </button>
    </div>
  );
}
