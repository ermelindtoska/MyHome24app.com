// src/pages/FilterControls.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const FilterControls = ({ filterCity, setFilterCity, filterType, setFilterType, filterPurpose, setFilterPurpose }) => {
  const { t } = useTranslation('filterBar');

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        value={filterCity}
        onChange={(e) => setFilterCity(e.target.value)}
        placeholder={t('cityPlaceholder')}
        className="p-2 border rounded w-full md:w-1/3"
      />
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="p-2 border rounded w-full md:w-1/3"
      >
        <option value="">{t('allTypes')}</option>
        <option value="apartment">{t('apartment')}</option>
        <option value="house">{t('house')}</option>
      </select>
      <select
        value={filterPurpose}
        onChange={(e) => setFilterPurpose(e.target.value)}
        className="p-2 border rounded w-full md:w-1/3"
      >
        <option value="">{t('allPurposes')}</option>
        <option value="rent">{t('rent')}</option>
        <option value="buy">{t('buy')}</option>
      </select>
    </div>
  );
};

export default FilterControls;
