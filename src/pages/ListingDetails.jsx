// src/pages/ListingDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MapComponent from "../components/MapComponent";
import ContactOwnerModal from "../components/ContactOwnerModal";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";

const ListingDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation("listingDetails");

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (loading) return <div className="text-center py-20">{t("loading")}</div>;
  if (!listing) return <div className="text-center py-20">{t("notFound")}</div>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // ── SEO values ────────────────────────────────────────────────────────────────
  const title = listing?.title || t("seo.fallbackTitle", { defaultValue: "Listing" });

  const descParts = [];
  if (listing?.city) descParts.push(listing.city);
  if (listing?.area) descParts.push(`${listing.area} m²`);
  if (listing?.rooms) descParts.push(`${listing.rooms} ${t("roomsShort", { defaultValue: "Zi." })}`);
  if (listing?.price) descParts.push(`€${listing.price}`);
  const description =
    descParts.join(" · ") ||
    t("seo.fallbackDesc", { defaultValue: "Immobilienangebot – Details & Bilder." });

  const canonical = `${window.location.origin}/listing/${id}`;
  const firstImage =
    (listing?.imageUrls && listing.imageUrls[0]) ||
    listing?.imageUrl ||
    `${window.location.origin}/og/og-listing.jpg`; // fallback

  const lang = i18n.language?.slice(0, 2) || "de";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ✅ SEO */}
      <SiteMeta
        title={title}
        description={description}
        canonical={canonical}
        ogImage={firstImage}
        lang={lang}
      />

      <div className="relative">
        {listing.isPremium && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-white px-3 py-1 rounded-full z-10 shadow">
            PREMIUM
          </span>
        )}

        {(listing.imageUrls || []).length > 0 ? (
          <Slider {...sliderSettings}>
            {(listing.imageUrls || []).map((url, idx) => (
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
            src={firstImage}
            alt={listing.title || "listing"}
            className="w-full h-96 object-cover rounded"
          />
        )}
      </div>

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
        {t("address")}: {listing.city}
      </p>

      <p className="text-gray-800">
        {t("rooms")}: {listing.rooms}
      </p>

      <p className="text-gray-800">
        {t("area")}: {listing.area} m²
      </p>

      <p className="mt-4 text-gray-800">
        {t("description")}: {listing.description}
      </p>

      {listing.location?.lat && listing.location?.lng && (
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">{t("location")}</h2>
          <MapComponent
            lat={listing.location.lat}
            lng={listing.location.lng}
            address={listing.location.address || listing.city}
          />
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
        >
          {t("contactSeller")}
        </button>
      </div>

      <ContactOwnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ownerEmail={listing.ownerEmail}
      />
    </div>
  );
};

export default ListingDetails;
