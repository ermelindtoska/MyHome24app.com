// GermanyMapLeaflet.jsx – Hartë interaktive me Leaflet + OSM autocomplete për lande, qytete, qarqe, rrugë dhe lagje
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const GermanyMapLeaflet = () => {
  const navigate = useNavigate();
  const markerRef = useRef(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=de&addressdetails=1&limit=5`);
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSuggestionClick = (item) => {
    const { lat, lon, display_name } = item;
    const slug = display_name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
    navigate(`/search?query=${encodeURIComponent(display_name)}&slug=${slug}`);
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        const displayName = data.display_name || 'Unknown location';
        const slug = displayName.toLowerCase()
          .replace(/ä/g, 'ae')
          .replace(/ö/g, 'oe')
          .replace(/ü/g, 'ue')
          .replace(/ß/g, 'ss')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');

        navigate(`/search?query=${encodeURIComponent(displayName)}&slug=${slug}`);

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng).bindPopup(displayName).openPopup();
        } else {
          markerRef.current = L.marker(e.latlng).addTo(map).bindPopup(displayName).openPopup();
        }
      }
    });
    return null;
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)]">
      <div className="absolute z-[999] top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <input
          type="text"
          placeholder="Search location..."
          className="w-full p-2 rounded shadow border border-gray-300"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchSuggestions(e.target.value);
          }}
        />
        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded shadow mt-1 z-50">
            {suggestions.map((sug, idx) => (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(sug)}
              >
                {sug.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapContainer
        center={[51.1657, 10.4515]}
        zoom={6}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker />
        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  );
};

export default GermanyMapLeaflet;
