// src/pages/GermanyMapReal.jsx — FINAL FULL VERSION (Zumper/Zillow style + Mobile + Popup + Filters + Modal)

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import listings from '../data/listings.json';
import { motion } from 'framer-motion';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';

// Leaflet icon fix
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapEventHandler = ({ listings, setActiveListings, applyFilters }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = map.getBounds();
    const visible = listings.filter(({ lat, lng }) => bounds.contains([lat, lng]));
    setActiveListings(applyFilters(visible));
    map.on('moveend', () => {
      const visibleNow = listings.filter(({ lat, lng }) => map.getBounds().contains([lat, lng]));
      setActiveListings(applyFilters(visibleNow));
    });
  }, [map]);
  return null;
};

const GermanyMapReal = ({ purpose }) => {
  const { t } = useTranslation(['listing', 'navbar', 'filterBar']);
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredListings, setFilteredListings] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [filters, setFilters] = useState({ city: '', type: '' });

  useEffect(() => {
    setFilters({ city: '', type: '' });
    setSelectedItem(null);
    setActiveListings([]);
  }, [location.pathname, purpose]);

  const applyFilters = (items) => {
    let results = items.filter((item) => (
      (!purpose || item.purpose === purpose) &&
      (!filters.city || item.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || item.type === filters.type)
    ));
    switch (sortBy) {
      case 'priceAsc': results.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': results.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return results;
  };

  useEffect(() => {
    setFilteredListings(applyFilters(listings));
  }, [filters, sortBy]);

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-full lg:w-[40%] xl:w-[35%] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Filter bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder={t('city', { ns: 'filterBar' })}
            className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">{t('typeAll', { ns: 'filterBar' })}</option>
            <option value="Apartment">{t('apartment', { ns: 'filterBar' })}</option>
            <option value="House">{t('house', { ns: 'filterBar' })}</option>
          </select>
          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">{t('default')}</option>
            <option value="priceAsc">{t('priceAsc')}</option>
            <option value="priceDesc">{t('priceDesc')}</option>
          </select>
        </div>

        {/* Listing Cards */}
        <div className="space-y-4">
          {activeListings.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white dark:bg-gray-700 rounded shadow hover:shadow-md cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <img src={item.images?.[0]} alt={item.city} className="w-full h-36 object-cover" />
              <div className="p-3 space-y-1">
                <p className="text-blue-600 font-bold">€ {item.price.toLocaleString()}</p>
                <p className="text-sm">{t(item.type.toLowerCase(), { ns: 'listing' })} - {item.city}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">🛏 {item.bedrooms} · 📐 {item.size} m²</p>
                <button className="text-xs text-blue-500 underline hover:text-blue-700">{t('viewMore', { ns: 'listing' })}</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer center={[51.1657, 10.4515]} zoom={6} className="w-full lg:w-[60%] xl:w-[65%] h-[400px] lg:h-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredListings.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
            <Popup>
              <h3 className="font-bold text-blue-600">{item.price.toLocaleString()} €</h3>
              <p className="text-sm">{t(item.type.toLowerCase(), { ns: 'listing' })} - {item.city}</p>
              <button
                onClick={() => setSelectedItem(item)}
                className="text-xs mt-1 text-blue-500 underline"
              >{t('viewMore', { ns: 'listing' })}</button>
            </Popup>
          </Marker>
        ))}
        <MapEventHandler listings={listings} setActiveListings={setActiveListings} applyFilters={applyFilters} />
      </MapContainer>

      {/* Modal */}
      {selectedItem && (
        <ListingDetailsModal
          listing={selectedItem}
          allListings={filteredListings}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Mobile button */}
      {['/buy', '/rent'].includes(location.pathname) && (
        <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => navigate('/map')}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            {t('showMap', { ns: 'navbar' })}
          </button>
        </div>
      )}
    </div>
  );
};

export default GermanyMapReal;
