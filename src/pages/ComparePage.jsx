// src/pages/ComparePage.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaEuroSign, FaStar, FaHome, FaPrint, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ComparePage = () => {
  const location = useLocation();
  const allListings = location.state?.listings || [];
  const [listings, setListings] = useState(allListings);
  const [cityFilter, setCityFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  const resetFilters = () => {
    setCityFilter('');
    setMaxPriceFilter('');
    setMinRatingFilter('');
  };

  const filteredListings = listings.filter(item => {
    const matchesCity = cityFilter ? item.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
    const matchesPrice = maxPriceFilter ? item.price <= parseFloat(maxPriceFilter) : true;
    const matchesRating = minRatingFilter ? (parseFloat(item.avgRating) || 0) >= parseFloat(minRatingFilter) : true;
    return matchesCity && matchesPrice && matchesRating;
  });

  const removeListing = (index) => {
    const updated = [...listings];
    updated.splice(index, 1);
    setListings(updated);
  };

  const formatPrice = (price) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(price);
  const getPriceColor = (price) => price < 100000 ? 'text-green-600' : price < 300000 ? 'text-yellow-600' : 'text-red-600';

  const exportCSV = () => {
    const headers = ['Titel', 'Ort', 'Preis (€)', 'Ø Bewertung'];
    const rows = filteredListings.map((item) => [item.title, item.city, item.price, item.avgRating || '-']);
    const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vergleich.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPage = () => {
    window.print();
  };

  const copySummary = () => {
    const summary = filteredListings.map(item => `${item.title} (${item.city}) – ${formatPrice(item.price)}${item.avgRating ? `, Bewertung: ${item.avgRating}` : ''}`).join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedText('Kopiert!');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const emailSummary = () => {
    const body = filteredListings.map(item => `${item.title} (${item.city}) – ${formatPrice(item.price)}${item.avgRating ? `, Bewertung: ${item.avgRating}` : ''}`).join('%0A');
    const mailto = `mailto:?subject=Immobilienvergleich&body=${body}`;
    window.location.href = mailto;
  };

  const chartData = filteredListings.map(item => ({ name: item.title, Preis: item.price, Bewertung: parseFloat(item.avgRating) || 0 }));

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 print:px-0">
      <nav className="text-sm text-gray-500 mb-4 print:hidden">Startseite / Vergleich</nav>

      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-3xl font-bold">Vergleich</h1>
        <div className="flex gap-3 flex-wrap">
          {filteredListings.length > 0 && (
            <button
              onClick={exportCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >Exportieren als CSV</button>
          )}
          <button
            onClick={printPage}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm flex items-center gap-2"
          >
            <FaPrint /> Drucken
          </button>
          <button
            onClick={copySummary}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Zusammenfassung kopieren
          </button>
          <button
            onClick={emailSummary}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm flex items-center gap-2"
          >
            <FaEnvelope /> Per E-Mail senden
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 print:hidden flex items-center gap-2">
        <FaCheckCircle className="text-blue-500" />
        {filteredListings.length} Einträge im Vergleich angezeigt
        {copiedText && <span className="text-green-600 ml-2">{copiedText}</span>}
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <input
          type="text"
          placeholder="Filter nach Stadt"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Max Preis (€)"
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Min. Bewertung (z.B. 4.0)"
          step="0.1"
          value={minRatingFilter}
          onChange={(e) => setMinRatingFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={resetFilters}
          className="p-2 bg-gray-200 border rounded hover:bg-gray-300 text-sm"
        >Filter zurücksetzen</button>
      </div>

      {/* pjesa tjetër e faqes (tabela/grafiku) ruhet siç është, do fshihet në print sipas klasës print:hidden */}
    </div>
  );
};

export default ComparePage;
