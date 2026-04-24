import React, { useEffect, useMemo, useState } from "react";
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
import { FaStar, FaRegStar, FaCheckCircle } from "react-icons/fa";

const MAX_STARS = 5;

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
    Boolean(currentUser?.uid) &&
    Boolean(agentUserId) &&
    currentUser.uid === agentUserId;

  const loadRatings = async () => {
    if (!agentId) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "agentRatings"),
        where("agentId", "==", agentId)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setRatings(list);

      if (currentUser?.uid) {
        const mine = list.find((r) => r.userId === currentUser.uid);

        if (mine) {
          setMyRating(Number(mine.rating) || 0);
          setComment(mine.comment || "");
        } else {
          setMyRating(0);
          setComment("");
        }
      }
    } catch (err) {
      console.error("[AgentRatingSection] load error:", err);
      toast.error(
        t("rating.loadError", {
          defaultValue: "Bewertungen konnten nicht geladen werden.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, currentUser?.uid]);

  const avgRating = useMemo(() => {
    if (!ratings.length) return 0;

    const total = ratings.reduce(
      (sum, item) => sum + (Number(item.rating) || 0),
      0
    );

    return total / ratings.length;
  }, [ratings]);

  const ratingCount = ratings.length;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!agentId) return;

    if (!currentUser) {
      toast.error(
        t("rating.loginRequired", {
          defaultValue: "Bitte melde dich an, um eine Bewertung abzugeben.",
        })
      );
      return;
    }

    if (isOwner) {
      toast.error(
        t("rating.ownerHint", {
          defaultValue:
            "Eigene Bewertungen für das eigene Profil sind deaktiviert.",
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
          agentUserId: agentUserId || "",
          userId: currentUser.uid,
          userEmail: currentUser.email || "",
          rating: Number(myRating),
          comment: comment.trim(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await loadRatings();

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

  const renderStars = (value, size = "text-lg") => {
    const rounded = Math.round(Number(value) || 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: MAX_STARS }).map((_, index) => {
          const active = index + 1 <= rounded;

          return active ? (
            <FaStar key={index} className={`${size} text-amber-400`} />
          ) : (
            <FaRegStar
              key={index}
              className={`${size} text-slate-300 dark:text-slate-600`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
            <FaCheckCircle />
            {t("rating.badge", { defaultValue: "Vertrauen & Qualität" })}
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t("rating.title", { defaultValue: "Bewertungen & Qualität" })}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {ratingCount > 0
              ? t("rating.summary", {
                  defaultValue: "{{count}} Bewertungen gesamt",
                  count: ratingCount,
                })
              : t("rating.noRatingsYet", {
                  defaultValue:
                    "Für dieses Profil liegen derzeit noch keine Bewertungen vor.",
                })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {avgRating > 0 ? avgRating.toFixed(1) : "–"}
            </div>

            <div>
              {renderStars(avgRating, "text-base")}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {ratingCount}{" "}
                {t("rating.ratingCount", { defaultValue: "Bewertungen" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <>
          {!isOwner && (
            <form
              onSubmit={handleSave}
              className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {t("rating.yourRating", { defaultValue: "Deine Bewertung" })}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {Array.from({ length: MAX_STARS }).map((_, index) => {
                  const value = index + 1;
                  const active = value <= (hover || myRating);

                  return (
                    <button
                      key={value}
                      type="button"
                      onMouseEnter={() => setHover(value)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setMyRating(value)}
                      className="rounded-xl p-1 transition hover:bg-white dark:hover:bg-slate-800"
                      aria-label={`${value} Sterne`}
                    >
                      {active ? (
                        <FaStar className="text-2xl text-amber-400" />
                      ) : (
                        <FaRegStar className="text-2xl text-slate-400 dark:text-slate-600" />
                      )}
                    </button>
                  );
                })}

                {myRating > 0 && (
                  <span className="ml-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t("rating.stars", {
                      defaultValue: "{{count}} von 5 Sternen",
                      count: myRating,
                    })}
                  </span>
                )}
              </div>

              <textarea
                rows={4}
                className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-900/30"
                placeholder={t("rating.commentPlaceholder", {
                  defaultValue:
                    "Wie war deine Erfahrung mit dieser Maklerin / diesem Makler?",
                })}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser
                    ? t("rating.publicHint", {
                        defaultValue:
                          "Deine Bewertung hilft anderen Nutzer:innen bei der Entscheidung.",
                      })
                    : t("rating.loginHint", {
                        defaultValue:
                          "Melde dich an, um eine Bewertung abzugeben.",
                      })}
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          )}

          {isOwner && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              {t("rating.ownerHint", {
                defaultValue:
                  "Eigene Bewertungen für das eigene Profil sind deaktiviert.",
              })}
            </div>
          )}

          {ratings.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("rating.latestReviews", {
                  defaultValue: "Aktuelle Bewertungen",
                })}
              </h4>

              {ratings.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    {renderStars(item.rating, "text-sm")}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {Number(item.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  {item.comment ? (
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {item.comment}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      {t("rating.noComment", {
                        defaultValue: "Ohne Kommentar.",
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default React.memo(AgentRatingSection);