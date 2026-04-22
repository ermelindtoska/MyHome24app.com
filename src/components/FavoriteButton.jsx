// src/components/FavoriteButton.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function dispatchMiniToast(message) {
  try {
    window.dispatchEvent(
      new CustomEvent("mh24:toast", { detail: { message } })
    );
  } catch {}
}

const FavoriteButton = ({ listingId, className = "", variant = "icon" }) => {
  const { t } = useTranslation(["listing", "listingDetails"]);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const id = useMemo(() => String(listingId ?? ""), [listingId]);

  // ✅ LOAD FAVORITES
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user || !id) {
        if (mounted) setIsFavorite(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!mounted) return;

        if (snap.exists()) {
          const favs = snap.data()?.favorites || [];
          setIsFavorite(favs.includes(id));
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error("Favorite load error:", err);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user, id]);

  // ✅ ENSURE USER DOC (FIXED)
  const ensureUserDoc = async () => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(
        ref,
        {
          favorites: [],
        },
        { merge: true }
      );
    } else {
      // ✅ ensure favorites exists
      const data = snap.data();
      if (!Array.isArray(data.favorites)) {
        await updateDoc(ref, { favorites: [] });
      }
    }
  };

  // ✅ TOGGLE FAVORITE (FIXED)
  const toggleFavorite = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!id) return;

    if (!user) {
      dispatchMiniToast(
        t("please_login_to_favorite", {
          defaultValue: "Bitte einloggen",
        })
      );
      navigate("/login");
      return;
    }

    if (loading) return;

    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    setLoading(true);

    try {
      await ensureUserDoc();

      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        favorites: next ? arrayUnion(id) : arrayRemove(id),
      });

      dispatchMiniToast(
        next
          ? t("toastSaved", { ns: "listingDetails" })
          : t("toastRemoved", { ns: "listingDetails" })
      );
    } catch (err) {
      console.error("Favorite error:", err);

      setIsFavorite(!next); // rollback

      dispatchMiniToast(
        t("toastFavoriteFailed", {
          defaultValue: "Fehler",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const aria = isFavorite
    ? "Remove from favorites"
    : "Add to favorites";

  // ✅ PILL VERSION (Zillow style button)
  if (variant === "pill") {
    return (
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`h-10 px-4 rounded-full font-semibold transition
        ${
          isFavorite
            ? "bg-rose-600 text-white"
            : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
        }`}
      >
        {isFavorite ? "Saved" : "Save"}
      </button>
    );
  }

  // ✅ ICON VERSION (FIXED CLICK)
  return (
    <button
      onClick={toggleFavorite}   // ✅ FIX CRITICAL
      disabled={loading}
      className={`text-xl transition ${
        isFavorite
          ? "text-rose-500"
          : "text-gray-400 hover:text-rose-500"
      } ${loading ? "opacity-50" : ""} ${className}`}
      aria-label={aria}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;