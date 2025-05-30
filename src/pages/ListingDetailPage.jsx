// src/pages/ListingDetailPage.jsx
import React, { useState } from 'react';
import MapComponent from '../components/MapComponent';
import ContactOwnerModal from '../components/ContactOwnerModal';

const ListingDetailPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock listing data (in real use-case, fetch from Firestore or API)
  const listing = {
    id: '123',
    title: 'Schöne Wohnung im Zentrum',
    description: 'Diese Wohnung befindet sich im Herzen der Stadt und bietet modernen Komfort.',
    price: '1200€/Monat',
    location: {
      lat: 52.52,
      lng: 13.405,
      address: 'Alexanderplatz, Berlin',
    },
    images: ['/images/hero-1.jpg', '/images/hero-2.jpg'],
    ownerEmail: 'vermieter@example.com',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{listing.title}</h1>
      <p className="text-xl text-blue-600 font-semibold mb-2">{listing.price}</p>
      <p className="text-gray-700 mb-6">{listing.description}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {listing.images.map((src, idx) => (
          <img key={idx} src={src} alt={`img-${idx}`} className="rounded-xl w-full h-64 object-cover" />
        ))}
      </div>

      <MapComponent lat={listing.location.lat} lng={listing.location.lng} address={listing.location.address} />

      <div className="mt-10 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
        >
          Kontaktieren Sie den Vermieter
        </button>
      </div>

      <ContactOwnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ownerEmail={listing.ownerEmail}
      />
    </div>
  );
};

export default ListingDetailPage;