// src/pages/ComparePage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  FaMapMarkerAlt,
  FaEuroSign,
  FaStar,
  FaHome,
  FaPrint,
  FaCheckCircle,
  FaEnvelope,
  FaSave,
  FaFilePdf,
  FaHeartBroken
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';

const ComparePage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [listings, setListings] = useState(() => {
    const stored = localStorage.getItem('compareListings');
    return stored ? JSON.parse(stored) : location.state?.listings || [];
  });
  const [cityFilter, setCityFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  useEffect(() => {
    localStorage.setItem('compareListings', JSON.stringify(listings));
  }, [listings]);

  const resetFilters = () => {
    setCityFilter('');
    setMaxPriceFilter('');
    setMinRatingFilter('');
  };

  const filteredListings = listings.filter((item) => {
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

  const formatPrice = (price) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);

  const getPriceColor = (price) =>
    price < 100000 ? 'text-green-600' : price < 300000 ? 'text-yellow-600' : 'text-red-600';

  const exportCSV = () => {
    const headers = ['Titel', 'Ort', 'Preis (€)', 'Ø Bewertung'];
    const rows = filteredListings.map((item) => [item.title, item.city, item.price, item.avgRating || '-']);
    const csvContent = [headers, ...rows].map((e) => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vergleich.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(t('compare.title'), 14, 22);
    const tableData = filteredListings.map((item) => [item.title, item.city, formatPrice(item.price), item.avgRating || '-']);
    doc.autoTable({
      head: [[t('addListing.fields.title'), t('addListing.fields.city'), t('addListing.fields.price'), t('favorites.avgRating')]],
      body: tableData,
      startY: 30,
    });
    doc.save('vergleich.pdf');
  };

  const printPage = () => {
    window.print();
  };

  const copySummary = () => {
    const summary = filteredListings
      .map(
        (item) => `${item.title} (${item.city}) – ${formatPrice(item.price)}${item.avgRating ? `, ${t('favorites.avgRating')}: ${item.avgRating}` : ''}`
      )
      .join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedText(t('compare.copied'));
    setTimeout(() => setCopiedText(null), 2000);
  };

  const emailSummary = () => {
    const body = filteredListings
      .map(
        (item) => `${item.title} (${item.city}) – ${formatPrice(item.price)}${item.avgRating ? `, ${t('favorites.avgRating')}: ${item.avgRating}` : ''}`
      )
      .join('%0A');
    const mailto = `mailto:?subject=${t('compare.emailSubject')}&body=${body}`;
    window.location.href = mailto;
  };

  const chartData = filteredListings.map((item) => ({
    name: item.title,
    Preis: item.price,
    Bewertung: parseFloat(item.avgRating) || 0,
  }));

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 print:px-0">
      <nav className="text-sm text-gray-500 mb-4 print:hidden flex items-center gap-2">
        <img src={logo} alt="MyHome24App Logo" className="h-6" /> {t('breadcrumbs.home')} / {t('compare.title')}
      </nav>

      <div className="bg-white p-6 shadow rounded-md print:hidden mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input type="text" placeholder={t('filter.city')} className="border px-3 py-2 rounded w-40" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
          <input type="number" placeholder={t('filter.maxPrice')} className="border px-3 py-2 rounded w-40" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} />
          <input type="number" placeholder={t('compare.minRating')} className="border px-3 py-2 rounded w-40" value={minRatingFilter} onChange={(e) => setMinRatingFilter(e.target.value)} />
          <button className="text-blue-600 underline" onClick={resetFilters}>{t('compare.resetFilters')}</button>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <p className="text-center text-gray-500">{t('compare.noData')}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredListings.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-xl relative border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                <button onClick={() => removeListing(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><FaHeartBroken /></button>
                <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2 text-blue-800"><FaHome /> {item.title}</h3>
                <p className="text-gray-700 flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /> {item.city}</p>
                <p className={`text-lg font-bold mt-3 ${getPriceColor(item.price)}`}><FaEuroSign className="inline mr-1" /> {formatPrice(item.price)}</p>
                <p className="flex items-center gap-2 mt-2 text-yellow-600"><FaStar /> {item.avgRating || t('compare.noRating')}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 shadow rounded mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('compare.chartTitle')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="Preis" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="Bewertung" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-4 justify-center print:hidden">
            <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"><FaSave /> CSV</button>
            <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"><FaFilePdf /> PDF</button>
            <button onClick={printPage} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"><FaPrint /> {t('compare.print')}</button>
            <button onClick={copySummary} className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700"><FaCheckCircle /> {copiedText || t('compare.copy')}</button>
            <button onClick={emailSummary} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"><FaEnvelope /> {t('compare.email')}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;
