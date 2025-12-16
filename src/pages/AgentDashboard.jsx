// src/pages/AgentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import SiteMeta from "../components/SEO/SiteMeta";
import { logEvent } from "../utils/logEvent";

function AgentDashboard() {
  const { t, i18n } = useTranslation("agentDashboard");
  const { currentUser } = useAuth();

  const [agentProfile, setAgentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  const lang = i18n.language?.slice(0, 2) || "de";

  // 🔹 Ngarko profilin e agjentit nga koleksioni "agents"
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const ref = doc(db, "agents", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAgentProfile({ id: snap.id, ...snap.data() });
        } else {
          setAgentProfile(null);
        }
      } catch (err) {
        console.error("[AgentDashboard] loadProfile error:", err);
        setAgentProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [currentUser?.uid]);

  // 🔹 Ngarko listimet e lidhura me agjentin
  useEffect(() => {
    const loadListings = async () => {
      if (!currentUser?.uid) {
        setListings([]);
        setListingsLoading(false);
        return;
      }
      setListingsLoading(true);
      try {
        // 🔍 provojmë të gjejmë listime ku agjenti është caktuar
        // mund të përdorësh cilindo fushë që ke: "agentId", "assignedAgentId" etj.
        const q = query(
          collection(db, "listings"),
          where("agentId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Sortim: më të rejat sipër
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setListings(items);
      } catch (err) {
        console.error("[AgentDashboard] loadListings error:", err);
        setListings([]);
      } finally {
        setListingsLoading(false);
      }
    };

    loadListings();
  }, [currentUser?.uid]);

  // 🔹 Ngarko kontaktet (leads) për këtë agjent
  useEffect(() => {
    const loadContacts = async () => {
      if (!currentUser?.uid) {
        setContacts([]);
        setContactsLoading(false);
        return;
      }
      setContactsLoading(true);
      try {
        // Nëse ke fushë tjetër (p.sh. listingOwnerId), ndrysho këtu
        const q = query(
          collection(db, "contacts"),
          where("agentId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        items.sort((a, b) => {
          const ta = a.sentAt?.toMillis?.() ?? 0;
          const tb = b.sentAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setContacts(items);
      } catch (err) {
        console.error("[AgentDashboard] loadContacts error:", err);
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };

    loadContacts();
  }, [currentUser?.uid]);

  // 🔹 Stats të llogaritura
  const stats = useMemo(() => {
    const totalListings = listings.length;
    const activeListings = listings.filter(
      (l) => (l.status || "active") === "active"
    ).length;
    const pendingListings = listings.filter(
      (l) => l.status === "pending"
    ).length;

    const totalLeads = contacts.length;

    const rating =
      typeof agentProfile?.rating === "number" ? agentProfile.rating : 0;
    const reviewsCount =
      typeof agentProfile?.reviewsCount === "number"
        ? agentProfile.reviewsCount
        : 0;

    return {
      totalListings,
      activeListings,
      pendingListings,
      totalLeads,
      rating,
      reviewsCount,
    };
  }, [listings, contacts, agentProfile]);

  // 🔹 Përqindja e kompletimit të profilit
  const profileCompletion = useMemo(() => {
    if (!agentProfile) return 0;
    let filled = 0;
    const fields = [
      "fullName",
      "city",
      "region",
      "phone",
      "languages",
      "specialties",
      "bio",
    ];
    fields.forEach((f) => {
      const v = agentProfile[f];
      if (Array.isArray(v) && v.length > 0) filled += 1;
      else if (typeof v === "string" && v.trim() !== "") filled += 1;
    });
    return Math.round((filled / fields.length) * 100);
  }, [agentProfile]);

  // 🔹 CTA: hap profilin për edit
  const handleOpenProfile = () => {
    logEvent({
      type: "agent.dashboard.openProfile",
      userId: currentUser?.uid,
      context: "agent-dashboard",
    }).catch(() => {});
    window.location.href = "/agent/profile";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        titleKey="agentDashboard.metaTitle"
        descKey="agentDashboard.metaDescription"
        path="/agent-dashboard"
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("title", {
                defaultValue: "Dein Makler:innen-Dashboard",
              })}
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2">
              {t("subtitle", {
                defaultValue:
                  "Behalte deine Inserate, Anfragen und Bewertungen im Blick – ähnlich wie bei Zillow.",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleOpenProfile}
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition"
            >
              {t("actions.editProfile", {
                defaultValue: "Maklerprofil bearbeiten",
              })}
            </button>
          </div>
        </header>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={t("stats.totalListings", {
              defaultValue: "Gesamtinserate",
            })}
            value={stats.totalListings}
          />
          <StatCard
            label={t("stats.activeListings", {
              defaultValue: "Aktive Inserate",
            })}
            value={stats.activeListings}
            badgeColor="emerald"
          />
          <StatCard
            label={t("stats.pendingListings", {
              defaultValue: "Ausstehende Freigaben",
            })}
            value={stats.pendingListings}
            badgeColor="amber"
          />
          <StatCard
            label={t("stats.totalLeads", {
              defaultValue: "Kontaktanfragen",
            })}
            value={stats.totalLeads}
            badgeColor="sky"
          />
        </section>

        {/* PROFIL + RATING */}
        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] mb-10">
          {/* Profil */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              {t("profile.title", {
                defaultValue: "Dein öffentliches Maklerprofil",
              })}
            </h2>

            {profileLoading ? (
              <p className="text-sm text-slate-300">
                {t("profile.loading", {
                  defaultValue: "Profil wird geladen…",
                })}
              </p>
            ) : !agentProfile ? (
              <div className="text-sm text-slate-300">
                <p>
                  {t("profile.empty", {
                    defaultValue:
                      "Du hast noch kein Maklerprofil angelegt. Lege jetzt ein Profil an, um in der Suche gefunden zu werden.",
                  })}
                </p>
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="mt-4 inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition"
                >
                  {t("actions.createProfile", {
                    defaultValue: "Profil anlegen",
                  })}
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-200">
                <div>
                  <p className="font-semibold text-base">
                    {agentProfile.fullName || "–"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {agentProfile.city && agentProfile.region
                      ? `${agentProfile.city}, ${agentProfile.region}`
                      : agentProfile.city || agentProfile.region || ""}
                  </p>
                </div>

                {agentProfile.specialties &&
                  Array.isArray(agentProfile.specialties) &&
                  agentProfile.specialties.length > 0 && (
                    <p className="text-xs text-slate-300">
                      {t("profile.specialtiesLabel", {
                        defaultValue: "Schwerpunkte:",
                      })}{" "}
                      {agentProfile.specialties.join(", ")}
                    </p>
                  )}

                {agentProfile.languages && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(agentProfile.languages)
                      ? agentProfile.languages
                      : String(agentProfile.languages).split(",")
                    ).map((lng) => (
                      <span
                        key={lng}
                        className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100"
                      >
                        {lng.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {agentProfile.bio && (
                  <p className="text-xs text-slate-300 pt-2 whitespace-pre-line">
                    {agentProfile.bio}
                  </p>
                )}

                <div className="pt-3">
                  <p className="text-xs text-slate-400 mb-1">
                    {t("profile.completion", {
                      defaultValue: "Profilvollständigkeit",
                    })}
                  </p>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    {profileCompletion}%{" "}
                    {t("profile.completionHint", {
                      defaultValue:
                        "– je vollständiger dein Profil, desto besser wirst du gefunden.",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rating & Reviews */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              {t("rating.title", {
                defaultValue: "Bewertungen & Qualität",
              })}
            </h2>
            <div className="space-y-3 text-sm">
              <p className="text-3xl font-bold text-amber-300">
                {stats.rating > 0 ? stats.rating.toFixed(1) : "–"}{" "}
                <span className="text-base text-slate-300">/ 5</span>
              </p>
              <p className="text-xs text-slate-300">
                {t("rating.reviewsCount", {
                  defaultValue: "{{count}} veröffentlichte Bewertungen",
                  count: stats.reviewsCount,
                })}
              </p>
              <p className="text-xs text-slate-400">
                {t("rating.hint", {
                  defaultValue:
                    "Zufriedene Kund:innen erhöhen deine Sichtbarkeit in der Suche.",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* LISTIMET E FUNDIT */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold">
              {t("listings.title", {
                defaultValue: "Deine letzten Inserate",
              })}
            </h2>
            <p className="text-xs text-slate-400">
              {listings.length}{" "}
              {t("listings.countLabel", {
                defaultValue: "Inserate insgesamt",
              })}
            </p>
          </div>

          {listingsLoading ? (
            <p className="text-sm text-slate-300">
              {t("listings.loading", {
                defaultValue: "Inserate werden geladen…",
              })}
            </p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-slate-300 border border-dashed border-slate-800 rounded-2xl px-4 py-5">
              {t("listings.empty", {
                defaultValue:
                  "Dir sind aktuell keine Inserate zugeordnet.",
              })}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("listings.columns.title", {
                        defaultValue: "Titel",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("listings.columns.city", {
                        defaultValue: "Ort",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("listings.columns.type", {
                        defaultValue: "Typ",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("listings.columns.status", {
                        defaultValue: "Status",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("listings.columns.createdAt", {
                        defaultValue: "Erstellt am",
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {listings.slice(0, 5).map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-900/80 transition-colors"
                    >
                      <td className="px-4 py-2 text-slate-100">
                        {l.title || "–"}
                      </td>
                      <td className="px-4 py-2 text-slate-200 text-xs">
                        {l.city || "–"}
                      </td>
                      <td className="px-4 py-2 text-slate-200 text-xs">
                        {l.type || "–"}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <StatusBadge status={l.status || "active"} />
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-300">
                        {l.createdAt?.toDate
                          ? l.createdAt
                              .toDate()
                              .toLocaleString("de-DE")
                          : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* KONTAKTET E FUNDIT */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold">
              {t("leads.title", {
                defaultValue: "Neueste Kontaktanfragen",
              })}
            </h2>
            <p className="text-xs text-slate-400">
              {contacts.length}{" "}
              {t("leads.countLabel", {
                defaultValue: "Anfragen insgesamt",
              })}
            </p>
          </div>

          {contactsLoading ? (
            <p className="text-sm text-slate-300">
              {t("leads.loading", {
                defaultValue: "Kontaktanfragen werden geladen…",
              })}
            </p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-slate-300 border border-dashed border-slate-800 rounded-2xl px-4 py-5">
              {t("leads.empty", {
                defaultValue: "Noch keine Kontaktanfragen vorhanden.",
              })}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("leads.columns.name", {
                        defaultValue: "Name",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("leads.columns.email", {
                        defaultValue: "E-Mail",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("leads.columns.listing", {
                        defaultValue: "Inserat",
                      })}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {t("leads.columns.date", {
                        defaultValue: "Datum",
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {contacts.slice(0, 5).map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-900/80 transition-colors"
                    >
                      <td className="px-4 py-2 text-slate-100">
                        {c.name || "–"}
                      </td>
                      <td className="px-4 py-2 text-slate-200 text-xs">
                        {c.email || "–"}
                      </td>
                      <td className="px-4 py-2 text-slate-200 text-xs">
                        {c.listingTitle || "–"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-300">
                        {c.sentAt?.toDate
                          ? c.sentAt.toDate().toLocaleString("de-DE")
                          : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, badgeColor = "slate" }) {
  const colorMap = {
    slate: "bg-slate-900/80 border-slate-800",
    emerald: "bg-emerald-950/40 border-emerald-700/60",
    amber: "bg-amber-950/40 border-amber-700/60",
    sky: "bg-sky-950/40 border-sky-700/60",
  };
  const classes = colorMap[badgeColor] || colorMap.slate;

  return (
    <div
      className={`rounded-3xl border px-4 py-4 md:px-5 md:py-5 shadow-sm ${classes}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl md:text-3xl font-bold text-slate-50">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || "active").toLowerCase();
  let label = normalized;
  let classes =
    "inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-semibold border";

  if (normalized === "active") {
    label = "Aktiv";
    classes += " bg-emerald-900/40 text-emerald-200 border-emerald-700/70";
  } else if (normalized === "pending") {
    label = "Ausstehend";
    classes += " bg-amber-900/40 text-amber-200 border-amber-700/70";
  } else if (normalized === "inactive") {
    label = "Inaktiv";
    classes += " bg-slate-900/60 text-slate-200 border-slate-700/70";
  } else {
    classes += " bg-slate-900/60 text-slate-200 border-slate-700/70";
  }

  return <span className={classes}>{label}</span>;
}

export default AgentDashboard;
