// src/components/FavoriteButton.jsx
import React, { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase-config';

const FavoriteButton = ({ listingId, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setIsFavorite(data.favorites?.includes(listingId));
      }
    };
    checkFavorite();
  }, [listingId]);

  const toggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Bitte loggen Sie sich ein.');
    const userRef = doc(db, 'users', user.uid);
    const action = isFavorite ? arrayRemove(listingId) : arrayUnion(listingId);
    await updateDoc(userRef, { favorites: action });
    setIsFavorite(!isFavorite);
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`text-xl text-red-500 hover:text-red-600 ${className}`}
      aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
