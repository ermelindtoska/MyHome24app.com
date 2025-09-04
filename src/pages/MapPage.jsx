import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../style/MapPage.css';
import SiteMeta from "../components/SEO/SiteMeta";

import ListingSidebar from '../components/ListingSidebar';
import ListingDetailsModal from '../components/ListingDetailsModal';

// ✅ Përdor token nga .env
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const MapPage = ({ filteredListings = [], purpose = "all" }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [visibleListings, setVisibleListings] = useState(filteredListings);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [10.4515, 51.1657], // Germany
      zoom: 5.5,
    });

    mapRef.current = map;

    map.on("moveend", () => {
      const bounds = map.getBounds();
      const visible = filteredListings.filter(
        (item) =>
          item.longitude >= bounds.getWest() &&
          item.longitude <= bounds.getEast() &&
          item.latitude >= bounds.getSouth() &&
          item.latitude <= bounds.getNorth()
      );
      setVisibleListings(visible);
    });

 return () => map.remove();
// eslint-disable-next-line
}, []);


  // Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredListings.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.backgroundImage = "url('/map-marker.png')";
      el.style.width = "36px";
      el.style.height = "36px";
      el.style.backgroundSize = "contain";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-weight: bold;">${listing.title || ""}</div>
        <img src="${listing.image || "/assets/new-listing.png"}" style="width:100%; height:80px; object-fit:cover;" />
        <div style="color:#1e40af; font-weight:600; margin-top:4px;">€${listing.price || ""}</div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => setSelectedListing(listing));
      markersRef.current.push(marker);
    });
  }, [filteredListings]);

  // Scroll to top when list changes
  useEffect(() => {
    document
      .getElementById("listingSidebarContainer")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [visibleListings]);

  // --- META (titull & desc dinamik) ---
  const count = visibleListings?.length ?? filteredListings?.length ?? 0;
  const canonical = `${window.location.origin}${window.location.pathname}`;
  const purposeLabel =
    purpose === "buy" ? "Immobilien kaufen" : purpose === "rent" ? "Immobilien mieten" : "Immobilien auf der Karte";

  const metaTitle = count ? `${purposeLabel} – ${count} Anzeigen` : `${purposeLabel} – Karte`;
  const metaDesc =
    count > 0
      ? `Entdecke ${count} Immobilien-Angebote. Filtere nach Preis, Größe, Typ und mehr.`
      : `Finde Immobilien zum Kaufen oder Mieten in Deutschland. Filtere nach Preis, Größe, Typ und mehr.`;

  return (
    <div className="flex flex-row w-full h-[calc(100vh-80px)]">
      {/* SEO */}
      <SiteMeta
        title={metaTitle}
        description={metaDesc}
        canonical={canonical}
        ogImage="/icons/icon-512.png"
      />

      {/* Left list */}
      <div
        id="listingSidebarContainer"
        className="w-[40%] overflow-y-auto bg-gray-100 dark:bg-gray-900"
      >
        <ListingSidebar listings={visibleListings} onClickItem={setSelectedListing} />
      </div>

      {/* Map */}
      <div className="w-[60%]" ref={mapContainerRef} />

      {/* Modal */}
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