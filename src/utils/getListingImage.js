const FALLBACK_IMG = "/images/hero-1.jpg";

const BLOCKED_IMAGE_PATTERNS = [
  "logo",
  "favicon",
  "apple-touch-icon",
  "icon-192",
  "icon-512",
  "default-avatar",
  "avatar",
  "myhome24app",
  "placeholder",
  "<url>",
  "{url}",
  "[object object]",
];

function normalizeToString(x) {
  if (!x) return null;

  if (typeof x === "string") {
    const s = x.trim();
    return s || null;
  }

  if (typeof x === "object") {
    const v =
      x.url ||
      x.imageUrl ||
      x.downloadURL ||
      x.src ||
      x.path ||
      x.preview ||
      x.secure_url ||
      null;

    return typeof v === "string" ? v.trim() || null : null;
  }

  return null;
}

function isBlockedAsset(src) {
  const s = String(src || "").trim().toLowerCase();
  return BLOCKED_IMAGE_PATTERNS.some((p) => s.includes(p));
}

function looksLikeRealImage(src) {
  const s = String(src || "").trim().toLowerCase();
  if (!s) return false;
  if (isBlockedAsset(s)) return false;

  if (s.startsWith("data:image/")) return true;
  if (s.startsWith("blob:")) return true;

  if (s.startsWith("/")) {
    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(s);
  }

  if (s.startsWith("http://") || s.startsWith("https://")) {
    return true;
  }

  return false;
}

function dedupe(arr) {
  return [...new Set(arr)];
}

function sanitizeImages(listing) {
  if (!listing) return [FALLBACK_IMG];

  const raw = [
    ...(Array.isArray(listing.images) ? listing.images : []),
    ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : []),
    ...(Array.isArray(listing.photos) ? listing.photos : []),
    listing.imageUrl,
    listing.image,
    listing.primaryImageUrl,
    listing.coverImage,
    listing.thumbnail,
  ];

  const cleaned = dedupe(
    raw
      .map(normalizeToString)
      .filter(Boolean)
      .filter(looksLikeRealImage)
  ).slice(0, 10);

  return cleaned.length ? cleaned : [FALLBACK_IMG];
}

export function getListingImage(listing) {
  return sanitizeImages(listing)[0] || FALLBACK_IMG;
}

export function getListingImages(listing) {
  return sanitizeImages(listing);
}