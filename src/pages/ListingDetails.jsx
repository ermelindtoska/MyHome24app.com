// src/pages/ListingDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  MdLocationOn,
  MdEuro,
  MdKingBed,
  MdSquareFoot,
  MdCalendarToday,
  MdHomeWork,
  MdArrowBack,
  MdVerified,
  MdInfoOutline,
} from "react-icons/md";
import { db } from "../firebase";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import MapComponent from "../components/MapComponent";

import ContactOwnerModal from "../components/ContactOwnerModal";
import SubmitOfferModal from "../components/SubmitOfferModal";

import { useAuth } from "../context/AuthContext";

const FALLBACK_IMG = "/images/hero-1.jpg";

function firstImage(listing) {
  if (Array.isArray(listing?.images) && listing.images.length > 0) {
    return listing.images[0];
  }
  if (Array.isArray(listing?.imageUrls) && listing.imageUrls.length > 0) {
    return listing.imageUrls[0];
  }
  if (listing?.imageUrl) return listing.imageUrl;
  if (listing?.primaryImageUrl) return listing.primaryImageUrl;
  return FALLBACK_IMG;
}

function getAllImages(listing) {
  if (Array.isArray(listing?.images) && listing.images.length > 0) {
    return listing.images;
  }
  if (Array.isArray(listing?.imageUrls) && listing.imageUrls.length > 0) {
    return listing.imageUrls;
  }
  if (listing?.imageUrl) return [listing.imageUrl];
  if (listing?.primaryImageUrl) return [listing.primaryImageUrl];
  return [FALLBACK_IMG];
}

function formatPrice(value, lang = "de-DE") {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${num} €`;
  }
}

const ListingDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation("listingDetails");
  const { currentUser } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [myOffer, setMyOffer] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const ref = doc(db, "listings", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setListing({ id: snap.id, ...snap.data() });
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error("[ListingDetails] fetchListing error:", err);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchMyOffer = async () => {
      if (!currentUser || !id) return;

      try {
        const qOffers = query(
          collection(db, "offers"),
          where("listingId", "==", id),
          where("buyerId", "==", currentUser.uid)
        );
        const snap = await getDocs(qOffers);

        if (!snap.empty) {
          const d = snap.docs[0];
          setMyOffer({ id: d.id, ...d.data() });
        } else {
          setMyOffer(null);
        }
      } catch (err) {
        console.error("[ListingDetails] fetchMyOffer error:", err);
      }
    };

    fetchMyOffer();
  }, [id, currentUser]);

  const allImages = useMemo(() => getAllImages(listing), [listing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-sm md:text-base">{t("loading", { defaultValue: "Wird geladen..." })}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-lg font-semibold">
            {t("notFound", { defaultValue: "Anzeige nicht gefunden." })}
          </p>
          <Link
            to="/buy"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {t("backToListings", { defaultValue: "Zurück zu den Anzeigen" })}
          </Link>
        </div>
      </div>
    );
  }

  const area = listing.area ?? listing.size ?? null;
  const lang = i18n.language?.slice(0, 2) || "de";
  const locale = lang === "en" ? "en-US" : "de-DE";

  const title =
    listing?.title || t("seo.fallbackTitle", { defaultValue: "Listing" });

  const descParts = [];
  if (listing?.city) descParts.push(listing.city);
  if (area) descParts.push(`${area} m²`);
  if (listing?.rooms) {
    descParts.push(
      `${listing.rooms} ${t("roomsShort", { defaultValue: "Zi." })}`
    );
  }
  if (listing?.price) descParts.push(formatPrice(listing.price, locale));

  const description =
    descParts.join(" · ") ||
    t("seo.fallbackDesc", {
      defaultValue: "Immobilienangebot – Details & Bilder.",
    });

  const canonical = `${window.location.origin}/listing/${id}`;
  const mainImage = firstImage(listing);

  const locationLat =
    listing.location?.lat ??
    listing.latitude ??
    listing.lat ??
    null;

  const locationLng =
    listing.location?.lng ??
    listing.longitude ??
    listing.lng ??
    null;

  const locationAddress =
    listing.location?.address || listing.address || listing.city || "—";

  const isOwner =
    !!currentUser &&
    (listing.ownerId === currentUser.uid || listing.userId === currentUser.uid);

  const ownerEmail = listing.ownerEmail || listing.userEmail || null;

  const handleContactClick = () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    if (isOwner) return;
    setIsContactOpen(true);
  };

  const handleOfferClick = () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    if (isOwner) return;
    setIsOfferOpen(true);
  };

  const sliderSettings = {
    dots: true,
    infinite: allImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: allImages.length > 1,
  };

  const facts = [
    {
      icon: <MdEuro className="text-lg" />,
      label: t("price", { defaultValue: "Preis" }),
      value: formatPrice(listing.price, locale),
    },
    {
      icon: <MdLocationOn className="text-lg" />,
      label: t("address", { defaultValue: "Adresse" }),
      value: listing.address || listing.city || "—",
    },
    {
      icon: <MdKingBed className="text-lg" />,
      label: t("rooms", { defaultValue: "Zimmer" }),
      value: listing.rooms ?? "—",
    },
    {
      icon: <MdSquareFoot className="text-lg" />,
      label: t("area", { defaultValue: "Fläche" }),
      value: area != null ? `${area} m²` : "—",
    },
    {
      icon: <MdHomeWork className="text-lg" />,
      label: t("propertyType", { defaultValue: "Immobilientyp" }),
      value: listing.type || "—",
    },
    {
      icon: <MdCalendarToday className="text-lg" />,
      label: t("createdAt", { defaultValue: "Erstellt am" }),
      value: listing.createdAt?.toDate?.()
        ? listing.createdAt.toDate().toLocaleDateString(locale)
        : "—",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        ogImage={mainImage}
        lang={lang}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Top nav */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to={listing.purpose === "rent" ? "/rent" : "/buy"}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
          >
            <MdArrowBack className="mr-1 text-lg" />
            {t("backToListings", { defaultValue: "Zurück zu den Anzeigen" })}
          </Link>

          {listing.isPremium && (
            <span className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-white shadow">
              <MdVerified className="mr-1" />
              {t("premium", { defaultValue: "Premium" })}
            </span>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr,0.75fr] items-start">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Image slider */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              {allImages.length > 1 ? (
                <Slider {...sliderSettings}>
                  {allImages.map((url, idx) => (
                    <div key={idx}>
                      <img
                        src={url}
                        alt={`${listing.title || "listing"}-${idx + 1}`}
                        className="h-[280px] w-full object-cover md:h-[480px]"
                      />
                    </div>
                  ))}
                </Slider>
              ) : (
                <img
                  src={allImages[0]}
                  alt={listing.title || "listing"}
                  className="h-[280px] w-full object-cover md:h-[480px]"
                />
              )}
            </div>

            {/* Title + description */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                {listing.purpose === "rent"
                  ? t("purposeRent", { defaultValue: "Mieten" })
                  : t("purposeBuy", { defaultValue: "Kaufen" })}
              </p>

              <h1 className="mt-2 text-2xl font-bold md:text-3xl text-slate-900 dark:text-white">
                {listing.title}
              </h1>

              <p className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatPrice(listing.price, locale)}
              </p>

              <p className="mt-3 flex items-center text-sm text-slate-600 dark:text-slate-300">
                <MdLocationOn className="mr-1 text-base" />
                {locationAddress}
              </p>

              {listing.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {t("description", { defaultValue: "Beschreibung" })}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
                    {listing.description}
                  </p>
                </div>
              )}
            </div>

            {/* Facts */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t("keyFacts", { defaultValue: "Wichtige Eckdaten" })}
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {facts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/50"
                  >
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      {fact.icon}
                      <span className="text-xs font-medium">{fact.label}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {locationLat != null && locationLng != null && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {t("location", { defaultValue: "Standort" })}
                </h2>
                <MapComponent
                  lat={locationLat}
                  lng={locationLng}
                  address={locationAddress}
                />
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Contact card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t("contactBox.title", {
                  defaultValue: "Verkäufer kontaktieren",
                })}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {t("contactBox.text", {
                  defaultValue:
                    "Nehmen Sie direkt Kontakt mit dem:der Anbieter:in auf oder senden Sie ein Angebot für diese Immobilie.",
                })}
              </p>

              {!currentUser && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {t("loginToContact", {
                    defaultValue:
                      "Bitte melden Sie sich an, um den Verkäufer zu kontaktieren.",
                  })}
                </p>
              )}

              {isOwner && (
                <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-300">
                  {t("youAreOwner", {
                    defaultValue: "Sie sind der:die Eigentümer:in dieser Anzeige.",
                  })}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleContactClick}
                  disabled={isOwner}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    isOwner
                      ? "cursor-not-allowed bg-slate-300 text-white dark:bg-slate-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {t("contactSeller", {
                    defaultValue: "Kontakt aufnehmen",
                  })}
                </button>

                <button
                  type="button"
                  onClick={handleOfferClick}
                  disabled={isOwner}
                  className={`inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    isOwner
                      ? "cursor-not-allowed border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500"
                      : "border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                  }`}
                >
                  {t("makeOffer", {
                    defaultValue: "Kaufangebot abgeben",
                  })}
                </button>
              </div>
            </div>

            {/* My offer */}
            {myOffer && !isOwner && (
              <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm dark:border-sky-800/70 dark:bg-sky-950/30 md:p-6">
                <h3 className="text-base font-semibold text-sky-900 dark:text-sky-200">
                  {t("myOfferBox.title", {
                    defaultValue: "Dein Angebot zu diesem Inserat",
                  })}
                </h3>

                <p className="mt-3 text-sm text-sky-900 dark:text-sky-100">
                  {t("myOfferBox.amount", { defaultValue: "Betrag:" })}{" "}
                  <span className="font-semibold">
                    {typeof myOffer.amount === "number"
                      ? formatPrice(myOffer.amount, locale)
                      : myOffer.amount}
                  </span>
                </p>

                <p className="mt-2 text-sm text-sky-900 dark:text-sky-100">
                  {t("myOfferBox.status", { defaultValue: "Status:" })}{" "}
                  <span className="font-semibold">
                    {t(`myOfferBox.statusValues.${myOffer.status || "open"}`, {
                      defaultValue: myOffer.status || "open",
                    })}
                  </span>
                </p>

                {myOffer.createdAt?.toDate && (
                  <p className="mt-2 text-xs text-sky-700 dark:text-sky-300">
                    {t("myOfferBox.date", { defaultValue: "Abgegeben am" })}{" "}
                    {myOffer.createdAt.toDate().toLocaleString(locale)}
                  </p>
                )}

                <p className="mt-3 text-xs leading-5 text-sky-700 dark:text-sky-300">
                  {t("myOfferBox.hint", {
                    defaultValue:
                      "Details und Aktionen findest du im Bereich „Meine Angebote“ in deinem Dashboard.",
                  })}
                </p>
              </div>
            )}

            {/* Info note */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <MdInfoOutline className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {t("infoBox.title", { defaultValue: "Hinweis" })}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                    {t("infoBox.text", {
                      defaultValue:
                        "Alle Angaben basieren auf den vom Anbieter bereitgestellten Informationen. Bitte prüfen Sie wichtige Details vor einer endgültigen Entscheidung.",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ContactOwnerModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        ownerEmail={ownerEmail}
        listing={listing}
      />

      <SubmitOfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        listing={listing}
      />
    </main>
  );
};

export default ListingDetails;