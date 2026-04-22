import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useTranslation } from "react-i18next";
import {
  FiActivity,
  FiClock,
  FiShield,
  FiUser,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";

const ActivityLogs = () => {
  const { t } = useTranslation(["adminDashboard"]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "logs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLogs(items);
    } catch (err) {
      console.error("[ActivityLogs] Fehler beim Laden der Logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueUsers = new Set(logs.map((l) => l.userId).filter(Boolean)).size;
    const withListing = logs.filter((l) => l.listingId).length;
    const withOffer = logs.filter((l) => l.offerId).length;

    return { total, uniqueUsers, withListing, withOffer };
  }, [logs]);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-5 dark:border-slate-800 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              <FiShield size={14} />
              {t("activityLogs.badge", {
                defaultValue: "Admin Monitoring",
              })}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("activityLogs.title", { defaultValue: "Aktivitätsprotokoll" })}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {t("activityLogs.subtitle", {
                defaultValue:
                  "Übersicht über wichtige Aktionen auf MyHome24App (nur für Admins sichtbar).",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatCard
              icon={<FiActivity size={15} />}
              label={t("activityLogs.stats.total", { defaultValue: "Logs" })}
              value={stats.total}
            />
            <StatCard
              icon={<FiUser size={15} />}
              label={t("activityLogs.stats.users", { defaultValue: "User" })}
              value={stats.uniqueUsers}
            />
            <StatCard
              icon={<FiFileText size={15} />}
              label={t("activityLogs.stats.listings", {
                defaultValue: "Listings",
              })}
              value={stats.withListing}
            />
            <StatCard
              icon={<FiClock size={15} />}
              label={t("activityLogs.stats.offers", {
                defaultValue: "Offers",
              })}
              value={stats.withOffer}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FiRefreshCw size={15} />
            {t("activityLogs.refresh", { defaultValue: "Aktualisieren" })}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 md:px-6">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {t("activityLogs.loading", {
              defaultValue: "Logs werden geladen…",
            })}
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {t("activityLogs.empty", {
              defaultValue: "Bisher wurden noch keine Logs erfasst.",
            })}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <TH>
                      {t("activityLogs.columns.type", { defaultValue: "Typ" })}
                    </TH>
                    <TH>
                      {t("activityLogs.columns.message", {
                        defaultValue: "Nachricht",
                      })}
                    </TH>
                    <TH>
                      {t("activityLogs.columns.user", { defaultValue: "User" })}
                    </TH>
                    <TH>
                      {t("activityLogs.columns.context", {
                        defaultValue: "Kontext",
                      })}
                    </TH>
                    <TH>
                      {t("activityLogs.columns.date", { defaultValue: "Datum" })}
                    </TH>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <TD>
                        <TypeBadge type={log.type} />
                      </TD>

                      <TD>
                        <div className="max-w-[460px]">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {log.message || "—"}
                          </div>
                        </div>
                      </TD>

                      <TD className="text-xs text-slate-600 dark:text-slate-300">
                        {log.userId || "—"}
                      </TD>

                      <TD className="text-xs text-slate-500 dark:text-slate-400">
                        <ContextBlock log={log} />
                      </TD>

                      <TD className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(log.timestamp)}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="space-y-4 xl:hidden">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-gray-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <TypeBadge type={log.type} />
                    <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>

                  <div className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                    {log.message || "—"}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <InfoBlock
                      label={t("activityLogs.columns.user", {
                        defaultValue: "User",
                      })}
                      value={log.userId || "—"}
                    />
                    <InfoBlock
                      label={t("activityLogs.columns.context", {
                        defaultValue: "Kontext",
                      })}
                      value={<ContextBlock log={log} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function TH({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-top text-slate-900 dark:text-slate-100 ${className}`}>
      {children}
    </td>
  );
}

function TypeBadge({ type }) {
  const normalized = String(type || "").toLowerCase();

  let classes =
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

  if (normalized.includes("offer")) {
    classes =
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300";
  } else if (normalized.includes("role")) {
    classes =
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300";
  } else if (normalized.includes("delete") || normalized.includes("rejected")) {
    classes =
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${classes}`}
    >
      {type || "—"}
    </span>
  );
}

function ContextBlock({ log }) {
  return (
    <div className="space-y-1">
      {log.listingId && <div>Listing: {shortId(log.listingId)}</div>}
      {log.offerId && <div>Offer: {shortId(log.offerId)}</div>}
      {log.role && <div>Role: {log.role}</div>}
      {!log.listingId && !log.offerId && !log.role && <div>—</div>}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-sm text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}

function shortId(value) {
  const str = String(value || "");
  if (str.length <= 8) return str;
  return `${str.slice(0, 8)}…`;
}

function formatDate(timestamp) {
  try {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    return "—";
  } catch {
    return "—";
  }
}

export default ActivityLogs;