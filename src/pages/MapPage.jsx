// src/pages/MapPage.jsx — FINAL ZUMPER/ZILLOW SPLIT LAYOUT + FULLSCREEN MOBILE + POPUP + BACK BUTTON + LISTINGS COLUMN

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
import ListingCard from '../components/ListingCard';

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
  const [filteredListings, setFilteredListings] = useState([]);

  useEffect(() => {
    setFilteredListings(listings);
  }, []);

  return (
    <div className="h-screen w-screen md:grid md:grid-cols-2 bg-white dark:bg-gray-900">
      {/* Split Left Side – Real Listings */}
      <div className="hidden md:flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-y-auto h-screen p-4 space-y-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {filteredListings.length} {t('listingsFound', { ns: 'listing' })}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
          >
            ← {t('backToSearch', { ns: 'navbar' })}
          </button>
        </div>

        {filteredListings.map((listing) => (
          <div key={listing.id} className="px-2">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>

      {/* Right Side: Full Map */}
      <div className="relative w-full h-screen md:h-full">
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

        {/* Back button for mobile */}
        <div className="md:hidden absolute top-4 left-4 z-[999]">
          <button
            onClick={() => navigate(-1)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ← {t('backToSearch', { ns: 'navbar' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
