// src/pages/ListingDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-20">Lädt...</div>;
  if (!listing) return <div className="text-center py-20">Nicht gefunden.</div>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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
        Veröffentlicht am: {listing.createdAt?.toDate().toLocaleDateString('de-DE')}
      </p>
      <p className="text-xl text-blue-600 font-semibold">{listing.price} €</p>
      <p className="mt-2 text-gray-700">{listing.city}</p>
      <p className="mt-4 text-gray-800">Typ: {listing.type}</p>
      <p className="text-gray-800">Zweck: {listing.purpose}</p>
    </div>
  );
};

export default ListingDetails;
