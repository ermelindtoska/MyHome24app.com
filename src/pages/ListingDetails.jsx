// src/pages/ListingDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import MapComponent from '../components/MapComponent';
import ContactOwnerModal from '../components/ContactOwnerModal';
import { useTranslation } from 'react-i18next';

const ListingDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation('listingDetails');
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const ref = doc(db, 'listings', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setListing({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="text-center py-20">{t('loading')}</div>;
  if (!listing) return <div className="text-center py-20">{t('notFound')}</div>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="relative">
        {listing.isPremium && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-white px-3 py-1 rounded-full z-10 shadow">
            PREMIUM
          </span>
        )}
        <Slider {...sliderSettings}>
          {(listing.imageUrls || []).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`listing-${idx}`}
              className="w-full h-96 object-cover rounded"
            />
          ))}
        </Slider>
      </div>

      <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>
      <p className="text-gray-600 text-sm mb-2">
        {t('createdAt')}: {listing.createdAt?.toDate().toLocaleDateString('de-DE')}
      </p>
      <p className="text-xl text-blue-600 font-semibold">{t('price')}: {listing.price} €</p>
      <p className="mt-2 text-gray-700">{t('address')}: {listing.city}</p>
      <p className="text-gray-800">{t('rooms')}: {listing.rooms}</p>
      <p className="text-gray-800">{t('area')}: {listing.area} m²</p>
      <p className="mt-4 text-gray-800">{t('description')}: {listing.description}</p>

      {listing.location?.lat && listing.location?.lng && (
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">{t('location')}</h2>
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
          {t('contactSeller')}
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
