// src/components/MapComponent.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ lat, lng }) => {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow mt-8">
      <iframe
        title="map"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.google.com/maps?q=${lat},${lng}&hl=de&z=14&output=embed`}
        allowFullScreen
      ></iframe>
      <div className="bg-white text-gray-800 p-2 text-sm font-medium text-center">{address}</div>
    </div>
  );
};

export default MapComponent;