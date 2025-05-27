// src/components/FavoriteButton.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase-config';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const FavoriteButton = ({ listingId, className }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!auth.currentUser) return;
      const ref = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setIsFavorite(data.favorites?.includes(listingId));
      }
    };
    fetchFavorites();
  }, [listingId]);

  const toggleFavorite = async () => {
    if (!auth.currentUser) return alert('Bitte zuerst einloggen!');
    const ref = doc(db, 'users', auth.currentUser.uid);
    setIsFavorite((prev) => !prev);
    await updateDoc(ref, {
      favorites: isFavorite ? arrayRemove(listingId) : arrayUnion(listingId),
    });
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`text-xl text-red-500 hover:scale-110 transition ${className}`}
      aria-label="Favorit umschalten"
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
