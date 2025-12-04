// src/pages/ListingDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
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

const ListingDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation("listingDetails");
  const { currentUser } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const allImages = useMemo(() => {
    if (!listing) return [];
    if (Array.isArray(listing.images) && listing.images.length) {
      return listing.images;
    }
    if (Array.isArray(listing.imageUrls) && listing.imageUrls.length) {
      return listing.imageUrls;
    }
    if (listing.imageUrl) return [listing.imageUrl];
    if (listing.primaryImageUrl) return [listing.primaryImageUrl];
    return [FALLBACK_IMG];
  }, [listing]);

  if (loading) {
    return <div className="py-20 text-center">{t("loading")}</div>;
  }

  if (!listing) {
    return <div className="py-20 text-center">{t("notFound")}</div>;
  }

  // ===== SEO =====
  const area = listing.area ?? listing.size ?? null;

  const title =
    listing?.title || t("seo.fallbackTitle", { defaultValue: "Listing" });

  const descParts = [];
  if (listing?.city) descParts.push(listing.city);
  if (area) descParts.push(`${area} m²`);
  if (listing?.rooms)
    descParts.push(
      `${listing.rooms} ${t("roomsShort", { defaultValue: "Zi." })}`
    );
  if (listing?.price) descParts.push(`€${listing.price}`);
  const description =
    descParts.join(" · ") ||
    t("seo.fallbackDesc", {
      defaultValue: "Immobilienangebot – Details & Bilder.",
    });

  const canonical = `${window.location.origin}/listing/${id}`;
  const mainImage = firstImage(listing);
  const lang = i18n.language?.slice(0, 2) || "de";

  // ===== Location / Map =====
  const locationLat = listing.location?.lat ?? listing.lat ?? null;
  const locationLng = listing.location?.lng ?? listing.lng ?? null;
  const locationAddress =
    listing.location?.address || listing.address || listing.city;

  // ===== Owner / Role =====
  const isOwner =
    !!currentUser &&
    (listing.ownerId === currentUser.uid ||
      listing.userId === currentUser.uid);

  const ownerEmail = listing.ownerEmail || listing.userEmail || null;

  // ===== CTA handlers =====
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
    // nëse do më vonë mund të lejojmë vetëm për purpose === "buy"
    setIsOfferOpen(true);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      {/* SEO */}
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        ogImage={mainImage}
        lang={lang}
      />

      {/* Bilder */}
      <div className="relative">
        {listing.isPremium && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-yellow-400 px-3 py-1 text-white shadow">
            PREMIUM
          </span>
        )}

        {allImages.length > 1 ? (
          <Slider {...sliderSettings}>
            {allImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${listing.title || "listing"}-${idx + 1}`}
                className="h-96 w-full rounded-xl object-cover"
              />
            ))}
          </Slider>
        ) : (
          <img
            src={allImages[0]}
            alt={listing.title || "listing"}
            className="h-96 w-full rounded-xl object-cover"
          />
        )}
      </div>

      {/* Meta */}
      <h1 className="mt-6 text-3xl font-bold">{listing.title}</h1>

      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        {t("createdAt")}:{" "}
        {listing.createdAt?.toDate?.()
          ? listing.createdAt.toDate().toLocaleDateString("de-DE")
          : "—"}
      </p>

      <p className="text-xl font-semibold text-blue-500 dark:text-blue-400">
        {t("price")}: {listing.price} €
      </p>

      <p className="mt-2 text-gray-700 dark:text-gray-200">
        {t("address")}: {listing.address || listing.city}
      </p>

      {listing.rooms != null && (
        <p className="mt-1 text-gray-800 dark:text-gray-100">
          {t("rooms")}: {listing.rooms}
        </p>
      )}

      {area != null && (
        <p className="text-gray-800 dark:text-gray-100">
          {t("area")}: {area} m²
        </p>
      )}

      {listing.description && (
        <p className="mt-4 whitespace-pre-line text-gray-800 dark:text-gray-100">
          {t("description")}: {listing.description}
        </p>
      )}

      {/* Karte */}
      {locationLat != null && locationLng != null && (
        <div className="my-6">
          <h2 className="mb-2 text-xl font-semibold">{t("location")}</h2>
          <MapComponent
            lat={locationLat}
            lng={locationLng}
            address={locationAddress}
          />
        </div>
      )}

      {/* Kontakt & Angebot Box */}
      <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-6 py-5 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 text-lg font-semibold">
            {t("contactBox.title", {
              defaultValue: "Verkäufer kontaktieren",
            })}
          </h2>
          <p className="max-w-xl text-sm text-gray-600 dark:text-gray-300">
            {t("contactBox.text", {
              defaultValue:
                "Sie erreichen den:die Anbieter:in per E-Mail oder über das Kontaktformular. Wir melden uns so schnell wie möglich bei Ihnen.",
            })}
          </p>

          {!currentUser && (
            <p className="mt-2 text-xs text-gray-500">
              {t("loginToContact", {
                defaultValue:
                  "Bitte melden Sie sich an, um den Verkäufer zu kontaktieren.",
              })}
            </p>
          )}

          {isOwner && (
            <p className="mt-2 text-xs text-amber-400">
              {t("youAreOwner", {
                defaultValue:
                  "Sie sind der:die Eigentümer:in dieser Anzeige.",
              })}
            </p>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row md:mt-0">
          <button
            type="button"
            onClick={handleContactClick}
            disabled={isOwner}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              isOwner
                ? "cursor-not-allowed bg-gray-500 text-white"
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
            className={`inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              isOwner
                ? "cursor-not-allowed border-gray-600 text-gray-400"
                : "border-emerald-500 text-emerald-300 hover:bg-emerald-500/10"
            }`}
          >
            {t("makeOffer", {
              defaultValue: "Kaufangebot abgeben",
            })}
          </button>
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
};

export default ListingDetails;
