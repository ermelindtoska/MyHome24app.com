import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  GeoPoint,
} from "firebase/firestore";
import { db } from "../firebase";

import MapWithMarkers from "../components/Map/MapWithMarkers";
import GermanyMapLeaflet from "../components/GermanyMapLeaflet";
import ListingSidebar from "../components/ListingSidebar";
import ListingDetailsModal from "../components/ListingDetailsModal";
import SiteMeta from "../components/SEO/SiteMeta";
import { useTranslation } from "react-i18next";

import { useSearchState } from "../state/useSearchState";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

async function geocodeDE(queryText) {
  if (!queryText || !MAPBOX_TOKEN) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    queryText
  )}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=DE`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const center = data?.features?.[0]?.center;

    if (Array.isArray(center) && center.length === 2) {
      const [lng, lat] = center;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  } catch (error) {
    console.error("[MapPage] geocode error:", error);
  }

  return null;
}

const normalizePurpose = (value) =>
  (value || "").toString().trim().toLowerCase();

const normalizeListing = (docSnap) => {
  const data = docSnap.data() || {};

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

  const lat = typeof latRaw === "string" ? parseFloat(latRaw) : latRaw;
  const lng = typeof lngRaw === "string" ? parseFloat(lngRaw) : lngRaw;

  return {
    ...data,
    id: docSnap.id,
    title: data.title || "",
    city: data.city || "",
    address: data.address || "",
    description: data.description || "",
    price: Number(data.price ?? 0),
    type: data.type || data.category || "apartment",
    purpose: normalizePurpose(
      data.purpose || data.intent || data.listingPurpose || ""
    ),
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
    images: Array.isArray(data.images)
      ? data.images
      : Array.isArray(data.imageUrls)
      ? data.imageUrls
      : data.imageUrl
      ? [data.imageUrl]
      : [],
    bedrooms: data.bedrooms ?? data.rooms ?? null,
    rooms: data.rooms ?? null,
    bathrooms: data.bathrooms ?? null,
    size: data.size ?? data.area ?? null,
    createdAt: data.createdAt ?? null,
    status: data.status || "active",
    isPremium: !!data.isPremium,
  };
};

const MapPage = ({ purpose = "all" }) => {
  const { t, i18n } = useTranslation(["map", "filterBar", "listing"]);
  const store = useSearchState();

  const sortBy = store?.sortBy || "";

  const [allListings, setAllListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasMapbox = Boolean(MAPBOX_TOKEN);

  useEffect(() => {
    if (typeof store?.setPurpose === "function") {
      store.setPurpose(purpose || "all");
    }
    if (typeof store?.resetFilters === "function") {
      store.resetFilters();
    }
    if (typeof store?.setActiveId === "function") {
      store.setActiveId(null);
    }

    setSelectedListing(null);
    setVisibleListings([]);
  }, [purpose]); // bewusst nur purpose

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      setLoading(true);

      try {
        const snap = await getDocs(collection(db, "listings"));
        const normalized = snap.docs.map(normalizeListing);

        const filteredByPurpose =
          purpose === "all"
            ? normalized
            : normalized.filter((item) => item.purpose === purpose);

        if (!isMounted) return;

        setAllListings(filteredByPurpose);
        setVisibleListings(filteredByPurpose);

        if (typeof store?.setListings === "function") {
          store.setListings(filteredByPurpose);
        }

        const needFix = filteredByPurpose.filter(
          (item) =>
            (item.latitude == null || item.longitude == null) &&
            (item.address || item.city)
        );

        for (const item of needFix) {
          const searchText = item.address
            ? `${item.address}, ${item.city || ""}, Deutschland`
            : `${item.city}, Deutschland`;

          const coords = await geocodeDE(searchText);

          if (coords) {
            try {
              await setDoc(
                doc(db, "listings", item.id),
                {
                  lat: coords.lat,
                  lng: coords.lng,
                  latitude: coords.lat,
                  longitude: coords.lng,
                  geopt: new GeoPoint(coords.lat, coords.lng),
                },
                { merge: true }
              );

              if (!isMounted) return;

              setAllListings((prev) =>
                prev.map((x) =>
                  x.id === item.id
                    ? {
                        ...x,
                        latitude: coords.lat,
                        longitude: coords.lng,
                      }
                    : x
                )
              );

              setVisibleListings((prev) =>
                prev.map((x) =>
                  x.id === item.id
                    ? {
                        ...x,
                        latitude: coords.lat,
                        longitude: coords.lng,
                      }
                    : x
                )
              );
            } catch (error) {
              console.warn("[MapPage] setDoc coords failed:", error);
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      } catch (error) {
        console.error("[MapPage] Firestore error:", error);
        if (isMounted) {
          setAllListings([]);
          setVisibleListings([]);
          if (typeof store?.setListings === "function") {
            store.setListings([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [purpose]); // bewusst nur purpose

  const listingsForMap = useMemo(() => {
    return allListings.filter(
      (item) =>
        typeof item.latitude === "number" &&
        typeof item.longitude === "number"
    );
  }, [allListings]);

  const resultCount = visibleListings.length;

  const metaTitle =
    resultCount > 0
      ? `${resultCount} ${t("homes", {
          ns: "listing",
          defaultValue: "Immobilien",
        })} – MyHome24App`
      : t("title", {
          ns: "map",
          defaultValue: "Immobilienkarte",
        });

  const metaDescription = t("description", {
    ns: "map",
    count: resultCount,
    defaultValue: `Zeigt ${resultCount} Immobilien auf der Karte.`,
  });

  const handleVisibleChange = useCallback((items) => {
    setVisibleListings(Array.isArray(items) ? items : []);
  }, []);

  const handleOpenMobileList = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const handleSelectListing = useCallback(
    (listing) => {
      setSelectedListing(listing);
      if (listing?.id && typeof store?.setActiveId === "function") {
        store.setActiveId(listing.id);
      }
    },
    [store]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedListing(null);
    if (typeof store?.setActiveId === "function") {
      store.setActiveId(null);
    }
  }, [store]);

  const handleSaveSearch = useCallback(() => {
    alert(
      t("saveSearchDemo", {
        ns: "map",
        defaultValue: "Suche gespeichert (Demo).",
      })
    );
  }, [t]);

  return (
    <div className="relative z-0 h-[calc(100vh-80px)] w-full">
      <SiteMeta
        title={metaTitle}
        description={metaDescription}
        canonical={`${window.location.origin}${
          purpose && purpose !== "all" ? `/${purpose}` : "/map"
        }`}
        ogImage="/icons/icon-512.png"
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[430px_1fr] xl:grid-cols-[500px_1fr]">
        {hasMapbox && (
          <aside className="hidden h-full md:flex md:flex-col border-r ui-border surface">
            <div className="sticky top-0 z-20 border-b ui-border bg-[rgba(var(--bg),0.94)] backdrop-blur px-4 py-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--fg))]">
                      {loading
                        ? t("loadingResults", {
                            ns: "map",
                            defaultValue: "Ergebnisse werden geladen…",
                          })
                        : `${resultCount} ${t("results", {
                            ns: "map",
                            defaultValue: "Ergebnisse",
                          })}`}
                    </p>
                    <p className="text-xs ui-muted">
                      {t("mapSidebarHint", {
                        ns: "map",
                        defaultValue:
                          "Liste und Karte bleiben automatisch synchron.",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={handleSaveSearch}
                    className="inline-flex items-center rounded-full border ui-border px-3 py-1.5 text-xs font-semibold text-[rgb(var(--primary))] hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    💾{" "}
                    {t("saveSearch", {
                      ns: "map",
                      defaultValue: "Suche speichern",
                    })}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs ui-muted">
                    {t("sortBy", {
                      ns: "filterBar",
                      defaultValue: "Sortieren nach",
                    })}
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      typeof store?.setSort === "function" &&
                      store.setSort(e.target.value)
                    }
                    className="min-w-[180px] rounded-xl border ui-border bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--card-fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                  >
                    <option value="">
                      {t("default", {
                        ns: "filterBar",
                        defaultValue: "Standard",
                      })}
                    </option>
                    <option value="priceAsc">
                      {t("priceAsc", {
                        ns: "filterBar",
                        defaultValue: "Preis ⬆",
                      })}
                    </option>
                    <option value="priceDesc">
                      {t("priceDesc", {
                        ns: "filterBar",
                        defaultValue: "Preis ⬇",
                      })}
                    </option>
                    <option value="newest">
                      {t("newest", {
                        ns: "filterBar",
                        defaultValue: "Neueste",
                      })}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <ListingSidebar
                listings={visibleListings}
                onClickItem={handleSelectListing}
              />
            </div>
          </aside>
        )}

        <main className="relative h-full w-full overflow-hidden">
          {hasMapbox ? (
            <MapWithMarkers
              listings={listingsForMap}
              onListingSelect={handleSelectListing}
              onVisibleChange={handleVisibleChange}
              onRequestOpenMobileList={handleOpenMobileList}
            />
          ) : (
            <GermanyMapLeaflet />
          )}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-3xl border-t ui-border bg-[rgb(var(--bg))] shadow-2xl">
            <div className="flex justify-center pt-2">
              <div className="h-1.5 w-14 rounded-full bg-black/15 dark:bg-white/15" />
            </div>

            <div className="flex items-center justify-between border-b ui-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">
                  {t("results", { ns: "map", defaultValue: "Ergebnisse" })} (
                  {visibleListings.length})
                </p>
                <p className="text-xs ui-muted">
                  {t("mobileListHint", {
                    ns: "map",
                    defaultValue: "Tippe auf ein Listing für Details.",
                  })}
                </p>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(80vh-70px)] overflow-y-auto">
              <ListingSidebar
                listings={visibleListings}
                onClickItem={(listing) => {
                  handleSelectListing(listing);
                  setMobileOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {hasMapbox && !mobileOpen && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 md:hidden">
          <button
            onClick={handleOpenMobileList}
            className="pointer-events-auto inline-flex items-center rounded-full bg-[rgb(var(--primary))] px-5 py-3 text-sm font-semibold text-white shadow-xl"
          >
            {t("openList", {
              ns: "map",
              defaultValue: "Liste öffnen",
            })}{" "}
            ({visibleListings.length})
          </button>
        </div>
      )}

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          allListings={allListings}
          onClose={handleCloseModal}
          onSelectListing={handleSelectListing}
        />
      )}
    </div>
  );
};

export default MapPage;