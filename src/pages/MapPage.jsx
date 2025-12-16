// src/pages/MapPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, setDoc, GeoPoint } from "firebase/firestore";
import { db } from "../firebase";

import MapWithMarkers from "../components/Map/MapWithMarkers";
import GermanyMapLeaflet from "../components/GermanyMapLeaflet";
import ListingSidebar from "../components/ListingSidebar";
import ListingDetailsModal from "../components/ListingDetailsModal";
import SiteMeta from "../components/SEO/SiteMeta";
import { useTranslation } from "react-i18next";

import { useSearchState } from "../state/useSearchState";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

async function geocodeDE(q) {
  if (!q || !MAPBOX_TOKEN) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    q
  )}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=DE`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const c = data?.features?.[0]?.center;

    if (Array.isArray(c) && c.length === 2) {
      const [lng, lat] = c;
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  } catch (err) {
    console.error("[MapPage] geocode error:", err);
  }
  return null;
}

const MapPage = ({ purpose = "all" }) => {
  const { t, i18n } = useTranslation(["map", "filterBar", "listing"]);

  // ✅ Dein Context-Store (ohne Selector!)
  const store = useSearchState();
  const sortBy = store.sortBy || "";

  const [allListings, setAllListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasMapbox = Boolean(process.env.REACT_APP_MAPBOX_TOKEN);
  const count = visibleListings.length;

  // ✅ HAPI 2: purpose in Store syncen + reset wie Zillow (bei buy/rent Wechsel)
  useEffect(() => {
    store.setPurpose(purpose || "all");
    store.resetFilters();
    store.setActiveId(null);

    setSelectedListing(null);
    setVisibleListings([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purpose]);

  const metaTitle =
    count > 0
      ? `${count} ${t("homes", { ns: "listing", defaultValue: "Homes" })} – MyHome24App`
      : t("title", { ns: "map", defaultValue: "Immobilien-Karte" });

  const metaDesc = t("description", {
    ns: "map",
    count,
    defaultValue: `Zeigt ${count} Immobilien auf der Karte.`,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "listings"));

        const rows = snap.docs.map((d) => {
          const data = d.data() || {};
          const base = { ...data };

          const latRaw =
            base.latitude ??
            base.lat ??
            base.location?.lat ??
            base.coordinates?.lat ??
            base.geo?.lat ??
            null;

          const lngRaw =
            base.longitude ??
            base.lng ??
            base.location?.lng ??
            base.coordinates?.lng ??
            base.geo?.lng ??
            null;

          const lat = typeof latRaw === "string" ? parseFloat(latRaw) : latRaw;
          const lng = typeof lngRaw === "string" ? parseFloat(lngRaw) : lngRaw;

          const normalizedPurpose = (base.purpose || base.intent || base.listingPurpose || "")
            .toString()
            .toLowerCase()
            .trim();

          return {
            ...base,
            id: d.id,
            title: base.title || "",
            city: base.city || "",
            address: base.address || "",
            price: base.price ?? 0,
            type: base.type || base.category || "Apartment",
            purpose: normalizedPurpose,
            latitude: Number.isFinite(lat) ? lat : null,
            longitude: Number.isFinite(lng) ? lng : null,
            images: base.images || base.imageUrls || [],
            bedrooms: base.bedrooms ?? base.rooms ?? null,
            size: base.size ?? null,
          };
        });

        const filtered = purpose === "all" ? rows : rows.filter((r) => r.purpose === purpose);
        setAllListings(filtered);

        // optional: fehlende Koordinaten geocoden und speichern
        const needFix = filtered.filter(
          (r) => (r.latitude == null || r.longitude == null) && (r.address || r.city)
        );

        for (const r of needFix) {
          const q = r.address
            ? `${r.address}, ${r.city || ""}, Deutschland`
            : `${r.city}, Deutschland`;

          const coords = await geocodeDE(q);

          if (coords) {
            try {
              await setDoc(
                doc(db, "listings", r.id),
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
            } catch (e) {
              console.warn("[MapPage] setDoc coords failed:", e);
            }
          }
          await new Promise((res) => setTimeout(res, 350));
        }
      } catch (e) {
        console.error("[MapPage] Firestore error:", e);
      }
    };

    load();
  }, [purpose]);

  const listingsForMap = useMemo(
    () => allListings.filter((l) => typeof l.latitude === "number" && typeof l.longitude === "number"),
    [allListings]
  );

  const handleSaveSearch = () => {
    alert(t("saveSearch", { defaultValue: "Suche gespeichert (Demo)" }));
  };

  return (
    <div className="relative z-0 grid grid-cols-1 md:grid-cols-[520px_1fr] w-full h-[calc(100vh-80px)]">
      <SiteMeta
        title={metaTitle}
        description={metaDesc}
        canonical={`${window.location.origin}${purpose && purpose !== "all" ? `/${purpose}` : "/map"}`}
        ogImage="/icons/icon-512.png"
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      {/* LEFT */}
      {hasMapbox && (
        <div className="hidden md:flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {count} {t("results", { ns: "map", defaultValue: "Ergebnisse" })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveSearch}
                  className="px-3 py-1.5 text-sm font-medium rounded-full border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  💾 {t("saveSearch", { ns: "map", defaultValue: "Suche speichern" })}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => store.setSort(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                >
                  <option value="">
                    {t("default", { ns: "filterBar", defaultValue: "Standard" })}
                  </option>
                  <option value="priceAsc">
                    {t("priceAsc", { ns: "filterBar", defaultValue: "Preis ⬆︎" })}
                  </option>
                  <option value="priceDesc">
                    {t("priceDesc", { ns: "filterBar", defaultValue: "Preis ⬇︎" })}
                  </option>
                  <option value="newest">
                    {t("newest", { ns: "filterBar", defaultValue: "Neueste" })}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-[calc(100%-52px)] overflow-y-auto">
            <ListingSidebar listings={visibleListings} onClickItem={setSelectedListing} />
          </div>
        </div>
      )}

      {/* RIGHT */}
      <div className="h-full relative z-0">
        {hasMapbox ? (
          <MapWithMarkers
            listings={listingsForMap}
            onListingSelect={setSelectedListing}
            onVisibleChange={setVisibleListings}
            onRequestOpenMobileList={() => setMobileOpen(true)}
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
                {t("results", { ns: "map", defaultValue: "Ergebnisse" })} ({visibleListings.length})
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
          onSelectListing={(it) => setSelectedListing(it)}
        />
      )}
    </div>
  );
};

export default MapPage;
