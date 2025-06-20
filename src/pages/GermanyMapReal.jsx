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

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const GermanyMapReal = ({ purpose }) => {
  const { t } = useTranslation(['listing', 'filterBar']);
  const location = useLocation();
  const pathname = location.pathname;

  const [selectedListing, setSelectedListing] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({ city: '', type: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    setFilters({ city: '', type: '', minPrice: '', maxPrice: '' });
    setSelectedListing(null);
    setSelectedItem(null);
  }, [pathname]);

  const applyFilters = (items) => {
    return items.filter(item => {
      return (
        (!purpose || item.purpose === purpose) &&
        (!filters.city || item.city.toLowerCase().includes(filters.city.toLowerCase())) &&
        (!filters.type || item.type === filters.type) &&
        (!filters.minPrice || item.price >= parseInt(filters.minPrice)) &&
        (!filters.maxPrice || item.price <= parseInt(filters.maxPrice))
      );
    });
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
      
      {/* Filter Panel */}
      <div className="w-full lg:w-1/3 overflow-y-auto max-h-[400px] sm:max-h-none bg-white p-4 shadow-md">
        <h2 className="text-xl font-bold mb-2">{t('title', { ns: 'filterBar' })}</h2>
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

        <input
          type="number"
          placeholder={t('minPrice', { ns: 'filterBar' })}
          className="border p-1 mb-1 w-full"
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          type="number"
          placeholder={t('maxPrice', { ns: 'filterBar' })}
          className="border p-1 mb-2 w-full"
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />

        <h2 className="text-xl font-bold mb-4">{t('visibleOnMap', { ns: 'listing' })}</h2>
        {activeListings.length === 0 ? (
          <p className="text-gray-500">{t('noResults', { ns: 'listing' })}</p>
        ) : (
          activeListings.map((item) => (
            <div
              key={item.id}
              className="border-b pb-2 mb-2 cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedItem(item)}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-600">{item.city}, {item.postalCode}</p>
              <p className="text-sm text-gray-400">€ {item.price.toLocaleString()}</p>
              <p className="text-xs text-gray-400">
                {item.type} · {item.bedrooms} {t('bedrooms', { ns: 'listing' })}
              </p>
              <p className="text-gray-600 mt-2">
                {t('resultsTitle', { ns: 'filterBar' })} ({filteredListings.length})
              </p>
            </div>
          ))
        )}
      </div>

      {/* Map Panel */}
      <MapContainer className="w-full h-[400px] sm:h-[50vh] lg:h-full z-0" center={[51.1657, 10.4515]} zoom={6}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {filteredListings.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{item.title}</strong><br />
                {item.city}, {item.postalCode}<br />
                <span>€ {item.price.toLocaleString()}</span><br />
                <button
                  className="mt-1 text-blue-600 underline"
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

      {/* Modal */}
      {selectedItem && (
        <ListingDetailsModal listing={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {selectedListing && (
        <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}
    </div>
  );
};

export default GermanyMapReal;
