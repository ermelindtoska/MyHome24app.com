import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../style/MapPage.css';

import ListingSidebar from '../components/ListingSidebar';
import ListingDetailsModal from '../components/ListingDetailsModal';

// ✅ Përdor token nga .env
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapPage = ({ filteredListings = [] }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [visibleListings, setVisibleListings] = useState(filteredListings);

  // ✅ Inicializimi i hartës
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10.4515, 51.1657], // Qendra e Gjermanisë
      zoom: 5.5,
    });

    mapRef.current = map;

    map.on('moveend', () => {
      const bounds = map.getBounds();
      const visible = filteredListings.filter(item => (
        item.longitude >= bounds.getWest() &&
        item.longitude <= bounds.getEast() &&
        item.latitude >= bounds.getSouth() &&
        item.latitude <= bounds.getNorth()
      ));
      setVisibleListings(visible);
    });

    return () => map.remove();
  }, []);

  // ✅ Shto markerë kur ndryshojnë filteredListings
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Hiq markerët ekzistues
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    filteredListings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return;

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = "url('/map-marker.png')";
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-weight: bold;">${listing.title}</div>
        <img src="${listing.image || '/assets/new-listing.png'}" style="width:100%; height:80px; object-fit:cover;" />
        <div style="color:#1e40af; font-weight:600; margin-top:4px;">€${listing.price}</div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedListing(listing);
      });

      markersRef.current.push(marker);
    });
  }, [filteredListings]);

  // Auto scroll to top on listings change
  useEffect(() => {
    document.getElementById("listingSidebarContainer")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [visibleListings]);

  return (
    <div className="flex flex-row w-full h-[calc(100vh-80px)]">
      <div
        id="listingSidebarContainer"
        className="w-[40%] overflow-y-auto bg-gray-100 dark:bg-gray-900"
      >
        <ListingSidebar listings={visibleListings} onClickItem={setSelectedListing} />
      </div>
      <div className="w-[60%]" ref={mapContainerRef} />

      {selectedListing && (
        <ListingDetailsModal
          isOpen={!!selectedListing}
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
};

export default MapPage;
