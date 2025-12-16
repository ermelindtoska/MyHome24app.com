import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MapWithMarkers from "../components/Map/MapWithMarkers";
import ListingSidebar from "../components/ListingSidebar";
import ListingDetailsModal from "../components/ListingDetailsModal";
import { useSearchState } from "../state/useSearchState";

import listingsData from "../data/listings.json";

const GermanyMapReal = ({ purpose }) => {
  const { t } = useTranslation(["map", "listing"]);
  const location = useLocation();

  const {
    setPurpose,
    setListings,
    visibleListings,
  } = useSearchState();

  const [selectedListing, setSelectedListing] = useState(null);

  /* -----------------------------
     INIT: purpose (buy / rent)
  ------------------------------ */
  useEffect(() => {
    setPurpose(purpose);
  }, [purpose, setPurpose]);

  /* -----------------------------
     LOAD LISTINGS (mock / firestore later)
  ------------------------------ */
  useEffect(() => {
    const filtered = listingsData.filter(
      (l) => !purpose || l.purpose === purpose
    );
    setListings(filtered);
  }, [purpose, setListings]);

  /* -----------------------------
     Reset modal on route change
  ------------------------------ */
  useEffect(() => {
    setSelectedListing(null);
  }, [location.pathname]);

  return (
    <div className="w-full h-[calc(100vh-64px)] flex bg-white dark:bg-gray-900">

      {/* LEFT: LISTINGS (Zillow-style) */}
      <aside className="hidden md:block w-[420px] border-r border-gray-200 dark:border-gray-800">
        <ListingSidebar
          listings={visibleListings}
          onClickItem={setSelectedListing}
        />
      </aside>

      {/* RIGHT: MAP */}
      <main className="flex-1 relative">
        <MapWithMarkers
          listings={visibleListings}
          onListingSelect={setSelectedListing}
          onVisibleChange={(items) => {
            // keeps sidebar & map in sync
          }}
          onRequestOpenMobileList={() => {}}
        />
      </main>

      {/* MODAL */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          allListings={visibleListings}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
};

export default GermanyMapReal;
