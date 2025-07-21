import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import listings from '../data/listings.json';
import ListingDetailsModal from '../components/ListingDetailsModal';
import PropertyCard from '../components/PropertyCard';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const GermanyMapReal = ({ purpose }) => {
  const { t } = useTranslation(['listing', 'navbar', 'filterBar']);
  const location = useLocation();
  const navigate = useNavigate();

  const [viewState, setViewState] = useState({
    latitude: 51.1657,
    longitude: 10.4515,
    zoom: 6,
  });

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
    const filtered = applyFilters(listings);
    setFilteredListings(filtered);
    setActiveListings(filtered);
  }, [filters, sortBy]);

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-full lg:w-[40%] xl:w-[35%] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
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
  <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer">
    <PropertyCard listing={item} />
  </div>
))}
        </div>
      </div>

      {/* Map */}
      <div className="w-full lg:w-[60%] xl:w-[65%] h-[400px] lg:h-full">
        <Map
          mapLib={mapboxgl}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
        >
          {filteredListings.map((item) => (
            <Marker key={item.id} longitude={item.lng} latitude={item.lat} anchor="bottom">
              <div
                onClick={() => setSelectedItem(item)}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow cursor-pointer"
              >
                €{item.price.toLocaleString()}
              </div>
            </Marker>
          ))}

          {selectedItem && (
            <Popup
              longitude={selectedItem.lng}
              latitude={selectedItem.lat}
              anchor="top"
              onClose={() => setSelectedItem(null)}
            >
              <div className="text-sm">
                <h3 className="font-bold text-blue-600">€ {selectedItem.price.toLocaleString()}</h3>
                <p>{t(selectedItem.type.toLowerCase(), { ns: 'listing' })} - {selectedItem.city}</p>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Modal */}
      {selectedItem && (
        <ListingDetailsModal
          listing={selectedItem}
          allListings={filteredListings}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Mobile Map Button */}
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
