// src/pages/MapPage.jsx — FULLSCREEN MOBILE VIEW + MODERN POPUP STYLE + MOBILE ENTRY BUTTON FROM /buy & /rent

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import listings from '../data/listings.json';
import { motion } from 'framer-motion';

// Configure leaflet default icon
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

const MapPage = () => {
  const { t } = useTranslation(['listing', 'navbar']);
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredListings, setFilteredListings] = useState([]);

  useEffect(() => {
    setFilteredListings(listings);
  }, []);

  return (
    <div className="h-screen w-screen relative bg-white dark:bg-gray-900">
      {/* Butoni Back to Search */}
      <div className="absolute top-4 left-4 z-[999]">
        <button
          onClick={() => navigate(-1)}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ← {t('backToSearch', { ns: 'navbar' })}
        </button>
      </div>

      {/* Harta */}
      <MapContainer
        className="w-full h-full z-0"
        center={[51.1657, 10.4515]}
        zoom={6}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredListings.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
            <Popup>
              <motion.div
                className="text-sm leading-snug w-52"
                initial={{ opacity: 0.3, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={item.images?.[0] || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-24 object-cover rounded mb-1"
                />
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  {t('listingTitle', {
                    ns: 'listing',
                    type: t(item.type.toLowerCase(), { ns: 'listing' }),
                    city: item.city,
                    id: item.id.replace('property-', '')
                  })}
                </h3>
                <p className="text-blue-700 font-bold mt-1">€ {item.price.toLocaleString()}</p>
                <button
                  onClick={() => navigate(`/listing/${item.id}`)}
                  className="mt-2 w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition"
                >
                  {t('viewMore', { ns: 'listing' })}
                </button>
              </motion.div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Butoni Show Map për Mobile (nëse duam të përfshijmë në buy/rent faqet në të ardhmen) */}
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

export default MapPage;
