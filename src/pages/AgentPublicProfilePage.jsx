// src/pages/AgentPublicProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";
import AgentRatingSection from "../components/agents/AgentRatingSection";

const AgentPublicProfilePage = () => {
  const { agentId } = useParams();
  const { t, i18n } = useTranslation("agentProfile");
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const lang = i18n.language?.slice(0, 2) || "de";

  useEffect(() => {
    if (!agentId) return;

    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "agents", agentId));
        if (snap.exists()) {
          setAgent({ id: snap.id, ...snap.data() });
        } else {
          setAgent(null);
        }
      } catch (err) {
        console.error("[AgentPublicProfilePage] load error:", err);
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [agentId]);

  const metaTitle =
    agent?.fullName ||
    t("public.metaTitle", { defaultValue: "Maklerprofil" });

  const metaDescription =
    agent?.bio ||
    t("public.metaDescription", {
      defaultValue:
        "Öffentliches Maklerprofil auf MyHome24App. Bewertungen, Kontakt & Schwerpunkte.",
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        title={metaTitle}
        description={metaDescription}
        path={`/agent/${agentId}`}
        lang={lang}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        <Link
          to="/agent/search"
          className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 mb-4"
        >
          ←{" "}
          {t("public.backToSearch", {
            defaultValue: "Zur Makler:innensuche",
          })}
        </Link>

        {loading ? (
          <p className="text-sm text-slate-300">
            {t("loading", { defaultValue: "Profil wird geladen…" })}
          </p>
        ) : !agent ? (
          <p className="text-sm text-slate-300">
            {t("public.notFound", {
              defaultValue: "Dieses Maklerprofil konnte nicht gefunden werden.",
            })}
          </p>
        ) : (
          <>
            {/* Header */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-semibold">
                  {agent.fullName?.[0]?.toUpperCase() || "M"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg md:text-xl font-semibold">
                      {agent.fullName}
                    </h1>
                    {agent.verified && (
                      <span className="rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[11px]">
                        {t("public.verified", { defaultValue: "Verifiziert" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    {[agent.city, agent.region].filter(Boolean).join(", ")}
                  </p>
                  {agent.languages && agent.languages.length > 0 && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {t("public.languages", {
                        defaultValue: "Sprachen:",
                      })}{" "}
                      {agent.languages.join(", ")}
                    </p>
                  )}
                  {agent.email && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {agent.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-end gap-2">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="hidden md:inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800"
                  >
                    {agent.phone}
                  </a>
                )}
                <button
                  onClick={() =>
                    (window.location.href = `/contact?topic=agents&agentId=${agentId}`)
                  }
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  {t("public.contactAgent", {
                    defaultValue: "Makler:in kontaktieren",
                  })}
                </button>
              </div>
            </div>

            {/* Dy kartat: profil + vlerësimet */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Profil-Details */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 md:p-5">
                <h2 className="text-sm font-semibold mb-3">
                  {t("public.profileDetails", {
                    defaultValue: "Profil-Details",
                  })}
                </h2>
                <dl className="space-y-3 text-xs text-slate-300">
                  {agent.specialties && agent.specialties.length > 0 && (
                    <div>
                      <dt className="font-medium text-slate-200">
                        {t("public.specialties", {
                          defaultValue: "Schwerpunkte",
                        })}
                      </dt>
                      <dd>{agent.specialties.join(", ")}</dd>
                    </div>
                  )}

                  {agent.bio && (
                    <div>
                      <dt className="font-medium text-slate-200">
                        {t("public.bio", { defaultValue: "Über mich" })}
                      </dt>
                      <dd className="whitespace-pre-line">{agent.bio}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Bewertungen & Qualität */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 md:p-5">
                <AgentRatingSection agentId={agentId} agentUserId={agent.userId} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentPublicProfilePage;
