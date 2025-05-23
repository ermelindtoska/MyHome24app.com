// src/components/FilterBar.js
import React from 'react';

function FilterBar({ filters, onChange, onSearch }) {
  return (
    <form
      onSubmit={onSearch}
      className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto -mt-10 grid grid-cols-1 md:grid-cols-5 gap-4"
    >
      <input
        type="text"
        name="keyword"
        placeholder="🔍 Suchbegriff"
        value={filters.keyword}
        onChange={onChange}
        className="border rounded px-3 py-2"
      />
      <select
        name="type"
        value={filters.type}
        onChange={onChange}
        className="border rounded px-3 py-2"
      >
        <option value="">Typ</option>
        <option value="rent">Zur Miete</option>
        <option value="sale">Zum Verkauf</option>
      </select>
      <select
        name="city"
        value={filters.city}
        onChange={onChange}
        className="border rounded px-3 py-2"
      >
        <option value="">Stadt</option>
        <option value="Berlin">Berlin</option>
        <option value="Hamburg">Hamburg</option>
        <option value="München">München</option>
      </select>
      <select
        name="category"
        value={filters.category}
        onChange={onChange}
        className="border rounded px-3 py-2"
      >
        <option value="">Kategorie</option>
        <option value="Wohnung">Wohnung</option>
        <option value="Haus">Haus</option>
        <option value="Büro">Büro</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
      >
        Suchen
      </button>
    </form>
  );
}

export default FilterBar;
