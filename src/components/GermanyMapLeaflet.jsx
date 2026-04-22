import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DE_CENTER = [51.1657, 10.4515];
const DE_BOUNDS = [
  [47.0, 5.5],
  [55.2, 15.5],
];

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

function FlyToLocation({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target?.lat || !target?.lng) return;
    map.flyTo([target.lat, target.lng], target.zoom || 12, {
      duration: 0.8,
    });
  }, [map, target]);

  return null;
}

function LocationClickHandler({ onSelectLocation }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "de,en;q=0.8",
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        const displayName = data?.display_name || "Unbekannter Ort";

        onSelectLocation?.({
          lat,
          lng,
          label: displayName,
          navigateNow: true,
        });
      } catch (error) {
        console.error("[GermanyMapLeaflet] reverse geocode error:", error);
      }
    },
  });

  return null;
}

const GermanyMapLeaflet = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const wrapperRef = useRef(null);

  const markerPosition = useMemo(() => {
    if (!selectedLocation?.lat || !selectedLocation?.lng) return null;
    return [selectedLocation.lat, selectedLocation.lng];
  }, [selectedLocation]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!search || search.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            search.trim()
          )}&countrycodes=de&addressdetails=1&limit=5`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "de,en;q=0.8",
            },
          }
        );

        if (!res.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const data = await res.json();
        const safe = Array.isArray(data) ? data : [];

        setSuggestions(safe);
        setShowSuggestions(safe.length > 0);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("[GermanyMapLeaflet] suggestion error:", error);
        }
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search]);

  const handleNavigateToSearch = (label) => {
    const slug = slugify(label);
    navigate(`/search?query=${encodeURIComponent(label)}&slug=${slug}`);
  };

  const handleSuggestionClick = (item) => {
    const lat = Number(item?.lat);
    const lng = Number(item?.lon);
    const label = item?.display_name || "";

    setSearch(label);
    setShowSuggestions(false);
    setSelectedLocation({
      lat,
      lng,
      label,
      zoom: 12,
    });

    handleNavigateToSearch(label);
  };

  const handleSelectLocation = ({ lat, lng, label, navigateNow = false }) => {
    setSelectedLocation({
      lat,
      lng,
      label,
      zoom: 12,
    });
    setSearch(label);
    setSuggestions([]);
    setShowSuggestions(false);

    if (navigateNow && label) {
      handleNavigateToSearch(label);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] min-h-[540px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div
        ref={wrapperRef}
        className="absolute left-1/2 top-4 z-[1000] w-[92%] max-w-xl -translate-x-1/2"
      >
        <div className="rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
          <input
            type="text"
            placeholder="Ort in Deutschland suchen..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-blue-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />

          {showSuggestions && (
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-950">
              {loadingSuggestions ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Suche läuft…
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="max-h-72 overflow-auto">
                  {suggestions.map((item, idx) => (
                    <li
                      key={`${item.place_id || idx}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(item);
                      }}
                      className="cursor-pointer px-4 py-3 text-sm text-gray-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Keine Treffer gefunden.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={DE_CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={18}
        maxBounds={DE_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <LocationClickHandler onSelectLocation={handleSelectLocation} />

        {selectedLocation && <FlyToLocation target={selectedLocation} />}

        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>{selectedLocation?.label || "Ausgewählter Ort"}</Popup>
          </Marker>
        )}

        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  );
};

export default GermanyMapLeaflet;