// src/components/HeroSection.jsx
import React from 'react';

const HeroSection = ({ filters, onChange, onSubmit }) => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shtëpi & Apartamente me Qera ose Shitje në Gjermani 🇩🇪</h2>
          <p className="text-lg">Portali më i mirë për prona në Gjermani – me mijëra shpallje për banesa, apartamente dhe prona të ndryshme për qira ose shitje.</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 shadow-lg space-y-4">
          <input
            type="text"
            name="keyword"
            value={filters.keyword}
            onChange={onChange}
            placeholder="🔍 Kërko me fjalë kyçe"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />

          <select
            name="type"
            value={filters.type}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">🏠 Qira/Shitje</option>
            <option value="Miete">Me Qira</option>
            <option value="Verkauf">Në Shitje</option>
          </select>

          <select
            name="city"
            value={filters.city}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">📍 Qyteti</option>
            <option value="Berlin">Berlin</option>
            <option value="Hamburg">Hamburg</option>
            <option value="München">München</option>
            <option value="Stuttgart">Stuttgart</option>
            <option value="Frankfurt">Frankfurt</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
          >
            Kërko
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;