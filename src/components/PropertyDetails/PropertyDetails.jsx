import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { getListingImages } from "../../utils/getListingImage";
import ContactOwnerModal from "../ContactOwnerModal";
import MakeOfferModal from "../MakeOfferModal";
import SimilarListings from "../SimilarListings/SimilarListings";

import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaRulerCombined,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaRegBuilding,
  FaRegHeart,
  FaShareAlt,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

const FALLBACK_IMG = "/images/hero-1.jpg";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["property", "listingDetails", "offer", "contact"]);

  const [property, setProperty] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("No such property!");
          setProperty(null);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    const loadAllListings = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "listings"));
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllListings(items);
      } catch (err) {
        console.error("[PropertyDetails] Fehler beim Laden ähnlicher Listings:", err);
        setAllListings([]);
      }
    };

    loadAllListings();
  }, []);

  const images = useMemo(() => {
    const list = getListingImages(property);
    return Array.isArray(list) && list.length ? list : [FALLBACK_IMG];
  }, [property]);

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  const title = property?.title || t("noTitle", { ns: "property", defaultValue: "Ohne Titel" });

  const address =
    property?.address ||
    property?.street ||
    property?.fullAddress ||
    [property?.postalCode || property?.zip, property?.city].filter(Boolean).join(" ") ||
    "—";

  const city = property?.city || "—";
  const postalCode = property?.postalCode || property?.zip || "";
  const purpose = property?.purpose || "buy";
  const type = property?.type || property?.propertyType || "house";

  const formattedPrice =
    property?.price != null
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(Number(property.price))
      : "—";

  const facts = [
    {
      icon: <FaBed />,
      label: t("bedrooms", { ns: "property", defaultValue: "Schlafzimmer" }),
      value: property?.bedrooms ?? "–",
    },
    {
      icon: <FaBath />,
      label: t("bathrooms", { ns: "property", defaultValue: "Badezimmer" }),
      value: property?.bathrooms ?? "–",
    },
    {
      icon: <FaRulerCombined />,
      label: t("size", { ns: "property", defaultValue: "Fläche" }),
      value: property?.size != null ? `${property.size} m²` : "– m²",
    },
    {
      icon: <FaHome />,
      label: t("type", { ns: "property", defaultValue: "Typ" }),
      value: type || "—",
    },
    {
      icon: <FaCalendarAlt />,
      label: t("yearBuilt", { ns: "property", defaultValue: "Baujahr" }),
      value: property?.yearBuilt || property?.buildYear || "—",
    },
    {
      icon: <FaRegBuilding />,
      label: t("purpose", { ns: "property", defaultValue: "Zweck" }),
      value:
        purpose === "rent"
          ? t("rent", { ns: "property", defaultValue: "Miete" })
          : t("buy", { ns: "property", defaultValue: "Kauf" }),
    },
  ];

  const features = Array.isArray(property?.features)
    ? property.features
    : Array.isArray(property?.amenities)
    ? property.amenities
    : [];

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/listing/${property?.id || ""}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      alert(
        t("toastLinkCopied", {
          ns: "listingDetails",
          defaultValue: "Link wurde kopiert.",
        })
      );
    } catch (err) {
      console.error("[PropertyDetails] Share failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="rounded-[32px] border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-base font-medium text-gray-500 dark:text-gray-300">
            {t("loading", { ns: "property", defaultValue: "Wird geladen..." })}
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="rounded-[32px] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
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
      <div className="mx-auto max-w-7xl px-4 py-6 text-slate-900 dark:text-slate-100 md:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
        >
          <FaChevronLeft />
          {t("backToListings", {
            ns: "listingDetails",
            defaultValue: "Zurück zu den Anzeigen",
          })}
        </button>

        {/* HERO */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Gallery */}
            <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="relative">
                <img
                  src={images[activeImage]}
                  alt={title}
                  className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[500px]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />

                {/* top badges */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    {purpose === "rent"
                      ? t("rent", { ns: "property", defaultValue: "Miete" })
                      : t("buy", { ns: "property", defaultValue: "Kauf" })}
                  </span>

                  <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow dark:bg-slate-900/95 dark:text-white">
                    {type}
                  </span>
                </div>

                {/* image counter */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                  {activeImage + 1} / {images.length}
                </div>

                {/* controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow transition hover:bg-white dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-900"
                    >
                      <FaChevronLeft />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow transition hover:bg-white dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-900"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`overflow-hidden rounded-2xl border transition ${
                        activeImage === idx
                          ? "border-blue-600 ring-2 ring-blue-500/20"
                          : "border-gray-200 dark:border-slate-800"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${title} ${idx + 1}`}
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

            {/* Main Info */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-7">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {purpose === "rent"
                  ? t("rent", { ns: "property", defaultValue: "Miete" })
                  : t("buy", { ns: "property", defaultValue: "Kauf" })}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {title}
              </h1>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FaMapMarkerAlt className="shrink-0" />
                <span>
                  {address}
                  {postalCode || city ? `, ${[postalCode, city].filter(Boolean).join(" ")}` : ""}
                </span>
              </div>

              <div className="mt-5 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {formattedPrice}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {facts.map((fact, idx) => (
                  <FactCard
                    key={idx}
                    icon={fact.icon}
                    label={fact.label}
                    value={fact.value}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t("contactAgent", {
                    ns: "property",
                    defaultValue: "Verkäufer kontaktieren",
                  })}
                </button>

                <button
                  type="button"
                  onClick={() => setOfferOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  {t("makeOfferButton", {
                    ns: "offer",
                    defaultValue: "Kaufangebot abgeben",
                  })}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  <FaShareAlt />
                  {t("share", {
                    ns: "listingDetails",
                    defaultValue: "Teilen",
                  })}
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  <FaRegHeart />
                  {t("save", {
                    ns: "listingDetails",
                    defaultValue: "Speichern",
                  })}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("description", {
                  ns: "property",
                  defaultValue: "Beschreibung",
                })}
              </h2>

              {property.description ? (
                <p className="mt-4 whitespace-pre-line leading-8 text-slate-700 dark:text-slate-300">
                  {property.description}
                </p>
              ) : (
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                  {t("noDescription", {
                    ns: "property",
                    defaultValue: "Keine Beschreibung vorhanden.",
                  })}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("featuresTitle", {
                  ns: "listingDetails",
                  defaultValue: "Ausstattung & Highlights",
                })}
              </h2>

              {features.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {features.map((feature, idx) => (
                    <span
                      key={`${feature}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FaCheckCircle className="text-emerald-500" />
                      {feature}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                  {t("featuresFallback", {
                    ns: "listingDetails",
                    defaultValue: "Keine Ausstattung hinterlegt.",
                  })}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("detailsTitle", {
                  ns: "property",
                  defaultValue: "Objektdetails",
                })}
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label={t("city", { ns: "property", defaultValue: "Stadt" })}
                  value={property.city || "—"}
                />
                <DetailRow
                  label={t("price", { ns: "property", defaultValue: "Preis" })}
                  value={formattedPrice}
                />
                <DetailRow
                  label={t("type", { ns: "property", defaultValue: "Immobilientyp" })}
                  value={type || "—"}
                />
                <DetailRow
                  label={t("purpose", { ns: "property", defaultValue: "Zweck" })}
                  value={
                    purpose === "rent"
                      ? t("rent", { ns: "property", defaultValue: "Miete" })
                      : t("buy", { ns: "property", defaultValue: "Kauf" })
                  }
                />
                <DetailRow
                  label={t("yearBuilt", { ns: "property", defaultValue: "Baujahr" })}
                  value={property.yearBuilt || property.buildYear || "—"}
                />
                <DetailRow
                  label={t("size", { ns: "property", defaultValue: "Fläche" })}
                  value={property.size != null ? `${property.size} m²` : "—"}
                />
              </div>
            </div>

            {/* Similar */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("similarTitle", {
                  ns: "listingDetails",
                  defaultValue: "Ähnliche Immobilien",
                })}
              </h2>

              <div className="mt-5">
                <SimilarListings
                  currentListing={property}
                  allListings={allListings}
                  limit={4}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">
            {/* Contact Card */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("contactAgent", {
                  ns: "property",
                  defaultValue: "Verkäufer kontaktieren",
                })}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {t("contactHint", {
                  ns: "property",
                  defaultValue:
                    "Nehmen Sie direkt Kontakt mit dem:der Anbieter:in auf oder senden Sie ein Angebot für diese Immobilie.",
                })}
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("agent", { ns: "property", defaultValue: "Ansprechperson" })}
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {property.agent?.name || property.ownerName || "—"}
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <FaPhone className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {property.agent?.phone || property.ownerPhone || "—"}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <FaEnvelope className="text-blue-600 dark:text-blue-400" />
                  <span className="break-all text-sm text-slate-700 dark:text-slate-300">
                    {property.agent?.email || property.ownerEmail || "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t("buttons.send", {
                    ns: "contact",
                    defaultValue: "Verkäufer kontaktieren",
                  })}
                </button>

                <button
                  type="button"
                  onClick={() => setOfferOpen(true)}
                  className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  {t("makeOfferButton", {
                    ns: "offer",
                    defaultValue: "Kaufangebot abgeben",
                  })}
                </button>
              </div>
            </div>

            {/* Trust Card */}
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-600 dark:text-blue-400">
                  <FaInfoCircle />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("trustTitle", {
                      ns: "listingDetails",
                      defaultValue: "Hinweis",
                    })}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {t("trustText", {
                      ns: "listingDetails",
                      defaultValue:
                        "Alle Angaben basieren auf den vom Anbieter bereitgestellten Informationen. Bitte prüfen Sie wichtige Details vor einer endgültigen Entscheidung.",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {/* Modals */}
      <ContactOwnerModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        ownerEmail={property?.agent?.email || property?.ownerEmail || null}
        listing={property}
      />

      <MakeOfferModal
        isOpen={offerOpen}
        onClose={() => setOfferOpen(false)}
        listing={property}
        ownerId={property?.ownerId || property?.userId || null}
        ownerEmail={property?.agent?.email || property?.ownerEmail || null}
      />
    </>
  );
};

function FactCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

export default PropertyDetails;