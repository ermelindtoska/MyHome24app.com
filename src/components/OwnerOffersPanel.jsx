// src/components/OwnerOffersPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { db } from "../firebase";

const STATUS_COLORS = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  accepted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  withdrawn:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function StatusPill({ status, t }) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-0.5 text-xs font-medium">
        –
      </span>
    );
  }

  const key = status.toLowerCase();
  const label = t(`ownerDashboard.offers.status.${key}`, {
    defaultValue: status,
  });

  const cls = STATUS_COLORS[key] || STATUS_COLORS.withdrawn;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

StatusPill.propTypes = {
  status: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default function OwnerOffersPanel({ ownerId }) {
  const { t } = useTranslation("ownerDashboard");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Ngarkon ofertat vetëm nëse kemi ownerId
  useEffect(() => {
    if (!ownerId) return;

    const load = async () => {
      setLoading(true);
      try {
        const qy = query(
          collection(db, "offers"),
          where("ownerId", "==", ownerId)
        );
        const snap = await getDocs(qy);
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Rendit sipas datës
        data.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setOffers(data);
      } catch (err) {
        console.error("[OwnerOffersPanel] error loading offers:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ownerId]);

  const filteredOffers = useMemo(() => {
    if (statusFilter === "all") return offers;
    return offers.filter(
      (o) => (o.status || "pending").toLowerCase() === statusFilter
    );
  }, [offers, statusFilter]);

  const stats = useMemo(() => {
    const total = offers.length;
    const byStatus = offers.reduce(
      (acc, o) => {
        const s = (o.status || "pending").toLowerCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 }
    );
    return { total, ...byStatus };
  }, [offers]);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "offers", id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setOffers((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("[OwnerOffersPanel] updateStatus error:", err);
    }
  };

  return (
    <section className="bg-white/90 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {t("ownerDashboard.offers.title", {
              defaultValue: "Angebote auf deine Inserate",
            })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("ownerDashboard.offers.subtitle", {
              defaultValue:
                "Sieh dir an, welche Interessent:innen Angebote für deine Immobilien abgegeben haben.",
            })}
          </p>
        </div>

        {/* Filter sipas statusit */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <FilterChip
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          >
            {t("ownerDashboard.offers.filter.all", {
              defaultValue: "Alle",
            })}{" "}
            ({stats.total})
          </FilterChip>
          <FilterChip
            active={statusFilter === "pending"}
            onClick={() => setStatusFilter("pending")}
          >
            {t("ownerDashboard.offers.status.pending", {
              defaultValue: "Offen",
            })}{" "}
            ({stats.pending})
          </FilterChip>
          <FilterChip
            active={statusFilter === "accepted"}
            onClick={() => setStatusFilter("accepted")}
          >
            {t("ownerDashboard.offers.status.accepted", {
              defaultValue: "Angenommen",
            })}{" "}
            ({stats.accepted})
          </FilterChip>
          <FilterChip
            active={statusFilter === "rejected"}
            onClick={() => setStatusFilter("rejected")}
          >
            {t("ownerDashboard.offers.status.rejected", {
              defaultValue: "Abgelehnt",
            })}{" "}
            ({stats.rejected})
          </FilterChip>
          <FilterChip
            active={statusFilter === "withdrawn"}
            onClick={() => setStatusFilter("withdrawn")}
          >
            {t("ownerDashboard.offers.status.withdrawn", {
              defaultValue: "Zurückgezogen",
            })}{" "}
            ({stats.withdrawn})
          </FilterChip>
        </div>
      </div>

      {/* Lista / tabela e ofertave */}
      {loading ? (
        <div className="px-4 py-8 md:px-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {t("ownerDashboard.offers.loading", {
            defaultValue: "Angebote werden geladen…",
          })}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="px-4 py-8 md:px-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {t("ownerDashboard.offers.empty", {
            defaultValue:
              "Aktuell liegen keine Angebote für deine Inserate vor.",
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/80">
              <tr>
                <TH>
                  {t("ownerDashboard.offers.columns.listing", {
                    defaultValue: "Inserat",
                  })}
                </TH>
                <TH>
                  {t("ownerDashboard.offers.columns.buyer", {
                    defaultValue: "Interessent:in",
                  })}
                </TH>
                <TH className="text-right">
                  {t("ownerDashboard.offers.columns.amount", {
                    defaultValue: "Betrag",
                  })}
                </TH>
                <TH>
                  {t("ownerDashboard.offers.columns.status", {
                    defaultValue: "Status",
                  })}
                </TH>
                <TH className="text-right">
                  {t("ownerDashboard.offers.columns.date", {
                    defaultValue: "Datum",
                  })}
                </TH>
                <TH className="text-right">
                  {t("ownerDashboard.offers.columns.actions", {
                    defaultValue: "Aktionen",
                  })}
                </TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOffers.map((offer) => {
                const date =
                  offer.createdAt?.toDate?.().toLocaleDateString(
                    "de-DE"
                  ) || "–";
                const amount =
                  typeof offer.amount === "number"
                    ? `€ ${offer.amount.toLocaleString("de-DE", {
                        maximumFractionDigits: 0,
                      })}`
                    : offer.amount || "–";

                return (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-900/60"
                  >
                    <TD>
                      <div className="flex flex-col">
                        <Link
                          to={`/listing/${offer.listingId}`}
                          className="font-medium text-gray-900 dark:text-gray-100 hover:underline"
                        >
                          {offer.listingTitle || "—"}
                        </Link>
                        {offer.city && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {offer.city}
                          </span>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {offer.buyerName || offer.buyerEmail || "—"}
                        </span>
                        {offer.buyerEmail && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {offer.buyerEmail}
                          </span>
                        )}
                      </div>
                    </TD>
                    <TD className="text-right font-semibold text-gray-900 dark:text-gray-100">
                      {amount}
                    </TD>
                    <TD>
                      <StatusPill status={offer.status} t={t} />
                    </TD>
                    <TD className="text-right text-gray-700 dark:text-gray-200">
                      {date}
                    </TD>
                    <TD className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/listing/${offer.listingId}`}
                          className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {t("ownerDashboard.offers.actions.viewListing", {
                            defaultValue: "Inserat öffnen",
                          })}
                        </Link>

                        {/* Butonat Accept / Reject */}
                        {offer.status !== "accepted" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(offer.id, "accepted")
                            }
                            className="inline-flex items-center justify-center rounded-full border border-emerald-500/70 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
                          >
                            {t(
                              "ownerDashboard.offers.actions.accept",
                              { defaultValue: "Annehmen" }
                            )}
                          </button>
                        )}
                        {offer.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(offer.id, "rejected")
                            }
                            className="inline-flex items-center justify-center rounded-full border border-red-500/70 text-red-600 dark:text-red-400 px-2.5 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/40"
                          >
                            {t(
                              "ownerDashboard.offers.actions.reject",
                              { defaultValue: "Ablehnen" }
                            )}
                          </button>
                        )}
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

OwnerOffersPanel.propTypes = {
  ownerId: PropTypes.string,
};

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      } text-xs`}
    >
      {children}
    </button>
  );
}

FilterChip.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

function TH({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

TH.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

function TD({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-3 align-top text-gray-800 dark:text-gray-100 ${className}`}
    >
      {children}
    </td>
  );
}

TD.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
