// src/pages/AgentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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

  // 🔹 Load agent profile
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
        if (snap.exists()) setAgentProfile({ id: snap.id, ...snap.data() });
        else setAgentProfile(null);
      } catch (err) {
        console.error("[AgentDashboard] loadProfile error:", err);
        setAgentProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [currentUser?.uid]);

  // 🔹 Load listings assigned to agent
  useEffect(() => {
    const loadListings = async () => {
      if (!currentUser?.uid) {
        setListings([]);
        setListingsLoading(false);
        return;
      }
      setListingsLoading(true);
      try {
        const q = query(collection(db, "listings"), where("agentId", "==", currentUser.uid));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

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

  // 🔹 Load contacts/leads for this agent
  useEffect(() => {
    const loadContacts = async () => {
      if (!currentUser?.uid) {
        setContacts([]);
        setContactsLoading(false);
        return;
      }
      setContactsLoading(true);
      try {
        const q = query(collection(db, "contacts"), where("agentId", "==", currentUser.uid));
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

  // 🔹 Computed stats
  const stats = useMemo(() => {
    const totalListings = listings.length;
    const activeListings = listings.filter((l) => (l.status || "active") === "active").length;
    const pendingListings = listings.filter((l) => l.status === "pending").length;
    const totalLeads = contacts.length;

    const rating = typeof agentProfile?.rating === "number" ? agentProfile.rating : 0;
    const reviewsCount = typeof agentProfile?.reviewsCount === "number" ? agentProfile.reviewsCount : 0;

    return { totalListings, activeListings, pendingListings, totalLeads, rating, reviewsCount };
  }, [listings, contacts, agentProfile]);

  // 🔹 Profile completion %
  const profileCompletion = useMemo(() => {
    if (!agentProfile) return 0;
    let filled = 0;
    const fields = ["fullName", "city", "region", "phone", "languages", "specialties", "bio"];
    fields.forEach((f) => {
      const v = agentProfile[f];
      if (Array.isArray(v) && v.length > 0) filled += 1;
      else if (typeof v === "string" && v.trim() !== "") filled += 1;
    });
    return Math.round((filled / fields.length) * 100);
  }, [agentProfile]);

  const handleOpenProfile = () => {
    logEvent({
      type: "agent.dashboard.openProfile",
      userId: currentUser?.uid,
      context: "agent-dashboard",
    }).catch(() => {});
    window.location.href = "/agent/profile";
  };

  const canonical = `${window.location.origin}/agent-dashboard`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      <SiteMeta
        titleKey="agentDashboard.metaTitle"
        descKey="agentDashboard.metaDescription"
        path="/agent-dashboard"
        canonical={canonical}
        lang={lang}
        noindex
      />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* HEADER */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("title", { defaultValue: "Dein Makler:innen-Dashboard" })}
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
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
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
            >
              {t("actions.editProfile", { defaultValue: "Maklerprofil bearbeiten" })}
            </button>
          </div>
        </header>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t("stats.totalListings", { defaultValue: "Gesamtinserate" })}
            value={stats.totalListings}
            variant="default"
          />
          <StatCard
            label={t("stats.activeListings", { defaultValue: "Aktive Inserate" })}
            value={stats.activeListings}
            variant="emerald"
          />
          <StatCard
            label={t("stats.pendingListings", { defaultValue: "Ausstehende Freigaben" })}
            value={stats.pendingListings}
            variant="amber"
          />
          <StatCard
            label={t("stats.totalLeads", { defaultValue: "Kontaktanfragen" })}
            value={stats.totalLeads}
            variant="sky"
          />
        </section>

        {/* PROFILE + RATING */}
        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          {/* Profile card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              {t("profile.title", { defaultValue: "Dein öffentliches Maklerprofil" })}
            </h2>

            {profileLoading ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("profile.loading", { defaultValue: "Profil wird geladen…" })}
              </p>
            ) : !agentProfile ? (
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <p>
                  {t("profile.empty", {
                    defaultValue:
                      "Du hast noch kein Maklerprofil angelegt. Lege jetzt ein Profil an, um in der Suche gefunden zu werden.",
                  })}
                </p>
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="mt-4 inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {t("actions.createProfile", { defaultValue: "Profil anlegen" })}
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-base text-slate-900 dark:text-slate-50">
                    {agentProfile.fullName || "–"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {agentProfile.city && agentProfile.region
                      ? `${agentProfile.city}, ${agentProfile.region}`
                      : agentProfile.city || agentProfile.region || ""}
                  </p>
                </div>

                {Array.isArray(agentProfile.specialties) && agentProfile.specialties.length > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">
                      {t("profile.specialtiesLabel", { defaultValue: "Schwerpunkte:" })}{" "}
                    </span>
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
                        className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-800
                                   dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-100"
                      >
                        {lng.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {agentProfile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 whitespace-pre-line">
                    {agentProfile.bio}
                  </p>
                )}

                <div className="pt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {t("profile.completion", { defaultValue: "Profilvollständigkeit" })}
                  </p>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: `${profileCompletion}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {profileCompletion}%{" "}
                    {t("profile.completionHint", {
                      defaultValue: "– je vollständiger dein Profil, desto besser wirst du gefunden.",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rating card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              {t("rating.title", { defaultValue: "Bewertungen & Qualität" })}
            </h2>

            <div className="space-y-3 text-sm">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-300">
                {stats.rating > 0 ? stats.rating.toFixed(1) : "–"}{" "}
                <span className="text-base text-slate-500 dark:text-slate-300">/ 5</span>
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t("rating.reviewsCount", {
                  defaultValue: "{{count}} veröffentlichte Bewertungen",
                  count: stats.reviewsCount,
                })}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("rating.hint", {
                  defaultValue: "Zufriedene Kund:innen erhöhen deine Sichtbarkeit in der Suche.",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* LISTINGS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold">
              {t("listings.title", { defaultValue: "Deine letzten Inserate" })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {listings.length}{" "}
              {t("listings.countLabel", { defaultValue: "Inserate insgesamt" })}
            </p>
          </div>

          {listingsLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("listings.loading", { defaultValue: "Inserate werden geladen…" })}
            </p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-5">
              {t("listings.empty", { defaultValue: "Dir sind aktuell keine Inserate zugeordnet." })}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("listings.columns.title", { defaultValue: "Titel" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("listings.columns.city", { defaultValue: "Ort" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("listings.columns.type", { defaultValue: "Typ" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("listings.columns.status", { defaultValue: "Status" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("listings.columns.createdAt", { defaultValue: "Erstellt am" })}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {listings.slice(0, 5).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{l.title || "–"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{l.city || "–"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{l.type || "–"}</td>
                      <td className="px-4 py-3 text-xs">
                        <StatusBadge
                          status={l.status || "active"}
                          t={t}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        {l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString("de-DE") : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* LEADS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold">
              {t("leads.title", { defaultValue: "Neueste Kontaktanfragen" })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {contacts.length}{" "}
              {t("leads.countLabel", { defaultValue: "Anfragen insgesamt" })}
            </p>
          </div>

          {contactsLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("leads.loading", { defaultValue: "Kontaktanfragen werden geladen…" })}
            </p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-5">
              {t("leads.empty", { defaultValue: "Noch keine Kontaktanfragen vorhanden." })}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("leads.columns.name", { defaultValue: "Name" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("leads.columns.email", { defaultValue: "E-Mail" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("leads.columns.listing", { defaultValue: "Inserat" })}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {t("leads.columns.date", { defaultValue: "Datum" })}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {contacts.slice(0, 5).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name || "–"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{c.email || "–"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{c.listingTitle || "–"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        {c.sentAt?.toDate ? c.sentAt.toDate().toLocaleString("de-DE") : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, variant = "default" }) {
  const styles = {
    default:
      "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-50",
    emerald:
      "border-emerald-200 bg-emerald-50 text-slate-900 dark:border-emerald-900/40 dark:bg-emerald-900/15 dark:text-slate-50",
    amber:
      "border-amber-200 bg-amber-50 text-slate-900 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-slate-50",
    sky:
      "border-sky-200 bg-sky-50 text-slate-900 dark:border-sky-900/40 dark:bg-sky-900/15 dark:text-slate-50",
  };

  return (
    <div className={`rounded-3xl border p-4 md:p-5 shadow-sm ${styles[variant] || styles.default}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-2xl md:text-3xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const normalized = (status || "active").toLowerCase();

  const labels = {
    active: t?.("status.active", { defaultValue: "Aktiv" }) || "Aktiv",
    pending: t?.("status.pending", { defaultValue: "Ausstehend" }) || "Ausstehend",
    inactive: t?.("status.inactive", { defaultValue: "Inaktiv" }) || "Inaktiv",
  };

  const base =
    "inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-semibold border";

  if (normalized === "active") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900/40`}>
        {labels.active}
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className={`${base} bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-900/40`}>
        {labels.pending}
      </span>
    );
  }
  if (normalized === "inactive") {
    return (
      <span className={`${base} bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800`}>
        {labels.inactive}
      </span>
    );
  }

  return (
    <span className={`${base} bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800`}>
      {normalized}
    </span>
  );
}

export default AgentDashboard;