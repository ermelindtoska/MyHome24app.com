// src/components/UserOffersPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { FaEuroSign } from "react-icons/fa";
import { FiEye, FiHome, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const UserOffersPanel = () => {
  const { t } = useTranslation(["offer", "userDashboard"]);
  const { currentUser } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      if (!currentUser?.uid) {
        setOffers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const qOffers = query(
          collection(db, "offers"),
          where("buyerId", "==", currentUser.uid)
        );
        const snap = await getDocs(qOffers);

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setOffers(items);
      } catch (err) {
        console.error("[UserOffersPanel] loadOffers error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [currentUser?.uid]);

  const stats = useMemo(() => {
    const total = offers.length;
    const open = offers.filter((o) => (o.status || "open") === "open").length;
    const accepted = offers.filter((o) => o.status === "accepted").length;
    const rejected = offers.filter((o) => o.status === "rejected").length;
    const withdrawn = offers.filter((o) => o.status === "withdrawn").length;

    return { total, open, accepted, rejected, withdrawn };
  }, [offers]);

  return (
    <section className="mt-10 rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900/80 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4 md:px-6 md:py-5 dark:border-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 mb-3">
              <FaEuroSign className="text-[11px]" />
              {t("userOffers.badge", {
                defaultValue: "Meine Kaufangebote",
              })}
            </div>

            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              {t("userOffers.title", {
                defaultValue: "Meine Angebote",
              })}
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t("userOffers.subtitle", {
                defaultValue:
                  "Behalte den Überblick über alle Kaufangebote, die du für Immobilien abgegeben hast.",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <StatsChip
              icon={<FaEuroSign size={10} />}
              label={t("userOffers.chips.total", { defaultValue: "Gesamt" })}
              value={stats.total}
              color="slate"
            />
            <StatsChip
              label={t("userOffers.chips.open", { defaultValue: "Offen" })}
              value={stats.open}
              color="sky"
            />
            <StatsChip
              label={t("userOffers.chips.accepted", {
                defaultValue: "Angenommen",
              })}
              value={stats.accepted}
              color="emerald"
            />
            <StatsChip
              label={t("userOffers.chips.rejected", {
                defaultValue: "Abgelehnt",
              })}
              value={stats.rejected}
              color="rose"
            />
            <StatsChip
              label={t("userOffers.chips.withdrawn", {
                defaultValue: "Zurückgezogen",
              })}
              value={stats.withdrawn}
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("offer.loading", { defaultValue: "Angebote werden geladen…" })}
            </p>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center dark:border-gray-700">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-300">
              <FiHome size={20} />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t("userOffers.emptyTitle", {
                defaultValue: "Noch keine Angebote vorhanden",
              })}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("userOffers.empty", {
                defaultValue: "Du hast bisher noch keine Angebote abgegeben.",
              })}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-950/70">
                  <tr>
                    <TH>
                      {t("offer.columns.listing", { defaultValue: "Inserat" })}
                    </TH>
                    <TH className="text-right">
                      {t("offer.columns.price", {
                        defaultValue: "Dein Angebot",
                      })}
                    </TH>
                    <TH>
                      {t("offer.columns.status", { defaultValue: "Status" })}
                    </TH>
                    <TH>
                      {t("offer.columns.date", { defaultValue: "Datum" })}
                    </TH>
                    <TH className="text-right">
                      {t("offer.columns.actions", {
                        defaultValue: "Aktionen",
                      })}
                    </TH>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-slate-950/40 transition-colors"
                    >
                      <TD>
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {offer.listingTitle || "—"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {offer.listingCity || t("userOffers.unknownCity", { defaultValue: "Ort unbekannt" })}
                        </div>
                      </TD>

                      <TD className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(offer.amount)}
                        </div>
                      </TD>

                      <TD>
                        <StatusBadge status={offer.status || "open"} t={t} />
                      </TD>

                      <TD>
                        <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <FiClock size={13} />
                          {offer.createdAt?.toDate
                            ? offer.createdAt.toDate().toLocaleString("de-DE")
                            : "—"}
                        </div>
                      </TD>

                      <TD className="text-right">
                        <Link
                          to={`/listing/${offer.listingId}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-slate-800"
                        >
                          <FiEye size={14} />
                          {t("userOffers.actions.viewListing", {
                            defaultValue: "Inserat öffnen",
                          })}
                        </Link>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {offer.listingTitle || "—"}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {offer.listingCity || t("userOffers.unknownCity", { defaultValue: "Ort unbekannt" })}
                      </p>
                    </div>

                    <StatusBadge status={offer.status || "open"} t={t} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("userOffers.offerAmount", {
                          defaultValue: "Dein Angebot",
                        })}
                      </div>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {formatPrice(offer.amount)}
                      </div>
                    </div>

                    <Link
                      to={`/listing/${offer.listingId}`}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      <FiEye size={14} />
                      {t("userOffers.actions.viewListingShort", {
                        defaultValue: "Details",
                      })}
                    </Link>
                  </div>

                  <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                    {offer.createdAt?.toDate
                      ? offer.createdAt.toDate().toLocaleString("de-DE")
                      : "—"}
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

function StatsChip({ icon, label, value, color = "slate" }) {
  const colorClasses =
    {
      slate:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      gray:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
      emerald:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
      rose:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
      sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
    }[color] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return (
    <div
      className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 ${colorClasses}`}
    >
      {icon && <span className="text-xs">{icon}</span>}
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function TH({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-4 align-top text-sm text-gray-800 dark:text-gray-100 ${className}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    open: {
      label: t("offer.status.open", { defaultValue: "Offen" }),
      classes:
        "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800",
    },
    accepted: {
      label: t("offer.status.accepted", { defaultValue: "Angenommen" }),
      classes:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800",
    },
    rejected: {
      label: t("offer.status.rejected", { defaultValue: "Abgelehnt" }),
      classes:
        "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800",
    },
    withdrawn: {
      label: t("offer.status.withdrawn", { defaultValue: "Zurückgezogen" }),
      classes:
        "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
    },
  };

  const conf = map[status] || {
    label: status || "—",
    classes:
      "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${conf.classes}`}
    >
      {conf.label}
    </span>
  );
}

function formatPrice(value) {
  if (typeof value === "number") {
    return `€ ${value.toLocaleString("de-DE", {
      maximumFractionDigits: 0,
    })}`;
  }

  if (!value) return "€ —";
  return `€ ${value}`;
}

export default UserOffersPanel;