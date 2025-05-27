// src/components/FilterControls.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const FilterControls = ({ filterCity, setFilterCity, filterType, setFilterType, filterPurpose, setFilterPurpose }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <input
        type="text"
        placeholder={t('filter.city')}
        className="border px-3 py-2 rounded w-full"
        value={filterCity}
        onChange={(e) => setFilterCity(e.target.value)}
      />
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="border px-3 py-2 rounded w-full"
      >
        <option value="">{t('filter.allTypes')}</option>
        <option value="apartment">{t('addListing.fields.apartment')}</option>
        <option value="house">{t('addListing.fields.house')}</option>
      </select>
      <select
        value={filterPurpose}
        onChange={(e) => setFilterPurpose(e.target.value)}
        className="border px-3 py-2 rounded w-full"
      >
        <option value="">{t('filter.allPurposes')}</option>
        <option value="rent">{t('addListing.fields.rent')}</option>
        <option value="buy">{t('addListing.fields.buy')}</option>
      </select>
    </div>
  );
};

export default FilterControls;
