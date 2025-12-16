// src/components/Map/MapWithMarkers.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import MapFilters from "./MapFilters";
import { useSearchState } from "../../state/useSearchState";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// Germany bbox (lng/lat)
const DE_BOUNDS = [
  [5.5, 47.0],   // SW
  [15.5, 55.2],  // NE
];

// Zillow-like default view for Germany
const DE_CENTER = [10.4515, 51.1657]; // lng, lat
const DE_ZOOM = 5.6;

const debounce = (fn, ms) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const isValidDEPoint = (lng, lat) => {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
  return lng >= DE_BOUNDS[0][0] && lng <= DE_BOUNDS[1][0] && lat >= DE_BOUNDS[0][1] && lat <= DE_BOUNDS[1][1];
};

const MapWithMarkers = ({ listings = [], onListingSelect, onVisibleChange, onRequestOpenMobileList }) => {
  const { t } = useTranslation(["map", "filterBar", "listing"]);

  const mapEl = useRef(null);
  const mapRef = useRef(null);

  // Subscribe to state (no store.get() in render)
  const storeState = useSearchState((s) => ({
    filters: s.filters,
    sortBy: s.sortBy,
    searchInArea: s.searchInArea,
    bounds: s.bounds,
  }));
  const store = useSearchState(); // actions

  const { filters, sortBy, searchInArea, bounds } = storeState;

  // keep latest callbacks without re-init
  const onListingSelectRef = useRef(onListingSelect);
  const onVisibleChangeRef = useRef(onVisibleChange);
  useEffect(() => { onListingSelectRef.current = onListingSelect; }, [onListingSelect]);
  useEffect(() => { onVisibleChangeRef.current = onVisibleChange; }, [onVisibleChange]);

  // ================= FILTER / SORT (also sanitize coords to DE) =================
  const filteredListings = useMemo(() => {
   let arr = (listings || []).filter((it) => {
  const lat = Number(it.latitude);
  const lng = Number(it.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng);
});

    const cityQ = String(filters?.city || "").trim().toLowerCase();
    if (cityQ) arr = arr.filter((it) => String(it.city || "").toLowerCase().includes(cityQ));

    const type = String(filters?.type || "").trim();
    if (type) arr = arr.filter((it) => String(it.type || "") === type);

    const min = filters?.priceMin ? Number(filters.priceMin) : null;
    const max = filters?.priceMax ? Number(filters.priceMax) : null;
    if (min != null && Number.isFinite(min)) arr = arr.filter((it) => Number(it.price ?? 0) >= min);
    if (max != null && Number.isFinite(max)) arr = arr.filter((it) => Number(it.price ?? 0) <= max);

    if (searchInArea && bounds) {
      arr = arr.filter(
        (it) =>
          it.longitude >= bounds.w &&
          it.longitude <= bounds.e &&
          it.latitude >= bounds.s &&
          it.latitude <= bounds.n
      );
    }

    if (sortBy === "priceAsc") arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === "priceDesc") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sortBy === "newest") arr.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

    return arr;
  }, [listings, filters, sortBy, searchInArea, bounds]);

  // ================= GEOJSON =================
  const geojson = useMemo(() => ({
    type: "FeatureCollection",
    features: filteredListings.map((it) => ({
      type: "Feature",
      properties: { id: String(it.id), price: Number(it.price ?? 0) },
      geometry: { type: "Point", coordinates: [Number(it.longitude), Number(it.latitude)] },
    })),
  }), [filteredListings]);

  const syncBoundsToStore = (map) => {
    const b = map.getBounds();
    store.setBounds({
      w: b.getWest(),
      e: b.getEast(),
      s: b.getSouth(),
      n: b.getNorth(),
    });
  };

  const ensureSourceAndLayers = (map) => {
    if (!map || map._removed) return;
    if (!map.isStyleLoaded?.()) return;

    const src = map.getSource("mh24-listings");
    if (!src) {
      map.addSource("mh24-listings", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterRadius: 46,
        clusterMaxZoom: 12,
      });
    } else {
      src.setData(geojson);
    }

    if (!map.getLayer("mh24-clusters")) {
      map.addLayer({
        id: "mh24-clusters",
        type: "circle",
        source: "mh24-listings",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 30, 28],
          "circle-color": "#d90429",
          "circle-opacity": 0.92,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    if (!map.getLayer("mh24-cluster-count")) {
      map.addLayer({
        id: "mh24-cluster-count",
        type: "symbol",
        source: "mh24-listings",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });
    }

    if (!map.getLayer("mh24-point")) {
      map.addLayer({
        id: "mh24-point",
        type: "symbol",
        source: "mh24-listings",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["concat", "€", ["to-string", ["get", "price"]]],
          "text-size": 12,
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-anchor": "center",
          "text-padding": 8,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#111827",
          "text-halo-color": "#ffffff",
          "text-halo-width": 12,
        },
      });
    }
  };

  const reportVisible = (map) => {
    if (!map || map._removed) return;

    // if search-in-area OFF => everything (already sanitized to DE)
    if (!store.get().searchInArea) {
      onVisibleChangeRef.current?.(filteredListings);
      return;
    }

    const b = map.getBounds();
    const visible = filteredListings.filter(
      (it) =>
        it.longitude >= b.getWest() &&
        it.longitude <= b.getEast() &&
        it.latitude >= b.getSouth() &&
        it.latitude <= b.getNorth()
    );
    onVisibleChangeRef.current?.(visible);
  };

  // ================= MAP INIT (RUN ONCE) =================
  useEffect(() => {
    if (!mapEl.current) return;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DE_CENTER,
      zoom: DE_ZOOM,
      attributionControl: false,
    });

    // ✅ IMPORTANT: keep map inside Germany so bad coords can't throw it to Scandinavia
    //map.setMaxBounds(DE_BOUNDS);

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    let t1 = null;
    let t2 = null;

    const safeResize = () => {
      const m = mapRef.current;
      if (!m || m._removed) return;
      const c = m.getCanvas?.();
      if (!c) return;
      try { m.resize(); } catch {}
    };

    const onMoveEnd = debounce(() => {
      const m = mapRef.current;
      if (!m || m._removed) return;
      if (!m.isStyleLoaded?.()) return;
      syncBoundsToStore(m);
      reportVisible(m);
    }, 120);

    const onLoad = () => {
      // force Germany on load
      map.jumpTo({ center: DE_CENTER, zoom: DE_ZOOM });

      t1 = setTimeout(safeResize, 120);
      t2 = setTimeout(safeResize, 350);

      syncBoundsToStore(map);
      ensureSourceAndLayers(map);
      reportVisible(map);

      map.on("moveend", onMoveEnd);

      map.on("click", "mh24-clusters", (e) => {
        const feats = map.queryRenderedFeatures(e.point, { layers: ["mh24-clusters"] });
        const clusterId = feats?.[0]?.properties?.cluster_id;
        const source = map.getSource("mh24-listings");
        if (!source || clusterId == null) return;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: feats[0].geometry.coordinates, zoom });
        });
      });

      map.on("click", "mh24-point", (e) => {
        const f = e.features?.[0];
        const id = f?.properties?.id;
        if (!id) return;
        const full = filteredListings.find((x) => String(x.id) === String(id));
        if (full) onListingSelectRef.current?.(full);
      });

      map.on("mouseenter", "mh24-point", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "mh24-point", () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", "mh24-clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "mh24-clusters", () => (map.getCanvas().style.cursor = ""));
    };

    map.on("load", onLoad);

    return () => {
      try { if (t1) clearTimeout(t1); if (t2) clearTimeout(t2); } catch {}
      try { map.off("load", onLoad); map.off("moveend", onMoveEnd); } catch {}
      try { map.remove(); } catch {}
      mapRef.current = null;
    };
  }, []); // ✅ never re-init

  // ================= UPDATE DATA (NO RE-INIT) =================
  useEffect(() => {
    const map = mapRef.current;
    if (!map || map._removed) return;
    if (!map.isStyleLoaded?.()) return;
    ensureSourceAndLayers(map);
    reportVisible(map);
  }, [geojson]); // ok

  // ================= SEARCH UI (Nominatim) =================
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=de&addressdetails=1&limit=6`
      );
      setSuggestions(await res.json());
    } catch {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearch(item.display_name);
    setSuggestions([]);
    const map = mapRef.current;
    if (!map || map._removed) return;
    // still inside DE via maxBounds
    map.flyTo({ center: [parseFloat(item.lon), parseFloat(item.lat)], zoom: 12, duration: 650 });
  };

  return (
    <div className="w-full h-full relative">
      {/* Topbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-5xl">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur px-3 py-3">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder={t("searchLocation", { ns: "filterBar", defaultValue: "Adresse, Stadt…" })}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-2xl z-50">
                {suggestions.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(it)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {it.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MapFilters />

          <label className="ml-auto flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={!!searchInArea}
              onChange={(e) => store.setSearchInArea(e.target.checked)}
            />
            {t("searchInArea", { ns: "filterBar", defaultValue: "In diesem Kartenausschnitt suchen" })}
          </label>

          <button
            type="button"
            onClick={() => {
              const map = mapRef.current;
              if (!map || map._removed) return;
              // ✅ Always Germany
              map.fitBounds(DE_BOUNDS, { padding: 60, duration: 450, maxZoom: 7 });
            }}
            className="h-10 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-950/70 text-sm font-semibold"
          >
            {t("resetGermany", { ns: "map", defaultValue: "Deutschland" })}
          </button>

          <div className="text-sm text-gray-700 dark:text-gray-200">
            {filteredListings.length} {t("results", { ns: "map", defaultValue: "Ergebnisse" })}
          </div>

          <button
            onClick={() => onRequestOpenMobileList?.()}
            className="md:hidden h-10 px-3 rounded-xl text-sm bg-blue-600 text-white"
          >
            {t("openList", { ns: "map", defaultValue: "Liste" })}
          </button>
        </div>
      </div>

      <div ref={mapEl} className="w-full h-full" />
    </div>
  );
};

MapWithMarkers.propTypes = {
  listings: PropTypes.array,
  onListingSelect: PropTypes.func,
  onVisibleChange: PropTypes.func,
  onRequestOpenMobileList: PropTypes.func,
};

export default MapWithMarkers;
