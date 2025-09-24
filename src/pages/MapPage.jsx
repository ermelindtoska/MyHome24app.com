// src/pages/MapPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import MapWithMarkers from '../components/Map/MapWithMarkers';
import GermanyMapLeaflet from '../components/GermanyMapLeaflet';
import ListingSidebar from '../components/ListingSidebar';
import ListingDetailsModal from '../components/ListingDetailsModal';
import SiteMeta from '../components/SEO/SiteMeta';
import { useTranslation } from 'react-i18next';

const MapPage = ({ purpose = 'all' }) => {
  const { t, i18n } = useTranslation(['map', 'filterBar', 'listing']);
  const [allListings, setAllListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasMapbox = Boolean(process.env.REACT_APP_MAPBOX_TOKEN);

  // SEO meta
  const count = visibleListings.length;
  const metaTitle =
    count > 0
      ? `${count} ${t('homes', { ns: 'listing', defaultValue: 'Homes' })} – MyHome24App`
      : t('title', { defaultValue: 'Immobilien-Karte' });
  const metaDesc = t('description', {
    count,
    defaultValue: `Zeigt ${count} Immobilien auf der Karte.`,
  });

  // Load Firestore listings (me filtër opsional 'purpose')
  useEffect(() => {
    const load = async () => {
      try {
        let col = collection(db, 'listings');
        if (purpose === 'buy' || purpose === 'rent') {
          col = query(col, where('purpose', '==', purpose));
        }
        const snap = await getDocs(col);
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const lat =
            typeof data.latitude === 'number'
              ? data.latitude
              : typeof data.lat === 'number'
              ? data.lat
              : null;
          const lng =
            typeof data.longitude === 'number'
              ? data.longitude
              : typeof data.lng === 'number'
              ? data.lng
              : null;

          return {
            id: d.id,
            title: data.title || '',
            city: data.city || '',
            price: data.price ?? 0,
            type: data.type || 'Apartment',
            latitude: lat,
            longitude: lng,
            images: data.images || data.imageUrls || [],
            bedrooms: data.bedrooms ?? data.rooms ?? null,
            size: data.size ?? null,
            ...data,
          };
        });
        setAllListings(rows);
      } catch (e) {
        console.error('[MapPage] Firestore error:', e);
      }
    };
    load();
  }, [purpose]);

  // Vetëm listimet që kanë koordinata për hartë
  const listingsForMap = useMemo(
    () =>
      allListings.filter(
        (l) => typeof l.latitude === 'number' && typeof l.longitude === 'number'
      ),
    [allListings]
  );

  // Sort vetëm mbi çfarë është aktualisht “visible” (si te Zillow)
  const sortedVisible = useMemo(() => {
    if (sortBy === 'priceAsc')
      return [...visibleListings].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'priceDesc')
      return [...visibleListings].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return visibleListings;
  }, [visibleListings, sortBy]);

  const handleSaveSearch = () => {
    // placeholder – këtu më vonë shtojmë ruajtje në Firestore + notif
    alert(t('saveSearch', { defaultValue: 'Suche gespeichert (Demo)' }));
  };

  return (
    <div className="relative z-0 flex flex-row w-full h-[calc(100vh-80px)]">
      <SiteMeta
        title={metaTitle}
        description={metaDesc}
        canonical={`${window.location.origin}${
          purpose && purpose !== 'all' ? `/${purpose}` : '/map'
        }`}
        ogImage="/icons/icon-512.png"
        lang={i18n.language?.slice(0, 2) || 'de'}
      />

      {/* LEFT: Sidebar (si Zillow) */}
      {hasMapbox && (
        <div className="w-[40%] min-w-[380px] max-w-[700px] h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {/* Header i listës: count + Save search + Sort (sticky) */}
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {count} {t('results', { defaultValue: 'Ergebnisse' })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveSearch}
                  className="px-3 py-1.5 text-sm font-medium rounded-full border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  💾 {t('saveSearch', { defaultValue: 'Suche speichern' })}
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                >
                  <option value="">
                    {t('default', { ns: 'filterBar', defaultValue: 'Standard' })}
                  </option>
                  <option value="priceAsc">
                    {t('priceAsc', { ns: 'filterBar', defaultValue: 'Preis ⬆︎' })}
                  </option>
                  <option value="priceDesc">
                    {t('priceDesc', { ns: 'filterBar', defaultValue: 'Preis ⬇︎' })}
                  </option>
                </select>
              </div>
            </div>
          </div>
          {/* MOBILE: drawer */}
{mobileOpen && (
  <div className="md:hidden fixed inset-0 z-40">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setMobileOpen(false)}
    />
    <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="font-semibold">
          {t('results', { defaultValue: 'Rezultatet' })} ({visibleListings.length})
        </span>
        <button
          onClick={() => setMobileOpen(false)}
          className="text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="max-h-[calc(75vh-52px)] overflow-y-auto">
        <ListingSidebar
          listings={visibleListings}
          onClickItem={(it) => {
            setSelectedListing(it);
            setMobileOpen(false);
          }}
        />
      </div>
    </div>
  </div>
)}

          {/* Lista e rezultateve */}
          <div className="h-[calc(100%-52px)] overflow-y-auto">
            <ListingSidebar listings={sortedVisible} onClickItem={setSelectedListing} />
          </div>
        </div>
      )}
      

      {/* RIGHT: Map (ose Leaflet fallback) */}
      <div className={hasMapbox ? 'flex-1 h-full relative z-0' : 'w-full h-full relative z-0'}>
        {hasMapbox ? (
          <MapWithMarkers
            listings={listingsForMap}
            onListingSelect={setSelectedListing}
            onVisibleChange={setVisibleListings}
          />
        ) : (
          <GermanyMapLeaflet />
        )}
      </div>

      {/* Modal i detajeve */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          allListings={allListings}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
    
  );
};

export default MapPage;
