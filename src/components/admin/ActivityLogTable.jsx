// src/components/admin/ActivityLogTable.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useTranslation } from "react-i18next";

// 👉 konverto timestamp-in në ms për sort
const getTimeValue = (log) => {
  const ts = log.createdAt || log.timestamp || log.loggedAt || null;
  if (!ts) return 0;
  try {
    if (ts.toMillis) return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
  } catch {
    return 0;
  }
  return 0;
};

const formatDate = (ts) => {
  if (!ts) return "—";
  try {
    if (ts.toDate) return ts.toDate().toLocaleString("de-DE");
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString("de-DE");
    }
    return String(ts);
  } catch {
    return "—";
  }
};

const mapTypeKey = (type) => {
  if (!type) return "unknown";
  return type.replace(/\./g, "_");
};

const getTimestamp = (log) =>
  log.createdAt || log.timestamp || log.loggedAt || null;

// pak ngjyra badge sipas tipit
const getTypeBadgeClass = (type) => {
  if (!type) return "bg-slate-800/80 text-slate-100";

  if (type.startsWith("role.")) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40";
  }
  if (type.startsWith("agent.")) {
    return "bg-sky-500/15 text-sky-300 border border-sky-500/40";
  }
  if (type.startsWith("support.")) {
    return "bg-amber-500/15 text-amber-200 border border-amber-500/40";
  }
  if (type.startsWith("listing.")) {
    return "bg-indigo-500/15 text-indigo-200 border border-indigo-500/40";
  }
  if (type.startsWith("finance.")) {
    return "bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/40";
  }
  return "bg-slate-800/80 text-slate-100 border border-slate-700";
};

const ActivityLogTable = () => {
  const { t } = useTranslation("admin");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "logs"));
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        items.sort((a, b) => getTimeValue(b) - getTimeValue(a));
        setLogs(items);
      } catch (err) {
        console.error("[ActivityLogTable] loadLogs error:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const renderType = (log) => {
    const rawType = log.type || log.action || null;
    if (!rawType) return "—";

    const key = mapTypeKey(rawType);
    return t(`activityLog.types.${key}`, {
      defaultValue: rawType,
    });
  };

  const renderContext = (log) => {
    const ctx = log.context || log.source || null;
    if (!ctx) return "—";
    return t(`activityLog.context.${ctx}`, {
      defaultValue: ctx,
    });
  };

  const renderUser = (log) => {
    if (log.userEmail) return log.userEmail;
    if (log.userName) return log.userName;
    if (log.userId) return log.userId;
    return "—";
  };

  const renderMessage = (log) => {
    // 1) Nëse kemi message të drejtpërdrejtë – përdore
    if (log.message) return log.message;

    // 2) Nëse kemi detail pa message, përdore si fallback
    //    (shërben edhe për log-et e vjetra)
    const detail = log.detail || null;
    const action = log.type || log.action || "";

    // 🔹 tipe të strukturuara (role.approved, agent.cta.become, ...)
    if (action === "role.approved") {
      return t("activityLog.messages.roleApproved", {
        targetRole: log.targetRole || "agent",
        defaultValue: 'Rollenwechsel auf „agent“ wurde genehmigt.',
      });
    }

    if (action === "agent.cta.become") {
      return t("activityLog.messages.agentCtaBecome", {
        defaultValue: 'Nutzer:in hat auf „Makler:in werden“ geklickt.',
      });
    }

    if (action === "support.markedResolved") {
      return t("activityLog.messages.supportResolved", {
        defaultValue: "Supportnachricht wurde als erledigt markiert.",
      });
    }

    if (action === "listing.statusChanged") {
      return t("activityLog.messages.listingStatusChanged", {
        title: detail || "—",
        status: log.status || log.newStatus || "unknown",
        defaultValue:
          'Status der Anzeige „{{title}}“ wurde auf „{{status}}“ geändert.',
      });
    }

    if (action === "listing.deleted") {
      return t("activityLog.messages.listingDeleted", {
        title: detail || "—",
        defaultValue: 'Anzeige „{{title}}“ wurde gelöscht.',
      });
    }

    if (action === "finance.leadStatusChanged") {
      return t("activityLog.messages.financeLeadStatusChanged", {
        status: log.status || log.newStatus || "unknown",
        defaultValue:
          "Status der Finanzierungsanfrage wurde auf „{{status}}“ geändert.",
      });
    }

    // 🔹 log-et e VJETRA me action si string anglisht (AdminDashboard logActivity)
    const a = log.action || "";

    if (a === "Marked support as resolved") {
      return t("activityLog.messages.supportResolved", {
        defaultValue: "Supportnachricht wurde als erledigt markiert.",
      });
    }

    if (a === "Deleted listing") {
      return t("activityLog.messages.listingDeleted", {
        title: detail || "—",
        defaultValue: 'Anzeige „{{title}}“ wurde gelöscht.',
      });
    }

    if (a.startsWith("Changed status to ")) {
      const status = a.replace("Changed status to ", "");
      return t("activityLog.messages.listingStatusChanged", {
        title: detail || "—",
        status,
        defaultValue:
          'Status der Anzeige „{{title}}“ wurde auf „{{status}}“ geändert.',
      });
    }

    if (a === "Updated finance lead status") {
      return t("activityLog.messages.financeLeadStatusChanged", {
        status: detail || "—",
        defaultValue:
          "Status der Finanzierungsanfrage wurde auf „{{status}}“ geändert.",
      });
    }

    if (a === "Approved role upgrade") {
      return t("activityLog.messages.roleApproved", {
        targetRole: log.targetRole || "agent",
        defaultValue: 'Rollenwechsel auf „{{targetRole}}“ wurde genehmigt.',
      });
    }

    if (a === "Rejected role upgrade") {
      return (
        t("activityLog.messages.roleRejected", {
          defaultValue: "Rollenwechsel wurde abgelehnt.",
        }) + (detail ? ` (${detail})` : "")
      );
    }

    // 3) Fallback absolut
    if (detail) return detail;
    return "—";
  };

  return (
    <div className="mt-10 rounded-3xl border border-slate-700/80 bg-slate-950/80 shadow-xl shadow-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <h2 className="text-sm md:text-base font-semibold text-slate-50">
          {t("activityLog.title", {
            defaultValue: "Aktivitätsprotokoll",
          })}
        </h2>
        <p className="mt-1 text-[11px] md:text-xs text-slate-400">
          {t("activityLog.subtitle", {
            defaultValue:
              "Übersicht über wichtige Aktionen auf MyHome24App (nur für Admins sichtbar).",
          })}
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-slate-900/90 border-b border-slate-800">
            <tr className="text-slate-400">
              <th className="px-4 py-2 text-left font-medium w-40 md:w-48">
                {t("activityLog.columns.type", { defaultValue: "Typ" })}
              </th>
              <th className="px-4 py-2 text-left font-medium">
                {t("activityLog.columns.message", { defaultValue: "Nachricht" })}
              </th>
              <th className="px-4 py-2 text-left font-medium w-40">
                {t("activityLog.columns.user", { defaultValue: "User" })}
              </th>
              <th className="px-4 py-2 text-left font-medium w-32 hidden md:table-cell">
                {t("activityLog.columns.context", { defaultValue: "Kontext" })}
              </th>
              <th className="px-4 py-2 text-left font-medium w-40">
                {t("activityLog.columns.date", { defaultValue: "Datum" })}
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && logs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  {t("activityLog.loading", {
                    defaultValue: "Protokoll wird geladen…",
                  })}
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  {t("activityLog.empty", {
                    defaultValue: "Noch keine Einträge vorhanden.",
                  })}
                </td>
              </tr>
            )}

            {logs.map((log, idx) => {
              const ts = getTimestamp(log);
              const typeKey = log.type || log.action || "";
              const rowBg =
                idx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-900/40";

              return (
                <tr
                  key={log.id}
                  className={`${rowBg} border-t border-slate-800/60 hover:bg-slate-800/70 cursor-pointer transition-colors`}
                  onClick={() => setSelected(log)}
                >
                  <td className="px-4 py-2 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] md:text-xs font-medium ${getTypeBadgeClass(
                        typeKey
                      )}`}
                    >
                      {renderType(log)}
                    </span>
                  </td>
                  <td className="px-4 py-2 align-top text-slate-100">
                    {renderMessage(log)}
                  </td>
                  <td className="px-4 py-2 align-top text-slate-200 whitespace-nowrap">
                    {renderUser(log)}
                  </td>
                  <td className="px-4 py-2 align-top text-slate-300 hidden md:table-cell whitespace-nowrap">
                    {renderContext(log)}
                  </td>
                  <td className="px-4 py-2 align-top text-slate-300 whitespace-nowrap">
                    {formatDate(ts)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal detajesh */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/70 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:text-base font-semibold text-slate-50">
                {t("activityLog.detailTitle", {
                  defaultValue: "Log-Details",
                })}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-200 text-sm md:text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs md:text-sm text-slate-100">
              <p>
                <span className="font-semibold text-slate-300">
                  {t("activityLog.columns.type", { defaultValue: "Typ" })}:
                </span>{" "}
                {renderType(selected)}
              </p>
              <p>
                <span className="font-semibold text-slate-300">
                  {t("activityLog.columns.message", {
                    defaultValue: "Nachricht",
                  })}
                  :
                </span>{" "}
                {renderMessage(selected)}
              </p>
              <p>
                <span className="font-semibold text-slate-300">
                  {t("activityLog.columns.user", { defaultValue: "User" })}:
                </span>{" "}
                {renderUser(selected)}
              </p>
              <p>
                <span className="font-semibold text-slate-300">
                  {t("activityLog.columns.context", {
                    defaultValue: "Kontext",
                  })}
                  :
                </span>{" "}
                {renderContext(selected)}
              </p>
              <p>
                <span className="font-semibold text-slate-300">
                  {t("activityLog.columns.date", { defaultValue: "Datum" })}:
                </span>{" "}
                {formatDate(getTimestamp(selected))}
              </p>

              {selected.extra && (
                <div className="mt-2">
                  <p className="font-semibold text-slate-300 mb-1">
                    {t("activityLog.extra", {
                      defaultValue: "Zusätzliche Daten",
                    })}
                  </p>
                  <pre className="text-[10px] md:text-xs bg-slate-900 rounded-lg p-2 text-slate-200 overflow-x-auto">
                    {JSON.stringify(selected.extra, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogTable;
