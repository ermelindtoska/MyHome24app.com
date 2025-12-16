// src/utils/getListingImage.js
const FALLBACK_IMG = "/images/hero-1.jpg"; // muss in public/images existieren

function normalizeToString(x) {
  if (!x) return null;
  if (typeof x === "string") return x.trim() || null;

  if (typeof x === "object") {
    // falls images = [{ url: ... }] oder [{ imageUrl: ... }] usw.
    const v =
      x.url ||
      x.imageUrl ||
      x.downloadURL ||
      x.src ||
      x.path ||
      x.preview ||
      null;

    return typeof v === "string" ? (v.trim() || null) : null;
  }

  return null;
}

export function getListingImage(listing) {
  if (!listing) return FALLBACK_IMG;

  const candidates = [
    // Arrays
    ...(Array.isArray(listing.images) ? listing.images : []),
    ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : []),

    // Single fields
    listing.imageUrl,
    listing.image,
    listing.primaryImageUrl,
    listing.coverImage,
    listing.thumbnail,
  ];

  for (const c of candidates) {
    const s = normalizeToString(c);
    if (s) return s;
  }

  return FALLBACK_IMG;
}

// Optional (für Galerie/Slider)
export function getListingImages(listing) {
  if (!listing) return [FALLBACK_IMG];

  const raw = [
    ...(Array.isArray(listing.images) ? listing.images : []),
    ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : []),
  ];

  const out = raw
    .map(normalizeToString)
    .filter(Boolean);

  return out.length ? out : [getListingImage(listing)];
}
