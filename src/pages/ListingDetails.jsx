// src/pages/ListingDetails.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import MapComponent from '../components/MapComponent';
import { useTranslation } from 'react-i18next';
import SiteMeta from '../components/SEO/SiteMeta';

// 🔵 modal për kontakt pronari/makler
import ContactOwnerModal from '../components/ContactOwnerModal';
// për user-in aktual
import { useAuth } from '../context/AuthContext';

const FALLBACK_IMG = '/images/hero-1.jpg';

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
  const { t, i18n } = useTranslation('listingDetails');
  const { currentUser } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const ref = doc(db, 'listings', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setListing({ id: snap.id, ...snap.data() });
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
    return <div className="text-center py-20">{t('loading')}</div>;
  }

  if (!listing) {
    return <div className="text-center py-20">{t('notFound')}</div>;
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const area = listing.area ?? listing.size ?? null;

  // SEO
  const title =
    listing?.title || t('seo.fallbackTitle', { defaultValue: 'Listing' });

  const descParts = [];
  if (listing?.city) descParts.push(listing.city);
  if (area) descParts.push(`${area} m²`);
  if (listing?.rooms)
    descParts.push(
      `${listing.rooms} ${t('roomsShort', { defaultValue: 'Zi.' })}`,
    );
  if (listing?.price) descParts.push(`€${listing.price}`);
  const description =
    descParts.join(' · ') ||
    t('seo.fallbackDesc', {
      defaultValue: 'Immobilienangebot – Details & Bilder.',
    });

  const canonical = `${window.location.origin}/listing/${id}`;
  const mainImage = firstImage(listing);
  const lang = i18n.language?.slice(0, 2) || 'de';

  // Location
  const locationLat = listing.location?.lat ?? listing.lat ?? null;
  const locationLng = listing.location?.lng ?? listing.lng ?? null;
  const locationAddress =
    listing.location?.address || listing.address || listing.city;

  // është currentUser pronari i këtij listingu?
  const isOwner =
    !!currentUser &&
    (listing.ownerId === currentUser.uid ||
      listing.userId === currentUser.uid);

  // klikimi i butonit "Verkäufer kontaktieren" poshtë hartës
  const handleContactClick = () => {
    // nëse nuk është i loguar → shko te login
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    // nëse është pronar, nuk hapim modal (butoni do jetë disabled gjithsesi)
    if (isOwner) return;

    setIsContactOpen(true);
  };

  const ownerEmail = listing.ownerEmail || listing.userEmail || null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-900 dark:text-gray-100">
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
                alt={`${listing.title || 'listing'}-${idx + 1}`}
                className="w-full h-96 object-cover rounded-xl"
              />
            ))}
          </Slider>
        ) : (
          <img
            src={allImages[0]}
            alt={listing.title || 'listing'}
            className="w-full h-96 object-cover rounded-xl"
          />
        )}
      </div>

      {/* Meta */}
      <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>

      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        {t('createdAt')}:{' '}
        {listing.createdAt?.toDate?.()
          ? listing.createdAt.toDate().toLocaleDateString('de-DE')
          : '—'}
      </p>

      <p className="text-xl text-blue-500 dark:text-blue-400 font-semibold">
        {t('price')}: {listing.price} €
      </p>

      <p className="mt-2 text-gray-700 dark:text-gray-200">
        {t('address')}: {listing.address || listing.city}
      </p>

      {listing.rooms != null && (
        <p className="text-gray-800 dark:text-gray-100 mt-1">
          {t('rooms')}: {listing.rooms}
        </p>
      )}

      {area != null && (
        <p className="text-gray-800 dark:text-gray-100">
          {t('area')}: {area} m²
        </p>
      )}

      {listing.description && (
        <p className="mt-4 text-gray-800 dark:text-gray-100 whitespace-pre-line">
          {t('description')}: {listing.description}
        </p>
      )}

      {/* Karte */}
      {locationLat != null && locationLng != null && (
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">
            {t('location')}
          </h2>
          <MapComponent
            lat={locationLat}
            lng={locationLng}
            address={locationAddress}
          />
        </div>
      )}

      {/* 👉 Kontaktbox direkt unter der Karte – EINZIGER Call-to-Action */}
      <div className="mt-10 bg-slate-900/40 dark:bg-gray-900/60 border border-slate-700/60 rounded-2xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            {t('contactBox.title', { defaultValue: 'Verkäufer kontaktieren' })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
            {t('contactBox.text', {
              defaultValue:
                'Sie erreichen den:die Anbieter:in per E-Mail oder über das Kontaktformular. Wir melden uns so schnell wie möglich bei Ihnen.',
            })}
          </p>
          {!currentUser && (
            <p className="mt-2 text-xs text-gray-500">
              {t('loginToContact', {
                defaultValue: 'Bitte melden Sie sich an, um den Verkäufer zu kontaktieren.',
              })}
            </p>
          )}
          {isOwner && (
            <p className="mt-2 text-xs text-amber-400">
              {t('youAreOwner', {
                defaultValue: 'Sie sind der:die Eigentümer:in dieser Anzeige.',
              })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleContactClick}
          disabled={isOwner}
          className={`self-start md:self-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition ${
            isOwner
              ? 'bg-gray-500 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {t('contactSeller', { defaultValue: 'Kontakt aufnehmen' })}
        </button>
      </div>

      {/* Modal për kontakt – lidhet direkt me Eigentümer/Makler */}
      <ContactOwnerModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        ownerEmail={ownerEmail}
        listing={listing}
      />
    </div>
  );
};

export default ListingDetails;
