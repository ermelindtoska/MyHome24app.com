import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStar,
  FaUserTie,
} from "react-icons/fa";

const FALLBACK_AVATAR = "/images/agent-placeholder.png";

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);

  if (value) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getAgentInitial(name) {
  if (!name) return "M";
  return String(name).trim().charAt(0).toUpperCase();
}

function renderStars(rating) {
  if (typeof rating !== "number") return null;

  const rounded = Math.round(rating);
  return (
    <div className="flex text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <FaStar
          key={index}
          className={index < rounded ? "opacity-100" : "opacity-25"}
        />
      ))}
    </div>
  );
}

const AgentsSection = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const mapAgent = (docSnap) => {
      const data = docSnap.data() || {};

      return {
        id: docSnap.id,
        fullName: data.fullName || data.name || "",
        city: data.city || "",
        region: data.region || data.state || "",
        languages: normalizeList(data.languages),
        specialties: normalizeList(data.specialties),
        rating: typeof data.rating === "number" ? data.rating : null,
        ratingCount:
          typeof data.ratingCount === "number" ? data.ratingCount : 0,
        verified: Boolean(data.verified),
        photoUrl: data.photoUrl || data.avatarUrl || data.imageUrl || "",
      };
    };

    const loadAgents = async () => {
      setLoading(true);
      setError("");

      try {
        const baseRef = collection(db, "agents");

        let snap;

        try {
          const verifiedQuery = query(
            baseRef,
            where("verified", "==", true),
            orderBy("createdAt", "desc"),
            firestoreLimit(3)
          );

          snap = await getDocs(verifiedQuery);
        } catch (indexError) {
          console.warn(
            "[AgentsSection] Verified query failed, fallback query used:",
            indexError
          );

          const fallbackQuery = query(
            baseRef,
            orderBy("createdAt", "desc"),
            firestoreLimit(6)
          );

          snap = await getDocs(fallbackQuery);
        }

        if (!active) return;

        const items = snap.docs
          .map(mapAgent)
          .filter((agent) => agent.verified || snap.docs.length <= 3)
          .slice(0, 3);

        setAgents(items);
      } catch (err) {
        console.error("[AgentsSection] Error loading agents:", err);

        if (!active) return;

        setError(
          t("agentsSection.error", {
            defaultValue: "Die Maklerliste konnte nicht geladen werden.",
          })
        );

        setAgents([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAgents();

    return () => {
      active = false;
    };
  }, [t]);

  const subtitle = useMemo(
    () =>
      t("agentsSection.subtitle", {
        defaultValue:
          "Erfahrene Expert:innen begleiten Sie bei Kauf, Verkauf oder Vermietung – persönlich, transparent und zuverlässig.",
      }),
    [t]
  );

  const handleViewAllAgents = () => {
    navigate("/agents");
  };

  const handleOpenAgentProfile = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-700/20" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/20" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/80 dark:text-blue-300">
              <FaUserTie />
              {t("agentsSection.badge", {
                defaultValue: "Makler:innen Netzwerk",
              })}
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {t("agentsSection.title", {
                defaultValue: "Treffen Sie unsere Agent:innen",
              })}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleViewAllAgents}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            {t("agentsSection.ctaAllAgents", {
              defaultValue: "Alle Makler:innen anzeigen",
            })}
            <FaArrowRight className="text-xs" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[320px] animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <FaExclamationTriangle className="mb-3 text-3xl" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <FaUserTie className="text-2xl" />
            </div>

            <p className="font-semibold text-slate-900 dark:text-white">
              {t("agentsSection.emptyTitle", {
                defaultValue: "Noch keine Makler:innen veröffentlicht.",
              })}
            </p>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t("agentsSection.emptyText", {
                defaultValue:
                  "Sobald Profile von Makler:innen freigeschaltet werden, erscheinen sie automatisch hier.",
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="group flex flex-col rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="mb-5 flex items-start gap-4">
                  {agent.photoUrl ? (
                    <img
                      src={agent.photoUrl}
                      alt={agent.fullName || "Agent"}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-16 w-16 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-extrabold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {getAgentInitial(agent.fullName)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                          {agent.fullName ||
                            t("agentsSection.unknownName", {
                              defaultValue: "Unbekannte:r Makler:in",
                            })}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                          {agent.city && agent.region
                            ? `${agent.city}, ${agent.region}`
                            : agent.city || agent.region || "–"}
                        </p>
                      </div>

                      {agent.verified && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <FaCheckCircle />
                          {t("agentsSection.verifiedBadge", {
                            defaultValue: "Verifiziert",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {agent.rating ? (
                        <>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {agent.rating.toFixed(1)}
                          </span>
                          {renderStars(agent.rating)}
                          {agent.ratingCount > 0 && (
                            <span>
                              ({agent.ratingCount}{" "}
                              {t("agentsSection.ratingCount", {
                                defaultValue: "Bewertungen",
                              })}
                              )
                            </span>
                          )}
                        </>
                      ) : (
                        <span>
                          {t("agentsSection.noRatings", {
                            defaultValue: "Noch keine Bewertungen",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {t("agentsSection.languagesLabel", {
                        defaultValue: "Sprachen:",
                      })}{" "}
                    </span>
                    {agent.languages.length
                      ? `${agent.languages.slice(0, 3).join(", ")}${
                          agent.languages.length > 3 ? " …" : ""
                        }`
                      : t("agentsSection.notSpecified", {
                          defaultValue: "Nicht angegeben",
                        })}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {t("agentsSection.specialtiesLabel", {
                        defaultValue: "Schwerpunkte:",
                      })}{" "}
                    </span>
                    {agent.specialties.length
                      ? `${agent.specialties.slice(0, 3).join(", ")}${
                          agent.specialties.length > 3 ? " …" : ""
                        }`
                      : t("agentsSection.notSpecified", {
                          defaultValue: "Nicht angegeben",
                        })}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenAgentProfile(agent.id)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                  >
                    {t("agentsSection.viewProfile", {
                      defaultValue: "Profil ansehen",
                    })}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAgentProfile(agent.id)}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {t("agentsSection.contactCta", {
                      defaultValue: "Kontakt aufnehmen",
                    })}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(AgentsSection);