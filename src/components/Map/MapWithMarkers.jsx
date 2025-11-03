// src/components/Map/MapWithMarkers.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import MapFilters from "./MapFilters";
import { useSearchState } from "../../state/useSearchState";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const DE_CENTER = [10.4515, 51.1657];
const DE_ZOOM = 5.5;

// util i vogël për debounce
const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

const MapWithMarkers = ({ listings = [], selectedId, onListingSelect, onVisibleChange }) => {
  const { t } = useTranslation(["listing", "filterBar"]);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); // [{id, marker, el, data}]
  const store = useSearchState();

  const { filters, sortBy, searchInArea, activeId } = store.get();

  // ---------------- Map init ----------------
  useEffect(() => {
    if (!mapEl.current) return;
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DE_CENTER,
      zoom: DE_ZOOM,
    });
    mapRef.current = map;

    // raportim i parë i bounds
    map.on("load", () => {
      const b = map.getBounds();
      store.setBounds({ w: b.getWest(), e: b.getEast(), s: b.getSouth(), n: b.getNorth() });
      // trigër i vogël që Mapbox të layout-ojë saktë në mobile
      setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
    });

    // në çdo lëvizje -> rifiltro markerat + dërgo onVisibleChange
    const onMoveEnd = debounce(() => {
      const b = map.getBounds();
      const bounds = { w: b.getWest(), e: b.getEast(), s: b.getSouth(), n: b.getNorth() };
      store.setBounds(bounds);
      renderMarkers(); // bazuar në bounds+filters
      reportVisible();
    }, 120);

    map.on("moveend", onMoveEnd);

    return () => {
      map.off("moveend", onMoveEnd);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Filtro + sort ----------------
  const applyFilters = useCallback((items) => {
    let arr = (items || []).filter((it) => {
      // koordinatat duhet të jenë numerike
      if (typeof it.latitude !== "number" || typeof it.longitude !== "number") return false;

      if (filters.city && !(it.city || "").toLowerCase().includes(filters.city.toLowerCase()))
        return false;
      if (filters.type && it.type !== filters.type) return false;

      const price = Number(it.price ?? 0);
      if (filters.priceMin && price < Number(filters.priceMin)) return false;
      if (filters.priceMax && price > Number(filters.priceMax)) return false;
      return true;
    });

    if (searchInArea) {
      const b = store.get().bounds;
      if (b) {
        arr = arr.filter(
          (it) =>
            it.longitude >= b.w &&
            it.longitude <= b.e &&
            it.latitude >= b.s &&
            it.latitude <= b.n
        );
      }
    }

    if (store.get().sortBy === "priceAsc")  arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (store.get().sortBy === "priceDesc") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (store.get().sortBy === "newest")    arr.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchInArea, store]);

  // ---------------- Render markers ----------------
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];
  };

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    clearMarkers();

    const filtered = applyFilters(listings);

    filtered.forEach((it) => {
      const el = document.createElement("div");
      el.className = "mh24-marker";
      el.innerHTML = `
        <span>€${Number(it.price ?? 0).toLocaleString()}</span>
        <span class="type">${it.type || ""}</span>
      `;

      // highlight nga store
      if (String(store.get().activeId) === String(it.id)) el.classList.add("active");

      el.addEventListener("mouseenter", () => store.setActiveId(it.id));
      el.addEventListener("mouseleave", () => {
        if (String(store.get().activeId) === String(it.id)) store.setActiveId(null);
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onListingSelect?.(it);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([it.longitude, it.latitude])
        .addTo(map);

      markersRef.current.push({ id: it.id, marker, el, data: it });
    });
  }, [applyFilters, listings, onListingSelect, store]);

  // Rirender në çdo ndryshim të filtrave/sortimit/bounds
  useEffect(() => { renderMarkers(); reportVisible(); }, [renderMarkers]);

  // ---------------- Visible to Sidebar ----------------
  const reportVisible = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    const visible = applyFilters(listings).filter(
      (it) =>
        it.longitude >= b.getWest() &&
        it.longitude <= b.getEast() &&
        it.latitude >= b.getSouth() &&
        it.latitude <= b.getNorth()
    );
    onVisibleChange?.(visible);
  }, [applyFilters, listings, onVisibleChange]);

  // ---------------- Selected/Active highlight ----------------
  // nga prop selectedId
  useEffect(() => {
    if (selectedId != null) store.setActiveId(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // nga store.activeId -> CSS 'active'
  useEffect(() => {
    const aId = store.get().activeId;
    markersRef.current.forEach(({ id, el }) => {
      if (String(id) === String(aId)) el.classList.add("active");
      else el.classList.remove("active");
    });
  }, [activeId, store]);

  // ---------------- Search suggestions (Nominatim) ----------------
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=de&addressdetails=1&limit=5`
      );
      setSuggestions(await res.json());
    } catch { /* noop */ }
  };

  const handleSuggestionClick = (item) => {
    setSearch(item.display_name);
    setSuggestions([]);
    const map = mapRef.current;
    if (map) {
      map.flyTo({ center: [parseFloat(item.lon), parseFloat(item.lat)], zoom: 12 });
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* ------- Search + Filters ------- */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl">
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={t("searchLocation", { ns: "filterBar" })}
            value={search}
            onChange={(e) => { setSearch(e.target.value); fetchSuggestions(e.target.value); }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm shadow-sm"
          />
          {suggestions.length > 0 && (
            <ul className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50 max-h-60 overflow-auto">
              {suggestions.map((it, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(it)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {it.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapFilters
          filters={filters}
          sortBy={sortBy}
          onFilterChange={(p) => store.setFilters(p)}
          onSortChange={(v) => store.setSort(v)}
        />

        {/* “Search in this area” si Zillow */}
        <div className="mt-2 flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={searchInArea}
              onChange={(e) => { store.setSearchInArea(e.target.checked); renderMarkers(); reportVisible(); }}
            />
            {t("searchInArea", { ns: "filterBar", defaultValue: "In diesem Kartenausschnitt suchen" })}
          </label>
          <button
            onClick={() => {
              const map = mapRef.current;
              if (!map) return;
              map.fitBounds([[5.9, 47.2],[15.0, 55.1]], { padding: 40, duration: 400 });
            }}
            className="ml-auto px-3 py-1.5 rounded border text-sm bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600"
          >
            {t("resetArea", { ns: "filterBar", defaultValue: "Deutschland" })}
          </button>
        </div>
      </div>

      {/* Harta */}
      <div ref={mapEl} className="w-full h-full" />
    </div>
  );
};

MapWithMarkers.propTypes = {
  listings: PropTypes.array,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onListingSelect: PropTypes.func,
  onVisibleChange: PropTypes.func,
};

export default MapWithMarkers;
