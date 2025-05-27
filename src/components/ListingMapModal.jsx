// src/components/ListingMapModal.jsx
import React from 'react';
import GoogleMapReact from 'google-map-react';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Marker = () => <div className="text-red-500 text-xl">📍</div>;

const ListingMapModal = ({ listing, onClose }) => {
  const { t } = useTranslation();

  const defaultProps = {
    center: {
      lat: listing?.lat || 52.52,
      lng: listing?.lng || 13.405,
    },
    zoom: 11,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label={t('map.close')}
        >
          <FiX size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">{t('map.title')}</h2>
        <div className="h-96 w-full rounded overflow-hidden">
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_API_KEY' }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
          >
            <Marker lat={defaultProps.center.lat} lng={defaultProps.center.lng} />
          </GoogleMapReact>
        </div>
      </div>
    </div>
  );
};

export default ListingMapModal;
