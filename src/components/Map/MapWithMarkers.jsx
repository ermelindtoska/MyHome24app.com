// src/components/Map/MapWithMarkers.jsx
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslation } from 'react-i18next';
import MapFilters from './MapFilters';
import PropTypes from 'prop-types';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const FALLBACK_IMG = '/images/hero-1.jpg';

const MapWithMarkers = ({ listings = [], selectedId, onListingSelect, onVisibleChange }) => {
  const { t } = useTranslation(['listing', 'filterBar']);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); // [{id, marker, el}]
  const [filters, setFilters] = useState({ city: '', type: '', priceMin: '', priceMax: '' });
  const [sortBy, setSortBy] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // init
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10.4515, 51.1657],
      zoom: 5.5,
    });

    mapRef.current = map;

    const reportVisible = () => {
      if (!onVisibleChange) return;
      const b = map.getBounds();
      const visible = listings.filter((it) => (
        typeof it.longitude === 'number' &&
        typeof it.latitude === 'number' &&
        it.longitude >= b.getWest() && it.longitude <= b.getEast() &&
        it.latitude  >= b.getSouth() && it.latitude  <= b.getNorth()
      ));
      onVisibleChange(visible);
    };

    map.on('load', reportVisible);
    map.on('moveend', reportVisible);

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove old
    markersRef.current.forEach(m => m.marker.remove());
    markersRef.current = [];

    // filter/sort
    let filtered = listings.filter((item) => {
      if (filters.city && !(item.city || '').toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.priceMin && (item.price ?? 0) < Number(filters.priceMin)) return false;
      if (filters.priceMax && (item.price ?? 0) > Number(filters.priceMax)) return false;
      return typeof item.latitude === 'number' && typeof item.longitude === 'number';
    });

    if (sortBy === 'priceAsc') filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'priceDesc') filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

    // add
    filtered.forEach((listing) => {
      const el = document.createElement('div');
      el.className = 'mh24-marker';
      el.innerHTML = `
        <span>€${(listing.price ?? 0).toLocaleString()}</span>
        <span class="type">${listing.type || ''}</span>
      `;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onListingSelect?.(listing);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map);

      markersRef.current.push({ id: listing.id, marker, el });
    });

    // report visible pas filtrave
    if (onVisibleChange && map) {
      const b = map.getBounds();
      const visible = filtered.filter((it) =>
        it.longitude >= b.getWest() && it.longitude <= b.getEast() &&
        it.latitude  >= b.getSouth() && it.latitude  <= b.getNorth()
      );
      onVisibleChange(visible);
    }
  }, [listings, filters, sortBy, onListingSelect, onVisibleChange]);

  // highlight kur ndryshon selectedId
  useEffect(() => {
    markersRef.current.forEach(({ id, el }) => {
      if (String(id) === String(selectedId)) el.classList.add('active');
      else el.classList.remove('active');
    });
  }, [selectedId]);

  // suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=de&addressdetails=1&limit=5`);
      setSuggestions(await res.json());
    } catch (e) { /* noop */ }
  };

  const handleSuggestionClick = (item) => {
    setSearch(item.display_name);
    setSuggestions([]);
    const map = mapRef.current;
    if (map) map.flyTo({ center: [parseFloat(item.lon), parseFloat(item.lat)], zoom: 12 });
  };

  return (
    <div className="w-full h-full relative">
      {/* Search + Filters */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-2xl">
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={t('searchLocation', { ns: 'filterBar' })}
            value={search}
            onChange={(e) => { setSearch(e.target.value); fetchSuggestions(e.target.value); }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm shadow-sm"
          />
          {suggestions.length > 0 && (
            <ul className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50 max-h-60 overflow-auto">
              {suggestions.map((it, idx) => (
                <li key={idx} onClick={() => handleSuggestionClick(it)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                  {it.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapFilters
          filters={filters}
          sortBy={sortBy}
          onFilterChange={setFilters}
          onSortChange={setSortBy}
        />
      </div>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

MapWithMarkers.propTypes = {
  listings: PropTypes.array,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onListingSelect: PropTypes.func,
  onVisibleChange: PropTypes.func,
};

export default MapWithMarkers;
