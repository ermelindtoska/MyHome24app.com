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

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function isValidDEPoint(lng, lat) {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;

  return (
    lng >= DE_BOUNDS[0][0] &&
    lng <= DE_BOUNDS[1][0] &&
    lat >= DE_BOUNDS[0][1] &&
    lat <= DE_BOUNDS[1][1]
  );
}

function getListingsBounds(items = []) {
  const valid = items.filter((item) =>
    isValidDEPoint(Number(item.longitude), Number(item.latitude))
  );

  if (!valid.length) return null;

  const bounds = new mapboxgl.LngLatBounds();

  valid.forEach((item) => {
    bounds.extend([Number(item.longitude), Number(item.latitude)]);
  });

  return bounds;
}

function buildGeoJson(items = []) {
  return {
    type: "FeatureCollection",
    features: items.map((item) => ({
      type: "Feature",
      properties: {
        id: String(item.id),
        price: Number(item.price ?? 0),
      },
      geometry: {
        type: "Point",
        coordinates: [Number(item.longitude), Number(item.latitude)],
      },
    })),
  };
}

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
  const lastVisibleSignatureRef = useRef("");

  const onListingSelectRef = useRef(onListingSelect);
  const onVisibleChangeRef = useRef(onVisibleChange);
  const filteredListingsRef = useRef([]);

  const store = useSearchState();
  const filters = store?.filters || {};
  const sortBy = store?.sortBy || "";
  const searchInArea = !!store?.searchInArea;

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    onListingSelectRef.current = onListingSelect;
  }, [onListingSelect]);

  useEffect(() => {
    onVisibleChangeRef.current = onVisibleChange;
  }, [onVisibleChange]);

  const filteredListings = useMemo(() => {
    let result = (Array.isArray(listings) ? listings : [])
      .map((item) => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);

        return {
          ...item,
          latitude: lat,
          longitude: lng,
        };
      })
      .filter((item) => isValidDEPoint(item.longitude, item.latitude));

    const cityQuery = String(filters?.city || "").trim().toLowerCase();

    if (cityQuery) {
      result = result.filter((item) =>
        String(item.city || "").toLowerCase().includes(cityQuery)
      );
    }

    const type = String(filters?.type || "").trim();

    if (type) {
      result = result.filter((item) => String(item.type || "") === type);
    }

    const min = filters?.priceMin ? Number(filters.priceMin) : null;
    const max = filters?.priceMax ? Number(filters.priceMax) : null;

    if (min != null && Number.isFinite(min)) {
      result = result.filter((item) => Number(item.price ?? 0) >= min);
    }

    if (max != null && Number.isFinite(max)) {
      result = result.filter((item) => Number(item.price ?? 0) <= max);
    }

    const sorted = [...result];

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
  }, [listings, filters, sortBy]);

  useEffect(() => {
    filteredListingsRef.current = filteredListings;
  }, [filteredListings]);

  const fitSignature = useMemo(() => {
    return filteredListings
      .map((item) => `${item.id}:${item.longitude}:${item.latitude}`)
      .join("|");
  }, [filteredListings]);

  const geojson = useMemo(() => buildGeoJson(filteredListings), [filteredListings]);

  const reportVisible = useMemo(
    () =>
      debounce((map) => {
        if (!map || map._removed) return;

        const currentListings = filteredListingsRef.current || [];
        let visible = currentListings;

        if (searchInArea) {
          const b = map.getBounds();

          visible = currentListings.filter(
            (item) =>
              item.longitude >= b.getWest() &&
              item.longitude <= b.getEast() &&
              item.latitude >= b.getSouth() &&
              item.latitude <= b.getNorth()
          );
        }

        const signature = visible.map((item) => item.id).join("|");
        if (signature === lastVisibleSignatureRef.current) return;

        lastVisibleSignatureRef.current = signature;
        onVisibleChangeRef.current?.(visible);
      }, 180),
    [searchInArea]
  );

  const fitMapToCurrentListings = (map, options = {}) => {
    if (!map || map._removed) return;

    const currentListings = filteredListingsRef.current || [];
    const boundsObj = getListingsBounds(currentListings);

    if (!boundsObj) {
      map.fitBounds(DE_BOUNDS, {
        padding: 60,
        duration: options.duration ?? 350,
        maxZoom: 7,
      });
      return;
    }

    if (currentListings.length === 1) {
      const item = currentListings[0];

      map.flyTo({
        center: [Number(item.longitude), Number(item.latitude)],
        zoom: 12,
        duration: options.duration ?? 350,
      });
      return;
    }

    map.fitBounds(boundsObj, {
      padding: options.padding ?? 70,
      duration: options.duration ?? 350,
      maxZoom: options.maxZoom ?? 11,
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

  useEffect(() => {
    if (!mapEl.current) return;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DE_CENTER,
      zoom: DE_ZOOM,
      attributionControl: false,
      maxBounds: DE_BOUNDS,
    });

    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    let resizeTimer1 = null;
    let resizeTimer2 = null;

    const safeResize = () => {
      const currentMap = mapRef.current;
      if (!currentMap || currentMap._removed) return;

      try {
        currentMap.resize();
      } catch {}
    };

    const onMoveEnd = () => {
      const currentMap = mapRef.current;
      if (!currentMap || currentMap._removed) return;
      if (!currentMap.isStyleLoaded?.()) return;

      reportVisible(currentMap);
    };

    const onLoad = () => {
      map.jumpTo({
        center: DE_CENTER,
        zoom: DE_ZOOM,
      });

      resizeTimer1 = setTimeout(safeResize, 120);
      resizeTimer2 = setTimeout(safeResize, 350);

      ensureSourceAndLayers(map);

      if (!firstAutoFitDoneRef.current) {
        fitMapToCurrentListings(map, {
          duration: 0,
          padding: 70,
          maxZoom: 11,
        });

        firstAutoFitDoneRef.current = true;
      }

      reportVisible(map);

      map.on("moveend", onMoveEnd);

      map.on("click", "mh24-clusters", (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ["mh24-clusters"],
        });

        const clusterId = features?.[0]?.properties?.cluster_id;
        const source = map.getSource("mh24-listings");

        if (!source || clusterId == null || !features?.[0]) return;

        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
            duration: 350,
          });
        });
      });

      map.on("click", "mh24-point", (event) => {
        const feature = event.features?.[0];
        const id = feature?.properties?.id;

        if (!id) return;

        const fullListing = (filteredListingsRef.current || []).find(
          (item) => String(item.id) === String(id)
        );

        if (fullListing) {
          onListingSelectRef.current?.(fullListing);
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
      if (resizeTimer1) clearTimeout(resizeTimer1);
      if (resizeTimer2) clearTimeout(resizeTimer2);

      try {
        map.off("load", onLoad);
        map.off("moveend", onMoveEnd);
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

      if (fitSignature !== prevFitSignatureRef.current) {
        prevFitSignatureRef.current = fitSignature;

        if (filteredListings.length > 0) {
          fitMapToCurrentListings(map, {
            duration: firstAutoFitDoneRef.current ? 250 : 0,
            padding: 70,
            maxZoom: 11,
          });
        } else {
          map.fitBounds(DE_BOUNDS, {
            padding: 60,
            duration: 250,
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
  }, [geojson, fitSignature, filteredListings.length, reportVisible]);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (queryText) => {
        const clean = String(queryText || "").trim();

        if (clean.length < 2) {
          setSuggestions([]);
          setSuggestionsLoading(false);
          return;
        }

        try {
          setSuggestionsLoading(true);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              clean
            )}&countrycodes=de&addressdetails=1&limit=5`
          );

          const data = await response.json();
          setSuggestions(Array.isArray(data) ? data : []);
        } catch {
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 500),
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    fetchSuggestions(value);
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
      duration: 400,
    });
  };

  const resetToGermany = () => {
    const map = mapRef.current;
    if (!map || map._removed) return;

    map.fitBounds(DE_BOUNDS, {
      padding: 60,
      duration: 300,
      maxZoom: 7,
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
              onChange={handleSearchChange}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            {(suggestions.length > 0 || suggestionsLoading) && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950">
                {suggestionsLoading && (
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    {t("loadingSuggestions", {
                      ns: "filterBar",
                      defaultValue: "Vorschläge werden geladen…",
                    })}
                  </div>
                )}

                {!suggestionsLoading &&
                  suggestions.map((item, index) => (
                    <button
                      key={`${item.place_id || index}`}
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
              onChange={(event) =>
                typeof store?.setSearchInArea === "function" &&
                store.setSearchInArea(event.target.checked)
              }
            />
            {t("searchInArea", {
              ns: "filterBar",
              defaultValue: "In diesem Kartenausschnitt suchen",
            })}
          </label>

          <button
            type="button"
            onClick={resetToGermany}
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
            type="button"
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