import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  // zbulim i thjeshtë i dark mode (Tailwind 'dark' class në <html>)
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setDarkMode(el.classList.contains('dark'));
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

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

  const mapRef = useRef(null);

  useEffect(() => {
    setFilters({ city: '', type: '' });
    setSelectedItem(null);
    setActiveListings([]);
  }, [location.pathname, purpose]);

  const applyFilters = (items) => {
    let results = items.filter((item) =>
      (!purpose || item.purpose === purpose) &&
      (!filters.city || (item.city || '').toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || item.type === filters.type)
    );
    switch (sortBy) {
      case 'priceAsc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return results;
  };

  useEffect(() => {
    const filtered = applyFilters(listings);
    setFilteredListings(filtered);
    setActiveListings(filtered);
  }, [filters, sortBy, purpose]);

  // auto-fit viewport sipas listimeve aktive
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeListings?.length) return;

    if (activeListings.length === 1) {
      const { lng, lat } = activeListings[0];
      if (typeof lng === 'number' && typeof lat === 'number') {
        map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
      }
      return;
    }

    // >1: llogarit bounds
    const valid = activeListings.filter(
      (x) => typeof x.lng === 'number' && typeof x.lat === 'number'
    );
    if (!valid.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    valid.forEach((x) => bounds.extend([x.lng, x.lat]));
    map.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 600 });
  }, [activeListings]);

  // helper për çmimin
  const formatPrice = (v) => {
    try {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return `€${(v ?? '').toString()}`;
    }
  };

  // përshpejto listimin vetëm me koord. të vlefshme
  const mapListings = useMemo(
    () =>
      filteredListings.filter(
        (x) => typeof x.lng === 'number' && typeof x.lat === 'number'
      ),
    [filteredListings]
  );

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
      <div className="w-full lg:w-[60%] xl:w-[65%] h-[400px] lg:h-full relative">
        {!MAPBOX_TOKEN && (
          <div className="absolute z-20 left-1/2 -translate-x-1/2 top-4 bg-red-600 text-white text-sm px-3 py-2 rounded shadow">
            Mungon REACT_APP_MAPBOX_TOKEN në .env.local
          </div>
        )}
        <Map
          ref={(instance) => {
            // react-map-gl v7: instance?.getMap() -> Mapbox GL JS map
            mapRef.current = instance?.getMap?.() || null;
          }}
          mapLib={mapboxgl}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12'}
          style={{ width: '100%', height: '100%' }}
        >
          {mapListings.map((item) => (
            <Marker key={item.id} longitude={item.lng} latitude={item.lat} anchor="bottom">
              {/* Marker i personalizuar me ikonë + badge çmimi */}
              <div
                onClick={() => setSelectedItem(item)}
                className="relative cursor-pointer"
                title={item.title || ''}
              >
                <div
                  className="w-11 h-11 bg-no-repeat bg-contain"
                  style={{ backgroundImage: "url('/map-marker.png')" }}
                />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow
                                text-white"
                     style={{ background: '#111' }}>
                  {formatPrice(item.price)}
                </div>
              </div>
            </Marker>
          ))}

          {selectedItem && (
            <Popup
              longitude={selectedItem.lng}
              latitude={selectedItem.lat}
              anchor="top"
              closeOnClick
              onClose={() => setSelectedItem(null)}
              maxWidth="300px"
            >
              <div className="w-[240px]">
                <div className="relative rounded-xl overflow-hidden border border-black/10">
                  <img
                    src={selectedItem.imageUrl || '/images/placeholder.jpg'}
                    alt=""
                    className="w-full h-[140px] object-cover"
                    loading="eager"
                  />
                  <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {formatPrice(selectedItem.price)}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-semibold text-sm line-clamp-2">
                    {selectedItem.title || ''}
                  </div>
                  <div className="text-xs opacity-70">
                    {t((selectedItem.type || '').toLowerCase(), { ns: 'listing', defaultValue: selectedItem.type })} · {selectedItem.city || ''}
                  </div>
                </div>
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
