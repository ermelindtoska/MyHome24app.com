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
  FaHeartBroken,
  FaSync,
  FaMoon,
  FaTrash
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import {
  filterListings,
  formatPrice,
  getPriceColor,
  createCSVBlob,
  createChartData
} from '../utils/compareUtils';

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
  const [minSizeFilter, setMinSizeFilter] = useState('');
  const [maxSizeFilter, setMaxSizeFilter] = useState('');
  const [copiedText, setCopiedText] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('compareListings', JSON.stringify(listings));
  }, [listings]);

  const resetFilters = () => {
    setCityFilter('');
    setMaxPriceFilter('');
    setMinRatingFilter('');
    setMinSizeFilter('');
    setMaxSizeFilter('');
  };

  const refreshData = () => {
    const reloaded = localStorage.getItem('compareListings');
    if (reloaded) setListings(JSON.parse(reloaded));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const clearAllListings = () => {
    setListings([]);
    localStorage.removeItem('compareListings');
  };

  const filteredListings = listings.filter((item) => {
    const matchesCity = cityFilter ? item.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
    const matchesPrice = maxPriceFilter ? item.price <= parseFloat(maxPriceFilter) : true;
    const matchesRating = minRatingFilter ? (parseFloat(item.avgRating) || 0) >= parseFloat(minRatingFilter) : true;
    const matchesMinSize = minSizeFilter ? item.size >= parseFloat(minSizeFilter) : true;
    const matchesMaxSize = maxSizeFilter ? item.size <= parseFloat(maxSizeFilter) : true;
    return matchesCity && matchesPrice && matchesRating && matchesMinSize && matchesMaxSize;
  });

  const removeListing = (index) => {
    const updated = [...listings];
    updated.splice(index, 1);
    setListings(updated);
  };

  const exportCSV = () => {
    const headers = ['Titel', 'Ort', 'Preis', 'Bewertung', 'Fläche'];
    const rows = filteredListings.map((item) => [item.title, item.city, item.price, item.avgRating || '-', item.size || '-']);
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
    const tableData = filteredListings.map((item) => [item.title, item.city, formatPrice(item.price), item.avgRating || '-', item.size || '-']);
    doc.autoTable({
      head: [[t('addListing.fields.title'), t('addListing.fields.city'), t('addListing.fields.price'), t('favorites.avgRating'), t('addListing.fields.size')]],
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
      .map((item) => `${item.title} (${item.city}) – ${formatPrice(item.price)}${item.avgRating ? `, ${t('favorites.avgRating')}: ${item.avgRating}` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedText(t('compare.copied'));
    setTimeout(() => setCopiedText(null), 2000);
  };

  const emailSummary = () => {
    const body = filteredListings
      .map((item) => `${item.title} (${item.city}) – ${formatPrice(item.price)}${item.avgRating ? `, ${t('favorites.avgRating')}: ${item.avgRating}` : ''}`)
      .join('%0A');
    const mailto = `mailto:?subject=${t('compare.emailSubject')}&body=${body}`;
    window.location.href = mailto;
  };

  const chartData = filteredListings.map(item => ({
    name: item.title,
    Preis: item.price,
    Bewertung: parseFloat(item.avgRating) || 0,
    Fläche: item.size || 0
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} min-h-screen py-12 px-4 print:px-0`}>
      <nav className="text-sm text-gray-500 mb-4 print:hidden flex items-center gap-2">
        <img src={logo} alt="MyHome24App Logo" className="h-6" /> {t('breadcrumbs.home')} / {t('compare.title')}
      </nav>

      <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-md print:hidden mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input type="text" placeholder={t('filter.city')} className="border px-3 py-2 rounded w-40" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
          <input type="number" placeholder={t('filter.maxPrice')} className="border px-3 py-2 rounded w-40" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} />
          <input type="number" placeholder={t('compare.minRating')} className="border px-3 py-2 rounded w-40" value={minRatingFilter} onChange={(e) => setMinRatingFilter(e.target.value)} />
          <input type="number" placeholder={t('compare.minSize')} className="border px-3 py-2 rounded w-40" value={minSizeFilter} onChange={(e) => setMinSizeFilter(e.target.value)} />
          <input type="number" placeholder={t('compare.maxSize')} className="border px-3 py-2 rounded w-40" value={maxSizeFilter} onChange={(e) => setMaxSizeFilter(e.target.value)} />
          <button className="text-blue-600 underline" onClick={resetFilters}>{t('compare.resetFilters')}</button>
          <button onClick={refreshData} className="text-blue-600 underline flex items-center gap-1"><FaSync /> {t('compare.refresh')}</button>
          <button onClick={toggleDarkMode} className="text-yellow-600 underline flex items-center gap-1"><FaMoon /> {darkMode ? 'Light Mode' : 'Dark Mode'}</button>
          <button onClick={clearAllListings} className="text-red-600 underline flex items-center gap-1"><FaTrash /> {t('compare.clearAll')}</button>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <p className="text-center text-gray-500">{t('compare.noData')}</p>
      ) : (
        <>
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

            <h3 className="text-lg font-semibold mt-10 mb-4">{t('compare.lineChart')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Fläche" stroke="#8884d8" />
                <Line type="monotone" dataKey="Preis" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>

            <h3 className="text-lg font-semibold mt-10 mb-4">{t('compare.pieChart')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="Fläche" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;
