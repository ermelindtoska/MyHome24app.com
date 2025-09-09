// src/pages/MapPage.jsx
import React, { useState, useEffect } from 'react';
import MapWithMarkers from '../components/Map/MapWithMarkers';
import ListingSidebar from '../components/ListingSidebar';
import ListingDetailsModal from '../components/ListingDetailsModal';
import SiteMeta from '../components/SEO/SiteMeta';
import { useTranslation } from 'react-i18next';

// Simulim i të dhënave — në realitet do të vijnë nga Firestore
const mockListings = [
  {
    id: 1,
    title: "Schöne Wohnung in Berlin",
    city: "Berlin",
    price: 1200,
    type: "Apartment",
    longitude: 13.405,
    latitude: 52.52,
    images: ["/images/apartment1.jpg"],
    bedrooms: 2,
    size: 80,
  },
  {
    id: 2,
    title: "Haus mit Garten in München",
    city: "München",
    price: 2500,
    type: "House",
    longitude: 11.576,
    latitude: 48.135,
    images: ["/images/house1.jpg"],
    bedrooms: 4,
    size: 150,
  },
  {
    id: 3,
    title: "Büro in Frankfurt",
    city: "Frankfurt",
    price: 1800,
    type: "Office",
    longitude: 8.682,
    latitude: 50.111,
    images: ["/images/office1.jpg"],
    bedrooms: 0,
    size: 100,
  },
];

const MapPage = () => {
  const { t } = useTranslation(['listing', 'navbar']);
  const [selectedListing, setSelectedListing] = useState(null);
  const [visibleListings, setVisibleListings] = useState(mockListings);

  // --- META ---
  const count = visibleListings.length;
  const metaTitle = `${t('map.title')}`;
  const metaDesc = t('map.description', { count });

  // Update visible listings when map moves
  useEffect(() => {
    const map = document.getElementById('mapContainer');
    if (!map) return;

    const bounds = map.getBoundingClientRect();
    const visible = mockListings.filter((item) => {
      if (!item.longitude || !item.latitude) return false;
      return (
        item.longitude >= bounds.left &&
        item.longitude <= bounds.right &&
        item.latitude >= bounds.top &&
        item.latitude <= bounds.bottom
      );
    });
    setVisibleListings(visible);
  }, []);

  return (
    <div className="flex flex-row w-full h-[calc(100vh-80px)]">
      {/* SEO */}
      <SiteMeta
        title={metaTitle}
        description={metaDesc}
        canonical={`${window.location.origin}/map`}
        ogImage="/icons/icon-512.png"
      />

      {/* Left sidebar */}
      <div className="w-[40%] overflow-y-auto bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <ListingSidebar listings={visibleListings} onClickItem={setSelectedListing} />
      </div>

      {/* Map */}
      <div className="w-[60%]">
        <MapWithMarkers
          listings={mockListings}
          onListingSelect={setSelectedListing}
          visibleListings={visibleListings}
        />
      </div>

      {/* Modal */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          allListings={mockListings}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
};

export default MapPage;