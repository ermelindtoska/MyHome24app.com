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
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minSize: '',
    maxSize: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(activeListings.length / itemsPerPage);
  const paginatedListings = activeListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

useEffect(() => {
  setFilters({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minSize: '',
    maxSize: '',
  });
  setSelectedListing(null);
  setSelectedItem(null);
  setActiveListings([]); // opsionale për clean up
}, [pathname, purpose]);

  const applyFilters = (items) => {
    let results = items.filter((item) => (
      (!purpose || item.purpose === purpose) &&
      (!filters.city || item.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || item.type === filters.type) &&
      (!filters.minPrice || item.price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || item.price <= parseInt(filters.maxPrice)) &&
      (!filters.minBedrooms || (item.bedrooms ?? 0) >= parseInt(filters.minBedrooms)) &&
      (!filters.maxBedrooms || (item.bedrooms ?? 0) <= parseInt(filters.maxBedrooms)) &&
      (!filters.minSize || (item.size ?? 0) >= parseInt(filters.minSize)) &&
      (!filters.maxSize || (item.size ?? 0) <= parseInt(filters.maxSize))
    ));



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
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-full lg:w-1/3 sticky top-20 max-h-[90vh] overflow-y-auto p-4 border-r border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="mb-4 space-y-2">
          <h2 className="text-xl font-bold">{t('title', { ns: 'filterBar' })}</h2>
          <input
            type="text"
            list="cities"
            placeholder={t('city', { ns: 'filterBar' })}
            className="border p-1 w-full bg-white dark:bg-gray-700 dark:text-gray-100"
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <datalist id="cities">
            {[...new Set(listings.map((item) => item.city))].sort().map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <select
            className="border p-1 w-full bg-white dark:bg-gray-700 dark:text-gray-100"
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">{t('typeAll', { ns: 'filterBar' })}</option>
            <option value="Apartment">{t('apartment', { ns: 'filterBar' })}</option>
            <option value="House">{t('house', { ns: 'filterBar' })}</option>
          </select>
          <select
            className="border p-1 w-full bg-white dark:bg-gray-700 dark:text-gray-100"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">{t('default')}</option>
            <option value="priceAsc">{t('priceAsc')}</option>
            <option value="priceDesc">{t('priceDesc')}</option>
            <option value="sizeDesc">{t('sizeDesc')}</option>
            <option value="bedroomsDesc">{t('bedroomsDesc')}</option>
            <option value="cityAsc">{t('cityAsc')}</option>
          </select>
          {['minBedrooms', 'maxBedrooms', 'minSize', 'maxSize'].map((field) => (
            <input
              key={field}
              type="number"
              placeholder={t(field, { ns: 'filterBar' })}
              className="border p-1 w-full bg-white dark:bg-gray-700 dark:text-gray-100"
              onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
            />
          ))}
        </div>

        {/* Listings */}
        <div>
          {paginatedListings.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">{t('noResults')}</p>
          ) : (
            <>
              {paginatedListings.map((item) => (
                <motion.div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 mb-3 shadow hover:shadow-lg cursor-pointer overflow-hidden"
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <img
                      src={item.images?.[0]}
                      alt={`${t(item.type.toLowerCase(), { ns: 'listing' })} ${t('in', { ns: 'listing' })} ${t(`cityNames.${item.city}`, { defaultValue: item.city })}`}
                      className="w-full h-40 object-cover"
                    />
                    {item.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs rounded">
                        {t('featured', { ns: 'listing' })}
                      </span>
                    )}
                    {item.isLuxury && (
                      <span className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-0.5 text-xs rounded">
                        {t('luxury', { ns: 'listing' })}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-lg font-semibold text-blue-700 mb-1">€ {item.price.toLocaleString()}</p>
                    <p className="text-sm mb-1">{t(item.type.toLowerCase(), { ns: 'listing' })} {t('in', { ns: 'listing' })} {item.city}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📍 {item.city}, {item.postalCode}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">🛏 {item.bedrooms} · 📐 {item.size} m²</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="mt-2 w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition"
                    >
                      {t('viewMore', { ns: 'listing' })}
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {t('previous')}
                  </button>
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('pageInfo', { current: currentPage, total: totalPages })}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        className="w-full h-[400px] sm:h-[50vh] lg:h-full z-0"
        center={[51.1657, 10.4515]}
        zoom={6}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredListings.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
            <Popup>
              <div className="text-sm leading-snug">
                <h3 className="font-semibold text-lg mb-1">{t('listingTitle', { ns: 'listing', type: t(item.type.toLowerCase(), { ns: 'listing' }), city: item.city, id: item.id.replace('property-', '') })}</h3>
                <p className="text-blue-700 font-bold mt-1">{item.price.toLocaleString()} €</p>
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
