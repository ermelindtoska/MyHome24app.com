// components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ searchTerm, onSearch }) => {
  return (
    <div className="w-full max-w-xl mx-auto my-4">
      <input
        type="text"
        placeholder="🔍 Kërko sipas qytetit ose titullit..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};

export default SearchBar;
