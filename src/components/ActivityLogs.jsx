// src/components/ActivityLogs.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useTranslation } from "react-i18next";

const ActivityLogs = () => {
  const { t } = useTranslation(["adminDashboard"]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadLogs();
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {t("activityLogs.title", { defaultValue: "Aktivitätsprotokoll" })}
          </h2>
          <p className="text-sm text-gray-400">
            {t("activityLogs.subtitle", {
              defaultValue:
                "Übersicht über wichtige Aktionen auf MyHome24App (nur für Admins sichtbar).",
            })}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">
          {t("activityLogs.loading", { defaultValue: "Logs werden geladen…" })}
        </p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400">
          {t("activityLogs.empty", {
            defaultValue: "Bisher wurden noch keine Logs erfasst.",
          })}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
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
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/70">
                  <TD className="font-mono text-xs">{log.type || "—"}</TD>
                  <TD>{log.message || "—"}</TD>
                  <TD className="text-xs text-gray-300">
                    {log.userId || "—"}
                  </TD>
                  <TD className="text-xs text-gray-400">
                    {log.listingId && (
                      <div>Listing: {log.listingId.substring(0, 8)}…</div>
                    )}
                    {log.offerId && (
                      <div>Offer: {log.offerId.substring(0, 8)}…</div>
                    )}
                    {log.role && <div>Role: {log.role}</div>}
                  </TD>
                  <TD className="text-xs text-gray-400">
                    {log.timestamp?.toDate
                      ? log.timestamp
                          .toDate()
                          .toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                      : "—"}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

function TH({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return (
    <td className={`px-3 py-2 align-top text-gray-100 ${className}`}>
      {children}
    </td>
  );
}

export default ActivityLogs;
