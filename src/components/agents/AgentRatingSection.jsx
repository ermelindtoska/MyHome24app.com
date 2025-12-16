// src/components/agents/AgentRatingSection.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const MAX_STARS = 5;

// Ikonë e thjeshtë ylli me SVG (pa Heroicons)
const Star = ({ filled, className = "" }) => (
  <svg
    viewBox="0 0 20 20"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      className={filled ? "fill-yellow-400" : "fill-slate-600"}
    />
  </svg>
);

const AgentRatingSection = ({ agentId, agentUserId }) => {
  const { t } = useTranslation("agentProfile");
  const { currentUser } = useAuth();

  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwner =
    currentUser?.uid && agentUserId && currentUser.uid === agentUserId;

  // Ngarko vlerësimet
  useEffect(() => {
    if (!agentId) return;

    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "agentRatings"),
          where("agentId", "==", agentId)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRatings(list);

        if (currentUser) {
          const mine = list.find((r) => r.userId === currentUser.uid);
          if (mine) {
            setMyRating(mine.rating || 0);
            setComment(mine.comment || "");
          }
        }
      } catch (err) {
        console.error("[AgentRatingSection] load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [agentId, currentUser]);

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratings.length
      : 0;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error(
        t("rating.loginRequired", {
          defaultValue: "Bitte melde dich an, um eine Bewertung abzugeben.",
        })
      );
      return;
    }

    if (!myRating) {
      toast.error(
        t("rating.noStars", {
          defaultValue: "Bitte wähle zuerst eine Sternbewertung.",
        })
      );
      return;
    }

    setSaving(true);
    try {
      const ratingId = `${agentId}_${currentUser.uid}`;
      await setDoc(
        doc(db, "agentRatings", ratingId),
        {
          agentId,
          userId: currentUser.uid,
          rating: myRating,
          comment: comment.trim(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      const q = query(
        collection(db, "agentRatings"),
        where("agentId", "==", agentId)
      );
      const snap = await getDocs(q);
      setRatings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

      toast.success(
        t("rating.saved", {
          defaultValue: "Deine Bewertung wurde gespeichert.",
        })
      );
    } catch (err) {
      console.error("[AgentRatingSection] save error:", err);
      toast.error(
        t("rating.error", {
          defaultValue:
            "Beim Speichern deiner Bewertung ist ein Fehler aufgetreten.",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mesatarja */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            {t("rating.title", { defaultValue: "Bewertungen & Qualität" })}
          </p>
          <p className="text-xs text-slate-400">
            {ratings.length > 0
              ? t("rating.summary", {
                  defaultValue: "{{count}} Bewertungen gesamt",
                  count: ratings.length,
                })
              : t("rating.noRatingsYet", {
                  defaultValue:
                    "Für dieses Profil liegen derzeit noch keine Bewertungen vor.",
                })}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_STARS }).map((_, idx) => {
            const value = idx + 1;
            const filled = value <= Math.round(avgRating);
            return (
              <Star
                key={value}
                filled={filled}
                className="h-4 w-4"
              />
            );
          })}
          <span className="ml-1 text-sm text-slate-200">
            {avgRating > 0 ? avgRating.toFixed(1) : "–"}
          </span>
        </div>
      </div>

      {/* Forma për vlerësim – jo për vetë agjentin */}
      {!isOwner && (
        <>
          <form
            onSubmit={handleSave}
            className="space-y-3 border-t border-slate-800 pt-3"
          >
            <p className="text-xs font-medium text-slate-300">
              {t("rating.yourRating", { defaultValue: "Deine Bewertung" })}
            </p>

            {/* Yjet interaktivë */}
            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_STARS }).map((_, idx) => {
                const value = idx + 1;
                const active = value <= (hover || myRating);
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setMyRating(value)}
                    className="p-0.5"
                  >
                    <Star
                      filled={active}
                      className="h-5 w-5"
                    />
                  </button>
                );
              })}
              {myRating > 0 && (
                <span className="ml-2 text-xs text-slate-300">
                  {t("rating.stars", {
                    defaultValue: "{{count}} von 5 Sternen",
                    count: myRating,
                  })}
                </span>
              )}
            </div>

            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder={t("rating.commentPlaceholder", {
                defaultValue:
                  "Wie war deine Erfahrung mit dieser Maklerin / diesem Makler?",
              })}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? t("rating.saving", {
                      defaultValue: "Wird gespeichert…",
                    })
                  : t("rating.submit", {
                      defaultValue: "Bewertung senden",
                    })}
              </button>
            </div>
          </form>

          {!currentUser && (
            <p className="mt-1 text-[11px] text-slate-500">
              {t("rating.loginHint", {
                defaultValue:
                  "Melde dich an, um eine Bewertung abzugeben und anderen bei der Makler:innensuche zu helfen.",
              })}
            </p>
          )}
        </>
      )}

      {isOwner && (
        <p className="mt-2 text-[11px] text-slate-500">
          {t("rating.ownerHint", {
            defaultValue:
              "Eigene Bewertungen für das eigene Profil sind deaktiviert.",
          })}
        </p>
      )}
    </div>
  );
};

export default AgentRatingSection;
