import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import listings from '../data/listings.json';
import ListingDetailsModal from '../components/ListingDetailsModal';
import { motion } from 'framer-motion';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GermanyMapReal = ({ purpose }) => {
  const { t } = useTranslation(['listing', 'filterBar', 'map']);
  const location = useLocation();
  const pathname = location.pathname;
  const [sortBy, setSortBy] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({ city: '', type: '', minPrice: '', maxPrice: '',minBedrooms: '',maxBedrooms: '',minSize: '',maxSize: '', });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(activeListings.length / itemsPerPage);
  const paginatedListings = activeListings.slice((currentPage - 1) * itemsPerPage,currentPage * itemsPerPage);

const goToPreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1);};

const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1);};


  useEffect(() => {
    setFilters({ city: '', type: '', minPrice: '', maxPrice: '' });
    setSelectedListing(null);
    setSelectedItem(null);
  }, [pathname]);

const applyFilters = (items) => {
let results = items.filter((item) => {
  return (
    (!purpose || item.purpose === purpose) &&
    (!filters.city || item.city.toLowerCase().includes(filters.city.toLowerCase())) &&
    (!filters.type || item.type === filters.type) &&
    (!filters.minPrice || item.price >= parseInt(filters.minPrice)) &&
    (!filters.maxPrice || item.price <= parseInt(filters.maxPrice)) &&
    (!filters.minBedrooms || (item.bedrooms ?? 0) >= parseInt(filters.minBedrooms)) &&
    (!filters.maxBedrooms || (item.bedrooms ?? 0) <= parseInt(filters.maxBedrooms)) &&
    (!filters.minSize || (item.size ?? 0) >= parseInt(filters.minSize)) &&
    (!filters.maxSize || (item.size ?? 0) <= parseInt(filters.maxSize))
  );
});

  // Renditja
  switch (sortBy) {
    case 'priceAsc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'sizeDesc':
      results.sort((a, b) => (b.size || 0) - (a.size || 0));
      break;
    case 'bedroomsDesc':
      results.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
      break;
    case 'cityAsc':
      results.sort((a, b) => a.city.localeCompare(b.city));
      break;
    default:
      break;
  }

  return results;
};
  const filteredListings = applyFilters(listings);

  const MapEventHandler = () => {
    const map = useMap();
    useEffect(() => {
      const updateVisibleListings = () => {
        const bounds = map.getBounds();
        const visible = listings.filter(({ lat, lng }) => bounds.contains([lat, lng]));
        setActiveListings(applyFilters(visible));
      };
      updateVisibleListings();
      map.on('moveend', updateVisibleListings);
      return () => map.off('moveend', updateVisibleListings);
    }, [map, filters]);
    return null;
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row">
<div className="w-full lg:w-1/3 overflow-y-auto max-h-[400px] sm:max-h-none bg-white p-4 shadow-md mb-4 lg:mb-0 lg:mr-4">
  <h2 className="text-xl font-bold mb-2">{t('title', { ns: 'filterBar' })}</h2>

  {/* Filter Controls */}
  <input
    type="text"
    list="cities"
    placeholder={t('city', { ns: 'filterBar' })}
    className="border p-1 mb-1 w-full"
    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
  />
  <datalist id="cities">
    {[...new Set(listings.map(item => item.city))].sort().map(city => (
      <option key={city} value={city} />
    ))}
  </datalist>

  <select
    className="border p-1 mb-1 w-full"
    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
  >
    <option value="">{t('typeAll', { ns: 'filterBar' })}</option>
    <option value="Apartment">{t('apartment', { ns: 'filterBar' })}</option>
    <option value="House">{t('house', { ns: 'filterBar' })}</option>
  </select>
  <select
  className="border p-1 mb-4 w-full"
  onChange={(e) => setSortBy(e.target.value)}
>
  <option value="">{t('default')}</option>
  <option value="priceAsc">{t('priceAsc')}</option>
  <option value="priceDesc">{t('priceDesc')}</option>
  <option value="sizeDesc">{t('sizeDesc')}</option>
  <option value="bedroomsDesc">{t('bedroomsDesc')}</option>
  <option value="cityAsc">{t('cityAsc')}</option>
</select>

{/* Bedrooms Filter */}
<input
  type="number"
  placeholder={t('minBedrooms', { ns: 'filterBar', defaultValue: 'Min. Schlafzimmer' })}
  className="border p-1 mb-1 w-full"
  onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value })}
/>
<input
  type="number"
  placeholder={t('maxBedrooms', { ns: 'filterBar', defaultValue: 'Max. Schlafzimmer' })}
  className="border p-1 mb-1 w-full"
  onChange={(e) => setFilters({ ...filters, maxBedrooms: e.target.value })}
/>

{/* Size Filter */}
<input
  type="number"
  placeholder={t('minSize', { ns: 'filterBar', defaultValue: 'Min. Größe (m²)' })}
  className="border p-1 mb-1 w-full"
  onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
/>
<input
  type="number"
  placeholder={t('maxSize', { ns: 'filterBar', defaultValue: 'Max. Größe (m²)' })}
  className="border p-1 mb-2 w-full"
  onChange={(e) => setFilters({ ...filters, maxSize: e.target.value })}
/>

  {/* ✅ Rezultatet e Filtruara */}
  <h2 className="text-lg font-semibold px-1 py-2 text-gray-800">
    {t('resultsFound', { count: filteredListings.length })}
  </h2>

  {/* Listings List */}
{paginatedListings.length === 0 ? (
  <p className="text-center text-gray-500 p-4">{t('noResults')}</p>
) : (
  <>
{paginatedListings.map((item) => (
  <motion.div
    key={item.id}
    className="border-b pb-3 mb-3 cursor-pointer bg-white rounded shadow-sm p-2"
    onClick={() => setSelectedItem(item)}
    whileHover={{ scale: 1.01, boxShadow: '0px 4px 14px rgba(0,0,0,0.12)' }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: 'spring', stiffness: 200 }}
  >
    <p className="font-semibold text-blue-700 mb-1">
      {t(item.type.toLowerCase(), { ns: 'listing' })} {t('in', { ns: 'listing' })} {t(`cityNames.${item.city}`, { defaultValue: item.city })}
    </p>
    <p className="text-gray-800 mb-1">
      📍 {item.city}, {item.postalCode}
    </p>
    <p className="text-gray-600 mb-1">
      💶 {item.price.toLocaleString()} €
    </p>
    <p className="text-gray-600 mb-1">
      🛏 {item.bedrooms} · 📐 {item.size} m²
    </p>
    {item.features && item.features.length > 0 && (
      <p className="text-xs text-gray-500 mb-1">
        {t('features', { ns: 'listing' })}: {item.features.map((f) => t(`feature.${f}`, { defaultValue: f })).join(', ')}
      </p>
    )}
    {item.agent && (
      <p className="text-xs text-gray-500">
        👤 {t('contactAgent', { ns: 'listing' })}: {item.agent.name}
      </p>
    )}
    <button
      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
      className="mt-2 text-blue-600 underline text-sm"
    >
      {t('viewMore', { ns: 'listing' })}
    </button>
  </motion.div>
))}



    {/* 🔁 Pagination Controls */}
    {totalPages > 1 && (
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          {t('previous')}
        </button>
        <span className="text-gray-600">
          {t('pageInfo', { current: currentPage, total: totalPages })}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          {t('next')}
        </button>
      </div>
         )}
  </>
  )}
 
          
  
</div>

      {/* Map with Popup */}
      <MapContainer className="w-full h-[400px] sm:h-[50vh] lg:h-full z-0 rounded" center={[51.1657, 10.4515]} zoom={6}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {filteredListings.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
  <Popup>
  <div className="text-sm leading-snug">
    <h3 className="font-semibold text-lg mb-1">
      {t('listingTitle', {
        ns: 'listing',
        type: t(item.type.toLowerCase(), { ns: 'listing' }),
        city: t(`cityNames.${item.city}`, { ns: 'listing', defaultValue: item.city }),
        id: item.id.replace('property-', '') // heq 'property-' nga ID
      })}
    </h3>

    <p className="text-blue-700 font-bold mt-1">
      {item.price.toLocaleString()} €
    </p>

    <button
      className="mt-2 text-blue-600 underline text-sm"
      onClick={() => setSelectedItem(item)}
    >
      {t('viewMore', { ns: 'listing' })}
    </button>
  </div>
</Popup>




          </Marker>
        ))}
        <MapEventHandler />
      </MapContainer>

     {selectedItem && (
  <ListingDetailsModal
  listing={selectedItem}
  allListings={filteredListings}
  onClose={() => setSelectedItem(null)}
  />
)}
    </div>
  );
};

export default GermanyMapReal;
