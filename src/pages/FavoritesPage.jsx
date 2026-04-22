// src/pages/FavoritesPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  documentId,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";
import PropertyCard from "../components/PropertyCard";
import { toast } from "sonner";
import { FaHeart, FaRegHeart, FaArrowRight, FaBalanceScale } from "react-icons/fa";
import { MdOutlineStar, MdOutlineDeleteSweep } from "react-icons/md";

// Firestore "in" erlaubt max. 10 IDs -> chunk
function chunkArray(arr = [], size = 10) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function avgRating(list = []) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const sum = list.reduce((acc, c) => acc + (Number(c?.rating) || 0), 0);
  return (sum / list.length).toFixed(1);
}

export default function FavoritesPage() {
  const { t, i18n } = useTranslation("favorites");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [comments, setComments] = useState({}); // { [listingId]: comment[] }
  const [newComments, setNewComments] = useState({}); // { [listingId]: {name,text,rating} }

  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);

  const unsubsRef = useRef({}); // snapshot unsub pro listingId

  // -----------------------------
  // AUTH GUARD + LOAD FAVORITES
  // -----------------------------
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent("/favorites")}`, { replace: true });
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setFavoriteIds([]);
          setFavorites([]);
          setLoading(false);
          return;
        }

        const favIds = snap.data()?.favorites || [];
        setFavoriteIds(favIds);

        if (!favIds.length) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Listings effizient holen (nicht alle listings laden!)
        const idsChunks = chunkArray(favIds, 10);
        const all = [];

        for (const ids of idsChunks) {
          const q = query(
            collection(db, "listings"),
            where(documentId(), "in", ids)
          );
          const qs = await getDocs(q);
          qs.forEach((d) => all.push({ id: d.id, ...d.data() }));
        }

        // optional: sortiere in der Reihenfolge der IDs (damit UI stabil bleibt)
        const byId = new Map(all.map((x) => [x.id, x]));
        const ordered = favIds.map((id) => byId.get(id)).filter(Boolean);

        setFavorites(ordered);
      } catch (err) {
        console.error("[FavoritesPage] load error:", err);
        toast.error(t("toast.loadErrorTitle", { defaultValue: "Fehler" }), {
          description: t("toast.loadErrorDesc", {
            defaultValue: "Favoriten konnten nicht geladen werden.",
          }),
        });
        setFavorites([]);
        setFavoriteIds([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, t]);

  // -----------------------------
  // COMMENTS SNAPSHOTS (CLEAN)
  // -----------------------------
  useEffect(() => {
    // cleanup alte listeners
    Object.values(unsubsRef.current).forEach((u) => {
      try {
        u?.();
      } catch {}
    });
    unsubsRef.current = {};
    setComments({});

    if (!favorites.length) return;

    favorites.forEach((fav) => {
      const commentsRef = collection(db, "listings", fav.id, "comments");
      const q = query(commentsRef, orderBy("createdAt", "desc"));

      const unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setComments((prev) => ({ ...prev, [fav.id]: list }));
        },
        (err) => {
          console.warn("[FavoritesPage] comments snapshot error:", fav.id, err);
        }
      );

      unsubsRef.current[fav.id] = unsub;
    });

    return () => {
      Object.values(unsubsRef.current).forEach((u) => {
        try {
          u?.();
        } catch {}
      });
      unsubsRef.current = {};
    };
  }, [favorites]);

  // -----------------------------
  // UI HELPERS
  // -----------------------------
  const handleCommentChange = (listingId, field, value) => {
    setNewComments((prev) => ({
      ...prev,
      [listingId]: {
        name:
          prev?.[listingId]?.name ??
          auth.currentUser?.displayName ??
          "",
        rating: prev?.[listingId]?.rating ?? 5,
        text: prev?.[listingId]?.text ?? "",
        ...prev?.[listingId],
        [field]: value,
      },
    }));
  };

  const submitComment = async (listingId) => {
    const data = newComments?.[listingId] || {};
    const name = String(data?.name || "").trim();
    const text = String(data?.text || "").trim();
    const rating = Number(data?.rating || 0);

    if (!name || !text || !(rating >= 1 && rating <= 5)) {
      toast.error(t("toast.validationTitle", { defaultValue: "Bitte prüfen" }), {
        description: t("toast.validationDesc", {
          defaultValue: "Name, Nachricht und Bewertung (1–5) sind erforderlich.",
        }),
      });
      return;
    }

    try {
      await addDoc(collection(db, "listings", listingId, "comments"), {
        name,
        text,
        rating,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || null,
      });

      setNewComments((prev) => ({
        ...prev,
        [listingId]: { name: "", text: "", rating: 5 },
      }));

      toast.success(t("toast.commentSentTitle", { defaultValue: "Gesendet" }), {
        description: t("toast.commentSentDesc", {
          defaultValue: "Dein Kommentar wurde gespeichert.",
        }),
      });
    } catch (err) {
      console.error("[FavoritesPage] submitComment error:", err);
      toast.error(t("toast.commentErrorTitle", { defaultValue: "Fehler" }), {
        description: t("toast.commentErrorDesc", {
          defaultValue: "Kommentar konnte nicht gesendet werden.",
        }),
      });
    }
  };

  const toggleCompare = (id) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCompareItems = useMemo(() => {
    const map = new Map(favorites.map((x) => [x.id, x]));
    return compareList
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((fav) => ({
        id: fav.id,
        title: fav.title,
        city: fav.city,
        price: fav.price,
        size: fav.size,
        imageUrl: fav.imageUrl || fav.coverImage || fav.images?.[0] || null,
        avgRating: avgRating(comments[fav.id]),
      }));
  }, [compareList, favorites, comments]);

  const goToComparePage = () => {
    if (selectedCompareItems.length < 2) {
      toast.error(t("toast.compareMinTitle", { defaultValue: "Zu wenig Auswahl" }), {
        description: t("toast.compareMinDesc", {
          defaultValue: "Bitte wähle mindestens 2 Favoriten zum Vergleichen aus.",
        }),
      });
      return;
    }
    navigate("/compare", { state: { listings: selectedCompareItems } });
  };

  const clearCompare = () => setCompareList([]);

  // -----------------------------
  // SEO
  // -----------------------------
  const metaTitle = t("meta.title", {
    defaultValue: "Favoriten – MyHome24App",
  });
  const metaDesc = t("meta.description", {
    defaultValue:
      "Speichere und verwalte deine Favoriten. Vergleiche Listings, lies Bewertungen und kontaktiere Anbieter:innen – wie bei Zillow.",
  });

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={metaTitle}
        description={metaDesc}
        canonical={`${window.location.origin}/favorites`}
        ogImage={`${window.location.origin}/og/og-favorites.jpg`}
        lang={lang}
      />

      {/* TOP HEADER */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <nav className="text-xs text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:underline">
                {t("breadcrumb.home", { defaultValue: "Home" })}
              </Link>{" "}
              <span className="mx-1">/</span>
              <span className="text-slate-700 dark:text-slate-200">
                {t("breadcrumb.favorites", { defaultValue: "Favoriten" })}
              </span>
            </nav>

            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <FaHeart className="text-rose-500" />
              {t("title", { defaultValue: "Deine Favoriten" })}
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("subtitle", {
                defaultValue:
                  "Hier findest du gespeicherte Listings. Wähle mehrere aus, um sie zu vergleichen.",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200">
              {t("count", { defaultValue: "Gesamt" })}:{" "}
              <span className="font-extrabold">{favorites.length}</span>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t("actions.explore", { defaultValue: "Weiter suchen" })}
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* STICKY COMPARE BAR */}
      {compareList.length > 0 && (
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FaBalanceScale />
              {t("compareBar.selected", { defaultValue: "Ausgewählt" })}:{" "}
              <span className="font-extrabold">{compareList.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("compareBar.hint", { defaultValue: "(max. sinnvoll: 3)" })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <MdOutlineDeleteSweep className="mr-2 text-base" />
                {t("compareBar.clear", { defaultValue: "Auswahl löschen" })}
              </button>

              <button
                type="button"
                onClick={goToComparePage}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                {t("compareBar.go", { defaultValue: "Vergleichen" })}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 pb-12 pt-6">
        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse dark:bg-slate-900/60 dark:border-slate-800"
              >
                <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <FaRegHeart className="text-rose-500 text-xl" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-extrabold">
                  {t("empty.title", { defaultValue: "Noch keine Favoriten" })}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {t("empty.text", {
                    defaultValue:
                      "Speichere Listings mit dem Herz-Icon. Danach kannst du sie hier vergleichen und schneller entscheiden.",
                  })}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/buy"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {t("empty.ctaBuy", { defaultValue: "Kaufen entdecken" })}
                    <FaArrowRight className="ml-2" />
                  </Link>
                  <Link
                    to="/rent"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    {t("empty.ctaRent", { defaultValue: "Mieten entdecken" })}
                  </Link>
                </div>

                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MdOutlineStar className="text-base" />
                  {t("empty.tip", {
                    defaultValue:
                      "Tipp: Wähle 2–3 Favoriten aus, um sie im Vergleich nebeneinander zu sehen.",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <PropertyCard
                key={fav.id}
                item={fav}
                showComments={true}
                comments={comments[fav.id]}
                newComment={newComments[fav.id]}
                onCommentChange={handleCommentChange}
                onSubmitComment={() => submitComment(fav.id)}
                showCompare={true}
                isInCompare={compareList.includes(fav.id)}
                toggleCompare={() => toggleCompare(fav.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}