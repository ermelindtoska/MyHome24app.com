// src/components/SearchBar/SearchBar.jsx — VERSIONI PËRFUNDIMTAR
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiSearch } from 'react-icons/hi';

const SearchBar = ({ placeholder = 'searchPlaceholder' }) => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(placeholder)}
          className="flex-grow px-4 py-3 text-gray-900 dark:text-gray-100 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 outline-none text-base sm:text-lg"
        />
        <button
          onClick={handleSearch}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-r-full transition"
          aria-label="{t('searchButton')}"
        >
          <HiSearch className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
