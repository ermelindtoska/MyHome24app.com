// src/components/FavoriteButton.jsx
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";

const FavoriteButton = ({ listingId, className = "" }) => {
  const { t } = useTranslation("listing"); // ose ndrysho namespace nëse duhet
  const [user] = useAuthState(auth);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchFavorite = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const favorites = userSnap.data()?.favorites || [];
          setIsFavorite(favorites.includes(listingId));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error.message);
      }
    };

    fetchFavorite();
  }, [user, listingId]);

  const toggleFavorite = async () => {
    if (!user) {
      alert(t("please_login_to_favorite"));
      return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      const action = isFavorite ? arrayRemove(listingId) : arrayUnion(listingId);
      await updateDoc(userRef, { favorites: action });
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error.message);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`text-xl transition duration-200 ${
        isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
      } ${className}`}
      aria-label={isFavorite ? t("remove_from_favorites") : t("add_to_favorites")}
      title={isFavorite ? t("remove_from_favorites") : t("add_to_favorites")}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
