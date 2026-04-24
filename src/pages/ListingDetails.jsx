import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";
import { getListingImages } from "../utils/getListingImage";
import ImageLightbox from "../components/gallery/ImageLightbox";

const FALLBACK_IMG = "/images/hero-1.jpg";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["listingDetails", "property"]);

  const [listing, setListing] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "listings", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setListing(null);
          setLoading(false);
          return;
        }

        const data = { id: snap.id, ...snap.data() };
        setListing(data);

        const listSnap = await getDocs(collection(db, "listings"));
        const items = listSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllListings(items);
      } catch (err) {
        console.error("[ListingDetails] Fehler:", err);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) run();
  }, [id]);

  const images = useMemo(() => getListingImages(listing), [listing]);

  useEffect(() => {
    setActiveImage(0);
    setLightboxOpen(false);
  }, [id]);

  const price = useMemo(() => {
    const n = Number(listing?.price);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  }, [listing?.price]);

  const address = [
    listing?.address || listing?.street || "",
    listing?.postalCode || listing?.zip || "",
    listing?.city || "",
  ]
    .filter(Boolean)
    .join(", ");

  const title =
    listing?.title ||
    t("noTitle", {
      ns: "property",
      defaultValue: "Ohne Titel",
    });

  const similar = useMemo(() => {
    if (!listing) return [];

    const city = String(listing.city || "").toLowerCase();
    const type = String(listing.type || "").toLowerCase();
    const purpose = String(listing.purpose || "").toLowerCase();

    return (Array.isArray(allListings) ? allListings : [])
      .filter((x) => x.id !== listing.id)
      .filter((x) => {
        const xCity = String(x.city || "").toLowerCase();
        const xType = String(x.type || "").toLowerCase();
        const xPurpose = String(x.purpose || "").toLowerCase();

        return xPurpose === purpose && (xCity === city || xType === type);
      })
      .slice(0, 4);
  }, [allListings, listing]);

  const nextImage = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-base font-medium text-gray-500 dark:text-slate-300">
            {t("loading", { ns: "property", defaultValue: "Wird geladen..." })}
          </p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("notFoundTitle", {
              ns: "property",
              defaultValue: "Immobilie nicht gefunden",
            })}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("notFoundText", {
              ns: "property",
              defaultValue:
                "Die angeforderte Immobilie konnte nicht geladen werden oder existiert nicht mehr.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
        >
          ←{" "}
          {t("backToListings", {
            ns: "listingDetails",
            defaultValue: "Zurück zu den Anzeigen",
          })}
        </button>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="block w-full cursor-zoom-in"
                >
                  <img
                    src={images[activeImage] || FALLBACK_IMG}
                    alt={title}
                    className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[520px]"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </button>

                <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                  {activeImage + 1} / {images.length}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`overflow-hidden rounded-2xl border transition ${
                        idx === activeImage
                          ? "border-blue-600 ring-2 ring-blue-500/20"
                          : "border-gray-200 dark:border-slate-800"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${title}-${idx + 1}`}
                        className="h-20 w-28 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {title}
              </h1>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {address || "—"}
              </p>

              <div className="mt-4 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {price}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <DetailBox
                  label={t("type", { ns: "property", defaultValue: "Typ" })}
                  value={listing?.type || "—"}
                />
                <DetailBox
                  label={t("rooms", { ns: "property", defaultValue: "Zimmer" })}
                  value={listing?.rooms || "—"}
                />
                <DetailBox
                  label={t("bedrooms", {
                    ns: "property",
                    defaultValue: "Schlafzimmer",
                  })}
                  value={listing?.bedrooms || "—"}
                />
                <DetailBox
                  label={t("bathrooms", {
                    ns: "property",
                    defaultValue: "Badezimmer",
                  })}
                  value={listing?.bathrooms || "—"}
                />
                <DetailBox
                  label={t("size", {
                    ns: "property",
                    defaultValue: "Wohnfläche",
                  })}
                  value={
                    listing?.livingArea || listing?.size
                      ? `${listing.livingArea || listing.size} m²`
                      : "—"
                  }
                />
                <DetailBox
                  label={t("yearBuilt", {
                    ns: "property",
                    defaultValue: "Baujahr",
                  })}
                  value={listing?.yearBuilt || "—"}
                />
                <DetailBox
                  label={t("city", { ns: "property", defaultValue: "Stadt" })}
                  value={listing?.city || "—"}
                />
                <DetailBox
                  label={t("purpose", {
                    ns: "property",
                    defaultValue: "Zweck",
                  })}
                  value={listing?.purpose || "—"}
                />
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t("description", {
                    ns: "property",
                    defaultValue: "Beschreibung",
                  })}
                </h2>
                <p className="mt-3 whitespace-pre-line text-slate-700 dark:text-slate-300">
                  {listing?.description || "—"}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("contactTitle", {
                  ns: "listingDetails",
                  defaultValue: "Kontakt",
                })}
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <span className="font-semibold">Owner:</span>{" "}
                  {listing?.ownerName || "—"}
                </div>
                <div>
                  <span className="font-semibold">E-Mail:</span>{" "}
                  {listing?.ownerEmail || "—"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("similarTitle", {
                  ns: "listingDetails",
                  defaultValue: "Ähnliche Immobilien",
                })}
              </h3>

              <div className="mt-4 space-y-3">
                {similar.length > 0 ? (
                  similar.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(`/listing/${item.id}`)}
                      className="flex w-full gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-3 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      <img
                        src={getListingImages(item)[0] || FALLBACK_IMG}
                        alt={item.title || "Listing"}
                        className="h-16 w-24 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title || "—"}
                        </div>
                        <div className="truncate text-xs text-slate-600 dark:text-slate-300">
                          {[item.address, item.city].filter(Boolean).join(", ")}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("similarEmpty", {
                      ns: "listingDetails",
                      defaultValue:
                        "Aktuell keine ähnlichen Immobilien gefunden.",
                    })}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        activeIndex={activeImage}
        onChangeIndex={setActiveImage}
        onClose={() => setLightboxOpen(false)}
        title={title}
        fallbackImage={FALLBACK_IMG}
      />
    </>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}