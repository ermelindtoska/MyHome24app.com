// src/pages/ListingDetails.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MapComponent from "../components/MapComponent";
import ContactOwnerModal from "../components/ContactOwnerModal";
import OfferModal from "../components/OfferModal";          // ✅ NEW
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import { useAuth } from "../context/AuthContext";           // ✅ NEW

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
  const { t, i18n } = useTranslation(["listingDetails", "offers"]);
  const { currentUser } = useAuth();                      // ✅ për të ditur kush është

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);  // ✅ modal i ofertës

  // -------------------------------------------------------
  // Fetch listing
  // -------------------------------------------------------
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const ref = doc(db, "listings", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setListing({ id: snap.id, ...snap.data() });
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

  if (loading) return <div className="text-center py-20">{t("loading")}</div>;
  if (!listing)
    return <div className="text-center py-20">{t("notFound")}</div>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const area = listing.area ?? listing.size ?? null;

  // -------------------------------------------------------
  // SEO
  // -------------------------------------------------------
  const title =
    listing?.title ||
    t("seo.fallbackTitle", { defaultValue: "Listing" });

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

  // -------------------------------------------------------
  // Lokacioni
  // -------------------------------------------------------
  const locationLat =
    listing.location?.lat ?? listing.lat ?? null;
  const locationLng =
    listing.location?.lng ?? listing.lng ?? null;
  const locationAddress =
    listing.location?.address || listing.address || listing.city;

  // -------------------------------------------------------
  // Kush është pronari? (ownerId ose userId)
  // -------------------------------------------------------
  const ownerId = listing.ownerId || listing.userId || null;
  const isOwner = currentUser?.uid && ownerId === currentUser.uid;
  const isLoggedIn = !!currentUser;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ✅ SEO */}
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        ogImage={mainImage}
        lang={lang}
      />

      {/* ---------------------------------------------------
          Header me slider
      ---------------------------------------------------- */}
      <div className="relative">
        {listing.isPremium && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-white px-3 py-1 rounded-full z-10 shadow">
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
                className="w-full h-96 object-cover rounded"
              />
            ))}
          </Slider>
        ) : (
          <img
            src={allImages[0]}
            alt={listing.title || "listing"}
            className="w-full h-96 object-cover rounded"
          />
        )}
      </div>

      {/* ---------------------------------------------------
          Info kryesore
      ---------------------------------------------------- */}
      <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>

      <p className="text-gray-600 text-sm mb-2">
        {t("createdAt")}:{" "}
        {listing.createdAt?.toDate?.()
          ? listing.createdAt.toDate().toLocaleDateString("de-DE")
          : "—"}
      </p>

      <p className="text-xl text-blue-600 font-semibold">
        {t("price")}: {listing.price} €
      </p>

      <p className="mt-2 text-gray-700">
        {t("address")}: {listing.address || listing.city}
      </p>

      {listing.rooms != null && (
        <p className="text-gray-800">
          {t("rooms")}: {listing.rooms}
        </p>
      )}

      {area != null && (
        <p className="text-gray-800">
          {t("area")}: {area} m²
        </p>
      )}

      {/* ---------------------------------------------------
          Butonat: Kontakt & Angebot
      ---------------------------------------------------- */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setIsContactOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          {t("contactSeller")}
        </button>

        {/* ✅ Oferta shfaqet vetëm nëse s’je pronar */}
        {!isOwner && (
          <button
            onClick={() => setIsOfferOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition"
          >
            {t("offers:makeOfferButton", {
              defaultValue: "Angebot machen",
            })}
          </button>
        )}

        {/* nëse s’është loguar, mund të tregosh një hint të vogël */}
        {!isLoggedIn && (
          <p className="text-xs text-gray-500 self-center">
            {t("offers:loginHint", {
              defaultValue: "Bitte einloggen, um ein Angebot abzugeben.",
            })}
          </p>
        )}
      </div>

      {/* ---------------------------------------------------
          Përshkrimi
      ---------------------------------------------------- */}
      <p className="mt-4 text-gray-800">
        {t("description")}: {listing.description}
      </p>

      {/* ---------------------------------------------------
          Harta
      ---------------------------------------------------- */}
      {locationLat != null && locationLng != null && (
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("location")}
          </h2>
          <MapComponent
            lat={locationLat}
            lng={locationLng}
            address={locationAddress}
          />
        </div>
      )}

      {/* ---------------------------------------------------
          Kontakt Modal
      ---------------------------------------------------- */}
      <ContactOwnerModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        ownerEmail={listing.ownerEmail}
        listing={listing}
      />

      {/* ---------------------------------------------------
          Offer Modal (formulari i ofertës)
      ---------------------------------------------------- */}
      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        listing={listing}
      />
    </div>
  );
};

export default ListingDetails;
