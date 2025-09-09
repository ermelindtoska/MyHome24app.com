// src/components/Map/MapWithMarkers.jsx
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslation } from 'react-i18next';
import MapFilters from './MapFilters';
import { motion } from 'framer-motion';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapWithMarkers = ({ listings = [], onListingSelect }) => {
  const { t } = useTranslation(['listing', 'filterBar']);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [filters, setFilters] = useState({ city: '', type: '', priceMin: '', priceMax: '' });
  const [sortBy, setSortBy] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10.4515, 51.1657],
      zoom: 5.5,
    });

    mapRef.current = map;

    map.on('moveend', () => {
      const bounds = map.getBounds();
      const visible = listings.filter((item) => {
        if (!item.longitude || !item.latitude) return false;
        return (
          item.longitude >= bounds.getWest() &&
          item.longitude <= bounds.getEast() &&
          item.latitude >= bounds.getSouth() &&
          item.latitude <= bounds.getNorth()
        );
      });
    });

    return () => map.remove();
  }, []);

  // Update markers when listings or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter and sort listings
    let filtered = listings.filter((item) => {
      if (filters.city && !item.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.priceMin && item.price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && item.price > parseFloat(filters.priceMax)) return false;
      return true;
    });

    if (sortBy === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') filtered.sort((a, b) => b.price - a.price);

    // Add markers
    filtered.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;

      const el = document.createElement('div');
      el.className = 'zillow-marker cursor-pointer';
      el.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-center min-w-24 border border-gray-200 dark:border-gray-700">
          <div class="text-xs font-bold text-gray-800 dark:text-white">€${listing.price.toLocaleString()}</div>
          <div class="text-xs text-gray-600 dark:text-gray-300">${listing.type}</div>
        </div>
      `;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onListingSelect(listing);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [listings, filters, sortBy]);

  // Fetch location suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=de&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearch(item.display_name);
    setSuggestions([]);
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [item.lon, item.lat],
        zoom: 12,
      });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <div className="w-full h-full relative">
      {/* Search & Filters */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-2xl">
        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={t('searchLocation', { ns: 'filterBar' })}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm shadow-sm"
          />
          {suggestions.length > 0 && (
            <ul className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50 max-h-60 overflow-auto">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filters */}
        <MapFilters
          filters={filters}
          sortBy={sortBy}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapWithMarkers;