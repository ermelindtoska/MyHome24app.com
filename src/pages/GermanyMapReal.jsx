import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MapWithMarkers from "../components/Map/MapWithMarkers";
import ListingSidebar from "../components/ListingSidebar";
import ListingDetailsModal from "../components/ListingDetailsModal";
import SiteMeta from "../components/SEO/SiteMeta";
import { useSearchState } from "../state/useSearchState";

import listingsData from "../data/listings.json";

const GermanyMapReal = ({ purpose = "all" }) => {
  const { t, i18n } = useTranslation(["map", "listing"]);
  const location = useLocation();

  const store = useSearchState();
  const { setPurpose, setListings, setVisibleListings, visibleListings } = store;

  const [selectedListing, setSelectedListing] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setPurpose(purpose || "all");
    store.setActiveId?.(null);
    setSelectedListing(null);
  }, [purpose, setPurpose, store]);

  const allListings = useMemo(() => {
    const safe = Array.isArray(listingsData) ? listingsData : [];

    return safe
      .filter((l) => {
        if (!purpose || purpose === "all") return true;
        return (l.purpose || "").toLowerCase() === String(purpose).toLowerCase();
      })
      .map((item, index) => ({
        ...item,
        id: item.id || `listing-${index}`,
        title: item.title || "",
        city: item.city || "",
        address: item.address || "",
        type: item.type || "Apartment",
        purpose: item.purpose || purpose || "all",
        price: Number(item.price || 0),
        latitude:
          typeof item.latitude === "number"
            ? item.latitude
            : Number(item.latitude),
        longitude:
          typeof item.longitude === "number"
            ? item.longitude
            : Number(item.longitude),
        images: item.images || item.imageUrls || [],
      }))
      .filter(
        (item) =>
          Number.isFinite(item.latitude) &&
          Number.isFinite(item.longitude)
      );
  }, [purpose]);

  useEffect(() => {
    setListings(allListings);
    setVisibleListings(allListings);
  }, [allListings, setListings, setVisibleListings]);

  useEffect(() => {
    setSelectedListing(null);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const metaTitle =
    purpose === "buy"
      ? t("buyTitle", { ns: "map", defaultValue: "Immobilien kaufen" })
      : purpose === "rent"
      ? t("rentTitle", { ns: "map", defaultValue: "Immobilien mieten" })
      : t("title", { ns: "map", defaultValue: "Immobilienkarte Deutschland" });

  const metaDescription = t("description", {
    ns: "map",
    defaultValue:
      "Interaktive Immobilienkarte für Deutschland mit Sidebar, Filtern und Detailansicht.",
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={`${metaTitle} – MyHome24App`}
        description={metaDescription}
        canonical={`${window.location.origin}${location.pathname}`}
        lang={i18n.language?.slice(0, 2) || "de"}
        ogImage="/icons/icon-512.png"
      />

      {/* Desktop split view */}
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[520px_minmax(0,1fr)] 2xl:grid-cols-[560px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR */}
        <aside className="hidden h-full min-h-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {visibleListings?.length || 0}{" "}
                  {t("results", { ns: "map", defaultValue: "Ergebnisse" })}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("listMapSync", {
                    ns: "map",
                    defaultValue:
                      "Liste und Karte bleiben automatisch synchron.",
                  })}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {t("homes", { ns: "listing", defaultValue: "Immobilien" })}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <ListingSidebar
              listings={visibleListings}
              onClickItem={setSelectedListing}
              onHoverItem={(item) => store.setActiveId?.(item?.id || null)}
            />
          </div>
        </aside>

        {/* MAP */}
        <main className="relative h-full min-h-0 overflow-hidden">
          <MapWithMarkers
            listings={allListings}
            onListingSelect={(item) => {
              setSelectedListing(item);
              store.setActiveId?.(item?.id || null);
            }}
            onVisibleChange={(items) => {
              setVisibleListings(items);
            }}
            onRequestOpenMobileList={() => setMobileOpen(true)}
          />
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[120] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {visibleListings?.length || 0}{" "}
                  {t("results", { ns: "map", defaultValue: "Ergebnisse" })}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("homes", { ns: "listing", defaultValue: "Immobilien" })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(80vh-64px)] overflow-y-auto">
              <ListingSidebar
                listings={visibleListings}
                onClickItem={(item) => {
                  setSelectedListing(item);
                  setMobileOpen(false);
                  store.setActiveId?.(item?.id || null);
                }}
                onHoverItem={(item) => store.setActiveId?.(item?.id || null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          allListings={allListings}
          onClose={() => {
            setSelectedListing(null);
            store.setActiveId?.(null);
          }}
          onSelectListing={(item) => {
            setSelectedListing(item);
            store.setActiveId?.(item?.id || null);
          }}
        />
      )}
    </div>
  );
};

export default GermanyMapReal;