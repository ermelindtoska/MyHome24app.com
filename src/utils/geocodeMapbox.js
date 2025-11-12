// src/utils/geocodeMapbox.js
const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

if (!token) {
  // Damit wir einen klaren Fehler bekommen, falls das Token fehlt
  // (statt stillen 401/403 im Netzwerk-Tab)
  // eslint-disable-next-line no-throw-literal
  throw new Error("REACT_APP_MAPBOX_ACCESS_TOKEN fehlt");
}

/**
 * Frei formulierter Suchstring -> Vorschläge (für Suchleiste/HeroSearch)
 */
export async function suggestPlaces(q, { limit = 5, language = "de" } = {}) {
  if (!q?.trim()) return [];
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("language", language);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Mapbox Geocoding failed: ${res.status}`);
  const data = await res.json();

  return (data.features || []).map((f) => ({
    id: f.id,
    place_name: f.place_name,
    center: f.center, // [lng, lat]
    bbox: f.bbox || null,
    properties: f.properties || {},
  }));
}

/**
 * Fester Ort -> Koordinaten (für “Suche starten”)
 */
export async function geocodeOne(q, { language = "de" } = {}) {
  const [first] = await suggestPlaces(q, { limit: 1, language });
  return first || null;
}
