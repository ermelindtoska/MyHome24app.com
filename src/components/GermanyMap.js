import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default marker workaround për React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const cityCoordinates = {
  Berlin: [52.52, 13.405],
  Hamburg: [53.5511, 9.9937],
  München: [48.1351, 11.582]
};

export default function GermanyMap({ listingsEnabled = false }) {
  let listings = [];
  if (listingsEnabled) {
    const saved = localStorage.getItem("listings");
    listings = saved ? JSON.parse(saved) : [];
  }

  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: "400px", width: "100%", marginBottom: "30px" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((item, idx) => {
        const coords = cityCoordinates[item.location];
        return coords ? (
          <Marker key={idx} position={coords}>
            <Popup>
              <b>{item.title}</b><br />
              {item.price} €<br />
              {item.location}
            </Popup>
          </Marker>
        ) : null;
      })}
    </MapContainer>
  );
}
