const FALLBACK_IMG = "/images/hero-1.jpg";

function normalizeToString(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const clean = value.trim();
    return clean || null;
  }

  if (typeof value === "object") {
    const candidate =
      value.thumbnailUrl ||
      value.thumbnail ||
      value.coverImage ||
      value.primaryImageUrl ||
      value.url ||
      value.imageUrl ||
      value.downloadURL ||
      value.src ||
      value.preview ||
      null;

    if (typeof candidate === "string") {
      const clean = candidate.trim();
      return clean || null;
    }
  }

  return null;
}

function cleanImageList(items) {
  const result = [];

  for (const item of items) {
    const img = normalizeToString(item);
    if (!img) continue;
    if (result.includes(img)) continue;
    result.push(img);
  }

  return result;
}

export function getListingImage(listing) {
  if (!listing) return FALLBACK_IMG;

  const candidates = [
    listing.thumbnailUrl,
    listing.thumbnail,
    listing.coverImage,
    listing.primaryImageUrl,
    listing.imageUrl,
    listing.image,

    ...(Array.isArray(listing.images) ? listing.images : []),
    ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : []),
    ...(Array.isArray(listing.photos) ? listing.photos : []),
  ];

  return cleanImageList(candidates)[0] || FALLBACK_IMG;
}

export function getListingImages(listing) {
  if (!listing) return [FALLBACK_IMG];

  const candidates = [
    listing.coverImage,
    listing.primaryImageUrl,
    listing.imageUrl,
    listing.image,

    ...(Array.isArray(listing.images) ? listing.images : []),
    ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : []),
    ...(Array.isArray(listing.photos) ? listing.photos : []),
  ];

  const images = cleanImageList(candidates);
  return images.length ? images : [FALLBACK_IMG];
}