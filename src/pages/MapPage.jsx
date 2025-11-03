import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where, doc, setDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../firebase';
import MapWithMarkers from '../components/Map/MapWithMarkers';
import GermanyMapLeaflet from '../components/GermanyMapLeaflet';
import ListingSidebar from '../components/ListingSidebar';
import ListingDetailsModal from '../components/ListingDetailsModal';
import SiteMeta from '../components/SEO/SiteMeta';
import { useTranslation } from 'react-i18next';

// --- util: geocode me Nominatim (DE) ---
async function geocodeDE(q) {
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=de&limit=1&q=${encodeURIComponent(
    q
  )}`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'de' } });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  } catch {}
  return null;
}

const MapPage = ({ purpose = 'all' }) => {
  const { t, i18n } = useTranslation(['map', 'filterBar', 'listing']);
  const [allListings, setAllListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasMapbox = Boolean(process.env.REACT_APP_MAPBOX_TOKEN);

  const count = visibleListings.length;
  const metaTitle =
    count > 0
      ? `${count} ${t('homes', { ns: 'listing', defaultValue: 'Homes' })} – MyHome24App`
      : t('title', { defaultValue: 'Immobilien-Karte' });
  const metaDesc = t('description', { count, defaultValue: `Zeigt ${count} Immobilien auf der Karte.` });

  useEffect(() => {
    const load = async () => {
      try {
        // lexo gjithçka dhe filtro pas normalizimit
        const snap = await getDocs(collection(db, 'listings'));

        const rows = snap.docs.map((d) => {
          const data = d.data() || {};

          const latRaw =
            data.latitude ??
            data.lat ??
            data.location?.lat ??
            data.coordinates?.lat ??
            data.geo?.lat ??
            null;

          const lngRaw =
            data.longitude ??
            data.lng ??
            data.location?.lng ??
            data.coordinates?.lng ??
            data.geo?.lng ??
            null;

          const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
          const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : lngRaw;

          const normalizedPurpose = (data.purpose || data.intent || data.listingPurpose || '')
            .toString()
            .toLowerCase()
            .trim();

          return {
            id: d.id,
            title: data.title || '',
            city: data.city || '',
            address: data.address || '',
            price: data.price ?? 0,
            type: data.type || data.category || 'Apartment',
            purpose: normalizedPurpose,
            latitude: Number.isFinite(lat) ? lat : null,
            longitude: Number.isFinite(lng) ? lng : null,
            images: data.images || data.imageUrls || [],
            bedrooms: data.bedrooms ?? data.rooms ?? null,
            size: data.size ?? null,
            ...data,
          };
        });

        const filtered = purpose === 'all' ? rows : rows.filter((r) => r.purpose === purpose);

        // info
        const withoutCoords = filtered.filter((l) => l.latitude == null || l.longitude == null).length;
        if (filtered.length && withoutCoords) {
          console.warn(`[MapPage] ${withoutCoords}/${filtered.length} listime pa koordinata – do t'i provoj të gjeokodoj.`);
        }

        setAllListings(filtered);

        // --- HOT-FIX: geokodo dhe ruaj në Firestore listimet pa koordinata ---
        const needFix = filtered.filter(
          (r) => (r.latitude == null || r.longitude == null) && (r.address || r.city)
        );

        for (const r of needFix) {
          const q = r.address ? `${r.address}, ${r.city || ''}, Deutschland` : `${r.city}, Deutschland`;
          const coords = await geocodeDE(q);
          if (coords) {
            try {
              await setDoc(
                doc(db, 'listings', r.id),
                {
                  lat: coords.lat,
                  lng: coords.lng,
                  latitude: coords.lat,
                  longitude: coords.lng,
                  geopt: new GeoPoint(coords.lat, coords.lng),
                },
                { merge: true }
              );
              setAllListings((prev) =>
                prev.map((x) =>
                  x.id === r.id ? { ...x, latitude: coords.lat, longitude: coords.lng } : x
                )
              );
            } catch {}
          }
          // mos e bombardoj API-n
          await new Promise((res) => setTimeout(res, 400));
        }
      } catch (e) {
        console.error('[MapPage] Firestore error:', e);
      }
    };
    load();
  }, [purpose]);

  const listingsForMap = useMemo(
    () => allListings.filter((l) => typeof l.latitude === 'number' && typeof l.longitude === 'number'),
    [allListings]
  );

  const sortedVisible = useMemo(() => {
    if (sortBy === 'priceAsc') return [...visibleListings].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'priceDesc') return [...visibleListings].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return visibleListings;
  }, [visibleListings, sortBy]);

  const handleSaveSearch = () => {
    alert(t('saveSearch', { defaultValue: 'Suche gespeichert (Demo)' }));
  };

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative z-0 grid grid-cols-1 md:grid-cols-2 w-full h-[calc(100vh-80px)]">
      <SiteMeta
        title={metaTitle}
        description={metaDesc}
        canonical={`${window.location.origin}${purpose && purpose !== 'all' ? `/${purpose}` : '/map'}`}
        ogImage="/icons/icon-512.png"
        lang={i18n.language?.slice(0, 2) || 'de'}
      />

      {/* LEFT: Sidebar */}
      {hasMapbox && (
        <div className="hidden md:flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                  <option value="">{t('default', { ns: 'filterBar', defaultValue: 'Standard' })}</option>
                  <option value="priceAsc">{t('priceAsc', { ns: 'filterBar', defaultValue: 'Preis ⬆︎' })}</option>
                  <option value="priceDesc">{t('priceDesc', { ns: 'filterBar', defaultValue: 'Preis ⬇︎' })}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-[calc(100%-52px)] overflow-y-auto">
            <ListingSidebar listings={sortedVisible} onClickItem={setSelectedListing} />
          </div>
        </div>
      )}

      {/* RIGHT: Map */}
      <div className="h-full relative z-0">
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

      {/* MOBILE Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="font-semibold">
                {t('results', { defaultValue: 'Rezultatet' })} ({visibleListings.length})
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-2xl leading-none" aria-label="Close">
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

      {/* Modal */}
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
