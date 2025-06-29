// src/components/SearchBar/SearchBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ placeholder = 'searchPlaceholder' }) => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="max-w-xl mx-auto flex rounded-full overflow-hidden shadow-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t(placeholder)}
        className="flex-grow px-6 py-4 text-black text-lg outline-none"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-6 py-4 text-lg font-semibold hover:bg-blue-700 transition"
      >
        {t('searchButton')}
      </button>
    </div>
  );
};

export default SearchBar;
