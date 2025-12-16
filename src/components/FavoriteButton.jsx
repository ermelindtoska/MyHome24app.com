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
    window.dispatchEvent(new CustomEvent("mh24:toast", { detail: { message } }));
  } catch {
    // ignore
  }
}

const FavoriteButton = ({ listingId, className = "", variant = "icon" }) => {
  const { t } = useTranslation(["listing", "listingDetails"]);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const id = useMemo(() => String(listingId ?? ""), [listingId]);

  useEffect(() => {
    let mounted = true;

    const fetchFavorite = async () => {
      if (!user || !id) {
        if (mounted) setIsFavorite(false);
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!mounted) return;

        if (snap.exists()) {
          const favorites = snap.data()?.favorites || [];
          setIsFavorite(Array.isArray(favorites) && favorites.includes(id));
        } else {
          // user doc missing -> treat as no favorites
          setIsFavorite(false);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error?.message || error);
      }
    };

    fetchFavorite();
    return () => {
      mounted = false;
    };
  }, [user, id]);

  const ensureUserDoc = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      // minimal safe doc (mos e prish strukturën tënde)
      await setDoc(
        userRef,
        {
          favorites: [],
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }
  };

  const toggleFavorite = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!id) return;

    if (!user) {
      // Zillow-ish: toast + redirect opsional
      dispatchMiniToast(
        t("please_login_to_favorite", {
          ns: "listing",
          defaultValue: "Bitte einloggen, um Favoriten zu speichern.",
        })
      );
      navigate("/login");
      return;
    }

    if (loading) return;

    const next = !isFavorite;
    setIsFavorite(next); // ✅ optimistic UI
    setLoading(true);

    try {
      await ensureUserDoc();

      const userRef = doc(db, "users", user.uid);
      const action = next ? arrayUnion(id) : arrayRemove(id);
      await updateDoc(userRef, { favorites: action });

      dispatchMiniToast(
        next
          ? t("toastSaved", {
              ns: "listingDetails",
              defaultValue: "Gespeichert",
            })
          : t("toastRemoved", {
              ns: "listingDetails",
              defaultValue: "Entfernt",
            })
      );
    } catch (error) {
      console.error("Error updating favorites:", error?.message || error);

      // rollback optimistic update
      setIsFavorite(!next);

      dispatchMiniToast(
        t("toastFavoriteFailed", {
          ns: "listingDetails",
          defaultValue: "Aktion fehlgeschlagen",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const aria = isFavorite
    ? t("remove_from_favorites", {
        ns: "listing",
        defaultValue: "Aus Favoriten entfernen",
      })
    : t("add_to_favorites", {
        ns: "listing",
        defaultValue: "Zu Favoriten hinzufügen",
      });

  // variant: "icon" (default) ose "pill" nëse e do si button Zillow
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading}
        className={`h-10 px-3 rounded-full border text-sm font-semibold transition
          ${
            isFavorite
              ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
          }
          ${loading ? "opacity-70 cursor-not-allowed" : ""}
          ${className}`}
        aria-label={aria}
        title={aria}
      >
        {isFavorite
          ? t("saved", { ns: "listingDetails", defaultValue: "Gespeichert" })
          : t("save", { ns: "listingDetails", defaultValue: "Speichern" })}
      </button>
    );
  }

  // icon-only (për Sidebar + top-right actions)
  return (
    <button
      type="button"
       onClick={(e) => {
        e.stopPropagation();        // ✅ wichtig
        toggleFavorite();
      }}
      disabled={loading}
      className={`text-xl transition duration-200 ${
        isFavorite
          ? "text-rose-500 hover:text-rose-600"
          : "text-gray-400 hover:text-rose-500"
      } ${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      aria-label={aria}
      title={aria}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
