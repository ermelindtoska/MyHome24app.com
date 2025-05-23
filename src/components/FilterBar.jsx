import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FilterBar = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    city: '',
    maxPrice: '',
    type: '',
    purpose: ''
  });

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow-md flex flex-col md:flex-row gap-2 justify-between mb-4">
      <input
        type="text"
        name="city"
        placeholder={t('filter.city')}
        value={filters.city}
        onChange={handleChange}
        className="p-2 border rounded w-full md:w-1/4"
      />
      <input
        type="number"
        name="maxPrice"
        placeholder={t('filter.maxPrice')}
        value={filters.maxPrice}
        onChange={handleChange}
        className="p-2 border rounded w-full md:w-1/4"
      />
      <select
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="p-2 border rounded w-full md:w-1/4"
      >
        <option value="">{t('filter.allTypes')}</option>
        <option value="Apartment">{t('addListing.fields.apartment')}</option>
        <option value="House">{t('addListing.fields.house')}</option>
      </select>
      <select
        name="purpose"
        value={filters.purpose}
        onChange={handleChange}
        className="p-2 border rounded w-full md:w-1/4"
      >
        <option value="">{t('filter.allPurposes')}</option>
        <option value="Rent">{t('addListing.fields.rent')}</option>
        <option value="Buy">{t('addListing.fields.buy')}</option>
      </select>
    </div>
  );
};

export default FilterBar;
