import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import MapFilters from "./MapFilters";
import { useSearchState } from "../../state/useSearchState";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const DE_BOUNDS = [
  [5.5, 47.0],
  [15.5, 55.2],
];

const DE_CENTER = [10.4515, 51.1657];
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
  return (
    lng >= DE_BOUNDS[0][0] &&
    lng <= DE_BOUNDS[1][0] &&
    lat >= DE_BOUNDS[0][1] &&
    lat <= DE_BOUNDS[1][1]
  );
};

const getListingsBounds = (items = []) => {
  const valid = items.filter((it) =>
    isValidDEPoint(Number(it.longitude), Number(it.latitude))
  );

  if (!valid.length) return null;

  const bounds = new mapboxgl.LngLatBounds();

  valid.forEach((it) => {
    bounds.extend([Number(it.longitude), Number(it.latitude)]);
  });

  return bounds;
};

const MapWithMarkers = ({
  listings = [],
  onListingSelect,
  onVisibleChange,
  onRequestOpenMobileList,
}) => {
  const { t } = useTranslation(["map", "filterBar", "listing"]);

  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const firstAutoFitDoneRef = useRef(false);
  const prevFitSignatureRef = useRef("");

  const store = useSearchState();
  const filters = store?.filters || {};
  const sortBy = store?.sortBy || "";
  const searchInArea = !!store?.searchInArea;
  const bounds = store?.bounds || null;

  const onListingSelectRef = useRef(onListingSelect);
  const onVisibleChangeRef = useRef(onVisibleChange);
  const filteredListingsRef = useRef([]);
  const searchInAreaRef = useRef(searchInArea);

  useEffect(() => {
    onListingSelectRef.current = onListingSelect;
  }, [onListingSelect]);

  useEffect(() => {
    onVisibleChangeRef.current = onVisibleChange;
  }, [onVisibleChange]);

  useEffect(() => {
    searchInAreaRef.current = searchInArea;
  }, [searchInArea]);

  const filteredListings = useMemo(() => {
    let arr = (listings || [])
      .map((it) => {
        const lat = Number(it.latitude);
        const lng = Number(it.longitude);

        return {
          ...it,
          latitude: lat,
          longitude: lng,
        };
      })
      .filter((it) => isValidDEPoint(it.longitude, it.latitude));

    const cityQ = String(filters?.city || "")
      .trim()
      .toLowerCase();

    if (cityQ) {
      arr = arr.filter((it) =>
        String(it.city || "").toLowerCase().includes(cityQ)
      );
    }

    const type = String(filters?.type || "").trim();
    if (type) {
      arr = arr.filter((it) => String(it.type || "") === type);
    }

    const min = filters?.priceMin ? Number(filters.priceMin) : null;
    const max = filters?.priceMax ? Number(filters.priceMax) : null;

    if (min != null && Number.isFinite(min)) {
      arr = arr.filter((it) => Number(it.price ?? 0) >= min);
    }

    if (max != null && Number.isFinite(max)) {
      arr = arr.filter((it) => Number(it.price ?? 0) <= max);
    }

    if (searchInArea && bounds) {
      arr = arr.filter(
        (it) =>
          it.longitude >= bounds.w &&
          it.longitude <= bounds.e &&
          it.latitude >= bounds.s &&
          it.latitude <= bounds.n
      );
    }

    const sorted = [...arr];

    if (sortBy === "priceAsc") {
      sorted.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    }

    if (sortBy === "priceDesc") {
      sorted.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    }

    if (sortBy === "newest") {
      sorted.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
    }

    return sorted;
  }, [listings, filters, sortBy, searchInArea, bounds]);

  useEffect(() => {
    filteredListingsRef.current = filteredListings;
  }, [filteredListings]);

  const fitSignature = useMemo(() => {
    return filteredListings
      .map((it) => `${it.id}:${it.longitude}:${it.latitude}`)
      .join("|");
  }, [filteredListings]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: filteredListings.map((it) => ({
        type: "Feature",
        properties: {
          id: String(it.id),
          price: Number(it.price ?? 0),
        },
        geometry: {
          type: "Point",
          coordinates: [Number(it.longitude), Number(it.latitude)],
        },
      })),
    }),
    [filteredListings]
  );

  const syncBoundsToStore = (map) => {
    if (typeof store?.setBounds !== "function") return;

    const b = map.getBounds();
    store.setBounds({
      w: b.getWest(),
      e: b.getEast(),
      s: b.getSouth(),
      n: b.getNorth(),
    });
  };

  const fitMapToCurrentListings = (map, options = {}) => {
    if (!map || map._removed) return;

    const currentListings = filteredListingsRef.current || [];
    const boundsObj = getListingsBounds(currentListings);

    if (!boundsObj) {
      map.fitBounds(DE_BOUNDS, {
        padding: 60,
        duration: options.duration ?? 500,
        maxZoom: 7,
      });
      return;
    }

    // Wenn nur ein Objekt da ist -> gezielt drauf zoomen
    if (currentListings.length === 1) {
      const one = currentListings[0];
      map.flyTo({
        center: [Number(one.longitude), Number(one.latitude)],
        zoom: 12.5,
        duration: options.duration ?? 650,
      });
      return;
    }

    map.fitBounds(boundsObj, {
      padding: options.padding ?? 70,
      duration: options.duration ?? 650,
      maxZoom: options.maxZoom ?? 12,
    });
  };

  const ensureSourceAndLayers = (map) => {
    if (!map || map._removed) return;
    if (!map.isStyleLoaded?.()) return;

    const existingSource = map.getSource("mh24-listings");

    if (!existingSource) {
      map.addSource("mh24-listings", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterRadius: 46,
        clusterMaxZoom: 12,
      });
    } else {
      existingSource.setData(geojson);
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
        paint: {
          "text-color": "#ffffff",
        },
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

    const currentListings = filteredListingsRef.current || [];

    if (!searchInAreaRef.current) {
      onVisibleChangeRef.current?.(currentListings);
      return;
    }

    const b = map.getBounds();

    const visible = currentListings.filter(
      (it) =>
        it.longitude >= b.getWest() &&
        it.longitude <= b.getEast() &&
        it.latitude >= b.getSouth() &&
        it.latitude <= b.getNorth()
    );

    onVisibleChangeRef.current?.(visible);
  };

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

    map.setMaxBounds(DE_BOUNDS);
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    let t1 = null;
    let t2 = null;

    const safeResize = () => {
      const m = mapRef.current;
      if (!m || m._removed) return;
      try {
        m.resize();
      } catch {}
    };

    const onMoveEnd = debounce(() => {
      const m = mapRef.current;
      if (!m || m._removed) return;
      if (!m.isStyleLoaded?.()) return;

      syncBoundsToStore(m);
      reportVisible(m);
    }, 120);

    const onLoad = () => {
      map.jumpTo({
        center: DE_CENTER,
        zoom: DE_ZOOM,
      });

      t1 = setTimeout(safeResize, 120);
      t2 = setTimeout(safeResize, 350);

      syncBoundsToStore(map);
      ensureSourceAndLayers(map);

      // Initial sauber auf Listings fitten
      fitMapToCurrentListings(map, {
        duration: 0,
        padding: 70,
        maxZoom: 11.5,
      });

      firstAutoFitDoneRef.current = true;

      reportVisible(map);

      map.on("moveend", onMoveEnd);

      map.on("click", "mh24-clusters", (e) => {
        const feats = map.queryRenderedFeatures(e.point, {
          layers: ["mh24-clusters"],
        });

        const clusterId = feats?.[0]?.properties?.cluster_id;
        const source = map.getSource("mh24-listings");

        if (!source || clusterId == null || !feats?.[0]) return;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: feats[0].geometry.coordinates,
            zoom,
          });
        });
      });

      map.on("click", "mh24-point", (e) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.id;
        if (!id) return;

        const full = (filteredListingsRef.current || []).find(
          (x) => String(x.id) === String(id)
        );

        if (full) {
          onListingSelectRef.current?.(full);
        }
      });

      map.on("mouseenter", "mh24-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "mh24-point", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", "mh24-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "mh24-clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    map.on("load", onLoad);

    return () => {
      try {
        if (t1) clearTimeout(t1);
        if (t2) clearTimeout(t2);
      } catch {}

      try {
        map.off("load", onLoad);
        map.off("moveend", onMoveEnd);
      } catch {}

      try {
        map.remove();
      } catch {}

      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || map._removed) return;

    const applyUpdate = () => {
      ensureSourceAndLayers(map);
      reportVisible(map);

      // Auto-fit nur wenn Such-in-Ausschnitt NICHT aktiv ist,
      // damit der User die Karte frei bewegen kann
      if (!searchInArea && fitSignature !== prevFitSignatureRef.current) {
        prevFitSignatureRef.current = fitSignature;

        if (filteredListings.length > 0) {
          fitMapToCurrentListings(map, {
            duration: firstAutoFitDoneRef.current ? 500 : 0,
            padding: 70,
            maxZoom: 11.5,
          });
        } else {
          map.fitBounds(DE_BOUNDS, {
            padding: 60,
            duration: 450,
            maxZoom: 7,
          });
        }
      }
    };

    if (map.isStyleLoaded?.()) {
      applyUpdate();
    } else {
      map.once("load", applyUpdate);
    }
  }, [geojson, searchInArea, fitSignature, filteredListings.length]);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (queryText) => {
    if (!queryText || queryText.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryText
        )}&countrycodes=de&addressdetails=1&limit=6`
      );

      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearch(item.display_name);
    setSuggestions([]);

    const map = mapRef.current;
    if (!map || map._removed) return;

    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    if (!isValidDEPoint(lng, lat)) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 12,
      duration: 650,
    });
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-3 z-50 w-[96%] max-w-5xl -translate-x-1/2">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="relative min-w-[240px] flex-1">
            <input
              type="text"
              placeholder={t("searchLocation", {
                ns: "filterBar",
                defaultValue: "Adresse, Stadt…",
              })}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950">
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.place_id || idx}`}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MapFilters />

          <label className="ml-auto flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={!!searchInArea}
              onChange={(e) =>
                typeof store?.setSearchInArea === "function" &&
                store.setSearchInArea(e.target.checked)
              }
            />
            {t("searchInArea", {
              ns: "filterBar",
              defaultValue: "In diesem Kartenausschnitt suchen",
            })}
          </label>

          <button
            type="button"
            onClick={() => {
              const map = mapRef.current;
              if (!map || map._removed) return;

              map.fitBounds(DE_BOUNDS, {
                padding: 60,
                duration: 450,
                maxZoom: 7,
              });
            }}
            className="h-10 rounded-full border border-slate-200 bg-white/95 px-4 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          >
            {t("resetGermany", {
              ns: "map",
              defaultValue: "Deutschland",
            })}
          </button>

          <div className="text-sm text-slate-700 dark:text-slate-200">
            {filteredListings.length}{" "}
            {t("results", {
              ns: "map",
              defaultValue: "Ergebnisse",
            })}
          </div>

          <button
            onClick={() => onRequestOpenMobileList?.()}
            className="h-10 rounded-xl bg-blue-600 px-3 text-sm text-white md:hidden"
          >
            {t("openList", {
              ns: "map",
              defaultValue: "Liste",
            })}
          </button>
        </div>
      </div>

      <div ref={mapEl} className="h-full w-full" />
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