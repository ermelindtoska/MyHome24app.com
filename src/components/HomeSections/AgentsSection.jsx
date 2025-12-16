// src/components/HomeSections/AgentsSection.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";

const AgentsSection = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true);
      setError("");

      try {
        // Merr vetëm agjentët e verifikuar (nëse fusha ekziston)
        const baseRef = collection(db, "agents");
        const q = query(
          baseRef,
          where("verified", "==", true),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snap = await getDocs(q);

        const items = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            fullName: data.fullName || "",
            city: data.city || "",
            region: data.region || "",
            languages: Array.isArray(data.languages)
              ? data.languages
              : data.languages
              ? String(data.languages).split(",").map((s) => s.trim())
              : [],
            specialties: Array.isArray(data.specialties)
              ? data.specialties
              : data.specialties
              ? String(data.specialties).split(",").map((s) => s.trim())
              : [],
            rating: typeof data.rating === "number" ? data.rating : null,
            ratingCount:
              typeof data.ratingCount === "number" ? data.ratingCount : 0,
            verified: !!data.verified,
            photoUrl: data.photoUrl || "",
          };
        });

        setAgents(items);
      } catch (err) {
        console.error("[AgentsSection] Error loading agents:", err);
        setError(
          t("agentsSection.error", {
            defaultValue: "Die Maklerliste konnte nicht geladen werden.",
          })
        );
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [t]);

  const handleViewAllAgents = () => {
    // Nëse ke një route tjetër për faqen e agjentëve, ndrysho këtu p.sh. "/agent-search"
    navigate("/agents");
  };

  const handleOpenAgentProfile = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  const renderStars = (rating) => {
    if (typeof rating !== "number") return null;
    const rounded = Math.round(rating * 2) / 2; // 4.3 -> 4.5
    const stars = [];

    for (let i = 1; i <= 5; i += 1) {
      if (rounded >= i) {
        stars.push(
          <span key={i} className="text-amber-400">
            ★
          </span>
        );
      } else if (rounded + 0.5 === i) {
        stars.push(
          <span key={i} className="text-amber-400">
            ☆
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-slate-500 dark:text-slate-600">
            ☆
          </span>
        );
      }
    }

    return <span className="ml-1">{stars}</span>;
  };

  return (
    <section className="py-14 md:py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {t("agentsSection.title", {
                defaultValue: "Treffen Sie unsere Agent:innen",
              })}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              {t("agentsSection.subtitle", {
                defaultValue:
                  "Erfahrene Expert:innen, die Sie bei Ihrem Immobilienvorhaben begleiten – vom ersten Klick bis zum Notartermin.",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleViewAllAgents}
              className="inline-flex items-center rounded-full bg-slate-900 text-slate-50 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition"
            >
              {t("agentsSection.ctaAllAgents", {
                defaultValue: "Alle Makler:innen anzeigen",
              })}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-3/5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-2/5 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="h-2.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-rose-500 dark:text-rose-400">
            {error}
          </p>
        )}

        {!loading && !error && agents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-6 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-medium mb-1">
              {t("agentsSection.emptyTitle", {
                defaultValue: "Noch keine Makler:innen veröffentlicht.",
              })}
            </p>
            <p className="text-xs md:text-sm">
              {t("agentsSection.emptyText", {
                defaultValue:
                  "Sobald Profile von Makler:innen freigeschaltet werden, erscheinen sie automatisch hier.",
              })}
            </p>
          </div>
        )}

        {!loading && !error && agents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Header brenda kartës */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar */}
                  {agent.photoUrl ? (
                    <img
                      src={agent.photoUrl}
                      alt={agent.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {agent.fullName
                        ? agent.fullName.charAt(0).toUpperCase()
                        : "M"}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {agent.fullName || t("agentsSection.unknownName", {
                        defaultValue: "Unbekannte:r Makler:in",
                      })}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {agent.city && agent.region
                        ? `${agent.city}, ${agent.region}`
                        : agent.city || agent.region || "–"}
                    </p>
                  </div>

                  {agent.verified && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold dark:bg-emerald-500/15 dark:text-emerald-300">
                      ●{" "}
                      <span className="ml-1">
                        {t("agentsSection.verifiedBadge", {
                          defaultValue: "Verifiziert",
                        })}
                      </span>
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {agent.rating ? (
                    <>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {agent.rating.toFixed(1)}
                      </span>
                      {renderStars(agent.rating)}
                      {agent.ratingCount > 0 && (
                        <span className="ml-2">
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

                {/* Info listë */}
                <div className="flex-1 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {agent.languages && agent.languages.length > 0 && (
                    <div>
                      <span className="font-semibold">
                        {t("agentsSection.languagesLabel", {
                          defaultValue: "Sprachen:",
                        })}{" "}
                      </span>
                      <span>
                        {agent.languages.slice(0, 3).join(", ")}
                        {agent.languages.length > 3 && " …"}
                      </span>
                    </div>
                  )}

                  {agent.specialties && agent.specialties.length > 0 && (
                    <div>
                      <span className="font-semibold">
                        {t("agentsSection.specialtiesLabel", {
                          defaultValue: "Schwerpunkte:",
                        })}{" "}
                      </span>
                      <span>
                        {agent.specialties.slice(0, 3).join(", ")}
                        {agent.specialties.length > 3 && " …"}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleOpenAgentProfile(agent.id)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    {t("agentsSection.viewProfile", {
                      defaultValue: "Profil ansehen",
                    })}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAgentProfile(agent.id)}
                    className="text-xs inline-flex items-center rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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

export default AgentsSection;
