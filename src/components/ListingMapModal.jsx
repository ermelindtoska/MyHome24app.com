// src/components/ListingMapModal.jsx
import React from 'react';
import GoogleMapReact from 'google-map-react';

const Marker = () => <div className="text-red-600 text-xl">📍</div>;

const ListingMapModal = ({ lat, lng, onClose }) => {
  const defaultProps = {
    center: {
      lat: lat,
      lng: lng
    },
    zoom: 14
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-600 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-2">Listing Location</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_API_KEY' }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
          >
            <Marker lat={lat} lng={lng} />
          </GoogleMapReact>
        </div>
      </div>
    </div>
  );
};

export default ListingMapModal;
