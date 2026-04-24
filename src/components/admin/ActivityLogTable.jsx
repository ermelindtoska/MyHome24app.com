// src/components/admin/ActivityLogTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useTranslation } from "react-i18next";
import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiSearch,
  FiUser,
  FiX,
  FiDatabase,
} from "react-icons/fi";

const MAX_LOGS = 200;

const getTimestamp = (log) =>
  log?.createdAt || log?.timestamp || log?.loggedAt || null;

const getTimeValue = (log) => {
  const ts = getTimestamp(log);
  if (!ts) return 0;

  try {
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    if (ts.seconds) return ts.seconds * 1000;
    if (typeof ts === "string") return new Date(ts).getTime() || 0;
  } catch {
    return 0;
  }

  return 0;
};

const formatDate = (ts, locale = "de-DE") => {
  if (!ts) return "—";

  try {
    if (typeof ts.toDate === "function") {
      return ts.toDate().toLocaleString(locale);
    }

    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString(locale);
    }

    if (typeof ts === "string") {
      const parsed = new Date(ts);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString(locale);
      }
    }

    return String(ts);
  } catch {
    return "—";
  }
};

const mapTypeKey = (type) => {
  if (!type) return "unknown";
  return String(type).replace(/\./g, "_");
};

const getTypeBadgeClass = (type) => {
  const value = String(type || "");

  if (value.startsWith("role.")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (value.startsWith("agent.")) {
    return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300";
  }

  if (value.startsWith("support.")) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (value.startsWith("listing.")) {
    return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300";
  }

  if (value.startsWith("finance.")) {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/40 dark:text-fuchsia-300";
  }

  return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";
};

const safeString = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

export default function ActivityLogTable() {
  const { t, i18n } = useTranslation("admin");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const locale = i18n.language?.startsWith("en") ? "en-US" : "de-DE";

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      setLoading(true);

      try {
        let snap;

        try {
          const q = query(
            collection(db, "logs"),
            orderBy("createdAt", "desc"),
            limit(MAX_LOGS)
          );
          snap = await getDocs(q);
        } catch {
          snap = await getDocs(collection(db, "logs"));
        }

        if (!isMounted) return;

        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        items.sort((a, b) => getTimeValue(b) - getTimeValue(a));
        setLogs(items.slice(0, MAX_LOGS));
      } catch (err) {
        console.error("[ActivityLogTable] loadLogs error:", err);
        if (isMounted) setLogs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderType = (log) => {
    const rawType = log?.type || log?.action || null;
    if (!rawType) return "—";

    const key = mapTypeKey(rawType);

    return t(`activityLog.types.${key}`, {
      defaultValue: rawType,
    });
  };

  const renderContext = (log) => {
    const ctx = log?.context || log?.source || null;
    if (!ctx) return "—";

    return t(`activityLog.context.${ctx}`, {
      defaultValue: ctx,
    });
  };

  const renderUser = (log) => {
    if (log?.userEmail) return log.userEmail;
    if (log?.userName) return log.userName;
    if (log?.displayName) return log.displayName;
    if (log?.userId) return log.userId;
    if (log?.uid) return log.uid;
    return "—";
  };

  const renderMessage = (log) => {
    if (!log) return "—";

    if (log.message) return log.message;

    const detail = log.detail || log.title || log.listingTitle || null;
    const action = log.type || log.action || "";

    if (action === "role.approved") {
      return t("activityLog.messages.roleApproved", {
        targetRole: log.targetRole || "agent",
        defaultValue: "Rollenwechsel auf „{{targetRole}}“ wurde genehmigt.",
      });
    }

    if (action === "role.rejected") {
      return t("activityLog.messages.roleRejected", {
        defaultValue: "Rollenwechsel wurde abgelehnt.",
      });
    }

    if (action === "agent.cta.become") {
      return t("activityLog.messages.agentCtaBecome", {
        defaultValue: "Nutzer:in hat auf „Makler:in werden“ geklickt.",
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
          "Status der Anzeige „{{title}}“ wurde auf „{{status}}“ geändert.",
      });
    }

    if (action === "listing.deleted") {
      return t("activityLog.messages.listingDeleted", {
        title: detail || "—",
        defaultValue: "Anzeige „{{title}}“ wurde gelöscht.",
      });
    }

    if (action === "finance.leadStatusChanged") {
      return t("activityLog.messages.financeLeadStatusChanged", {
        status: log.status || log.newStatus || "unknown",
        defaultValue:
          "Status der Finanzierungsanfrage wurde auf „{{status}}“ geändert.",
      });
    }

    if (action === "Marked support as resolved") {
      return t("activityLog.messages.supportResolved", {
        defaultValue: "Supportnachricht wurde als erledigt markiert.",
      });
    }

    if (action === "Deleted listing") {
      return t("activityLog.messages.listingDeleted", {
        title: detail || "—",
        defaultValue: "Anzeige „{{title}}“ wurde gelöscht.",
      });
    }

    if (safeString(action).startsWith("Changed status to ")) {
      const status = safeString(action).replace("Changed status to ", "");

      return t("activityLog.messages.listingStatusChanged", {
        title: detail || "—",
        status,
        defaultValue:
          "Status der Anzeige „{{title}}“ wurde auf „{{status}}“ geändert.",
      });
    }

    if (action === "Updated finance lead status") {
      return t("activityLog.messages.financeLeadStatusChanged", {
        status: detail || "—",
        defaultValue:
          "Status der Finanzierungsanfrage wurde auf „{{status}}“ geändert.",
      });
    }

    if (action === "Approved role upgrade") {
      return t("activityLog.messages.roleApproved", {
        targetRole: log.targetRole || "agent",
        defaultValue: "Rollenwechsel auf „{{targetRole}}“ wurde genehmigt.",
      });
    }

    if (action === "Rejected role upgrade") {
      const base = t("activityLog.messages.roleRejected", {
        defaultValue: "Rollenwechsel wurde abgelehnt.",
      });

      return detail ? `${base} (${detail})` : base;
    }

    if (detail) return detail;
    if (action) return action;

    return "—";
  };

  const typeOptions = useMemo(() => {
    const unique = new Set();

    logs.forEach((log) => {
      const type = log.type || log.action;
      if (type) unique.add(String(type));
    });

    return Array.from(unique).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return logs.filter((log) => {
      const rawType = safeString(log.type || log.action);
      const message = safeString(renderMessage(log));
      const user = safeString(renderUser(log));
      const context = safeString(renderContext(log));

      const matchesType = typeFilter === "all" || rawType === typeFilter;

      const matchesSearch =
        !term ||
        rawType.toLowerCase().includes(term) ||
        message.toLowerCase().includes(term) ||
        user.toLowerCase().includes(term) ||
        context.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [logs, search, typeFilter]);

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-4 py-5 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <FiActivity />
              {t("activityLog.badge", {
                defaultValue: "Admin-Protokoll",
              })}
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white md:text-xl">
              {t("activityLog.title", {
                defaultValue: "Aktivitätsprotokoll",
              })}
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {t("activityLog.subtitle", {
                defaultValue:
                  "Übersicht über wichtige Aktionen auf MyHome24App. Diese Ansicht ist nur für Administrator:innen sichtbar.",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px] lg:min-w-[520px]">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("activityLog.searchPlaceholder", {
                  defaultValue: "Log suchen...",
                })}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950/50"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950/50"
            >
              <option value="all">
                {t("activityLog.filters.allTypes", {
                  defaultValue: "Alle Typen",
                })}
              </option>

              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {t(`activityLog.types.${mapTypeKey(type)}`, {
                    defaultValue: type,
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<FiDatabase />}
            label={t("activityLog.stats.total", {
              defaultValue: "Gesamt",
            })}
            value={logs.length}
          />
          <StatCard
            icon={<FiSearch />}
            label={t("activityLog.stats.filtered", {
              defaultValue: "Gefiltert",
            })}
            value={filteredLogs.length}
          />
          <StatCard
            icon={<FiClock />}
            label={t("activityLog.stats.limit", {
              defaultValue: "Max. geladen",
            })}
            value={MAX_LOGS}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            <tr>
              <th className="w-56 px-4 py-3 text-left font-semibold">
                {t("activityLog.columns.type", { defaultValue: "Typ" })}
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                {t("activityLog.columns.message", {
                  defaultValue: "Nachricht",
                })}
              </th>
              <th className="w-56 px-4 py-3 text-left font-semibold">
                {t("activityLog.columns.user", { defaultValue: "User" })}
              </th>
              <th className="w-40 px-4 py-3 text-left font-semibold">
                {t("activityLog.columns.context", {
                  defaultValue: "Kontext",
                })}
              </th>
              <th className="w-48 px-4 py-3 text-left font-semibold">
                {t("activityLog.columns.date", { defaultValue: "Datum" })}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-400" />
                    <p>
                      {t("activityLog.loading", {
                        defaultValue: "Protokoll wird geladen…",
                      })}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <FiAlertCircle className="mx-auto mb-3 text-3xl text-slate-400" />
                    <p className="font-semibold">
                      {t("activityLog.empty", {
                        defaultValue: "Noch keine Einträge vorhanden.",
                      })}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              filteredLogs.map((log) => {
                const ts = getTimestamp(log);
                const typeKey = log.type || log.action || "";

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className="cursor-pointer bg-white transition hover:bg-blue-50/60 dark:bg-slate-950 dark:hover:bg-slate-900"
                  >
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex max-w-[220px] items-center rounded-full border px-3 py-1 text-xs font-semibold ${getTypeBadgeClass(
                          typeKey
                        )}`}
                      >
                        <span className="truncate">{renderType(log)}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top text-slate-800 dark:text-slate-100">
                      <p className="line-clamp-2">{renderMessage(log)}</p>
                    </td>

                    <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300">
                      <div className="flex min-w-0 items-center gap-2">
                        <FiUser className="shrink-0 text-slate-400" />
                        <span className="truncate">{renderUser(log)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300">
                      <span className="truncate">{renderContext(log)}</span>
                    </td>

                    <td className="px-4 py-3 align-top text-slate-500 dark:text-slate-400">
                      {formatDate(ts, locale)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {selected && (
        <LogDetailsModal
          log={selected}
          onClose={() => setSelected(null)}
          renderType={renderType}
          renderMessage={renderMessage}
          renderUser={renderUser}
          renderContext={renderContext}
          locale={locale}
          t={t}
        />
      )}
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function LogDetailsModal({
  log,
  onClose,
  renderType,
  renderMessage,
  renderUser,
  renderContext,
  locale,
  t,
}) {
  const timestamp = getTimestamp(log);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("activityLog.detailTitle", {
                defaultValue: "Log-Details",
              })}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {log.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              label={t("activityLog.columns.type", { defaultValue: "Typ" })}
              value={renderType(log)}
            />
            <DetailItem
              label={t("activityLog.columns.date", { defaultValue: "Datum" })}
              value={formatDate(timestamp, locale)}
            />
            <DetailItem
              label={t("activityLog.columns.user", { defaultValue: "User" })}
              value={renderUser(log)}
            />
            <DetailItem
              label={t("activityLog.columns.context", {
                defaultValue: "Kontext",
              })}
              value={renderContext(log)}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("activityLog.columns.message", {
                defaultValue: "Nachricht",
              })}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-900 dark:text-slate-100">
              {renderMessage(log)}
            </p>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
              {t("activityLog.rawData", {
                defaultValue: "Rohdaten",
              })}
            </p>

            <pre className="max-h-[280px] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100 dark:border-slate-800">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-white">
        {value || "—"}
      </p>
    </div>
  );
}