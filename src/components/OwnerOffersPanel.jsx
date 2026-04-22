import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
 updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { FaCheck, FaTimes, FaEye, FaEuroSign } from "react-icons/fa";
import { db } from "../firebase";
import { logEvent } from "../utils/logEvent";

function OwnerOffersPanel({ ownerId }) {
  const { t } = useTranslation(["ownerDashboard", "offer"]);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [busyOfferId, setBusyOfferId] = useState(null);

  useEffect(() => {
    const loadOffers = async () => {
      if (!ownerId) {
        setOffers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const qOffers = query(
          collection(db, "offers"),
          where("ownerId", "==", ownerId)
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
        console.error("[OwnerOffersPanel] loadOffers error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [ownerId]);

  const stats = useMemo(() => {
    const total = offers.length;
    const open = offers.filter((o) => (o.status || "open") === "open").length;
    const accepted = offers.filter((o) => o.status === "accepted").length;
    const rejected = offers.filter((o) => o.status === "rejected").length;
    return { total, open, accepted, rejected };
  }, [offers]);

  const reloadOffers = async () => {
    if (!ownerId) return;

    const qOffers = query(
      collection(db, "offers"),
      where("ownerId", "==", ownerId)
    );
    const snap = await getDocs(qOffers);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    items.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });

    setOffers(items);
  };

  const handleUpdateStatus = async (offer, newStatus) => {
    if (!offer?.id || !ownerId) return;

    setBusyOfferId(offer.id);

    try {
      if (newStatus === "accepted") {
        const batch = writeBatch(db);

        const offerRef = doc(db, "offers", offer.id);
        batch.update(offerRef, {
          status: "accepted",
          updatedAt: serverTimestamp(),
        });

        if (offer.listingId) {
          const qOthers = query(
            collection(db, "offers"),
            where("listingId", "==", offer.listingId),
            where("ownerId", "==", ownerId)
          );

          const snapOthers = await getDocs(qOthers);

          snapOthers.forEach((d) => {
            if (d.id !== offer.id) {
              batch.update(d.ref, {
                status: "rejected",
                updatedAt: serverTimestamp(),
              });
            }
          });
        }

        await batch.commit();

        await logEvent({
          type: "offer.acceptedByOwner",
          message: `Angebot für "${offer.listingTitle || ""}" wurde angenommen.`,
          listingId: offer.listingId || null,
          offerId: offer.id,
          ownerId,
          buyerId: offer.buyerId || null,
          amount: offer.amount || null,
        });
      } else {
        const offerRef = doc(db, "offers", offer.id);

        await updateDoc(offerRef, {
          status: "rejected",
          updatedAt: serverTimestamp(),
        });

        await logEvent({
          type: "offer.rejectedByOwner",
          message: `Angebot für "${offer.listingTitle || ""}" wurde abgelehnt.`,
          listingId: offer.listingId || null,
          offerId: offer.id,
          ownerId,
          buyerId: offer.buyerId || null,
          amount: offer.amount || null,
        });
      }

      await reloadOffers();
    } catch (err) {
      console.error("[OwnerOffersPanel] update status error:", err);
    } finally {
      setBusyOfferId(null);
    }
  };

  const handleOpenDetails = (offer) => setSelectedOffer(offer);
  const handleCloseDetails = () => setSelectedOffer(null);

  const formatFinancing = (financing) => getFinancingLabel(t, financing);

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("ownerDashboard.incomingOffers.title", {
              defaultValue: "Eingegangene Angebote",
            })}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("ownerDashboard.incomingOffers.subtitle", {
              defaultValue:
                "Verwalte Kaufangebote zu deinen Inseraten ähnlich wie bei Zillow.",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <StatsChip
            icon={<FaEuroSign size={10} />}
            label={t("ownerDashboard.incomingOffers.chips.total", {
              defaultValue: "Gesamt",
            })}
            value={stats.total}
            color="slate"
          />
          <StatsChip
            label={t("ownerDashboard.incomingOffers.chips.open", {
              defaultValue: "Offen",
            })}
            value={stats.open}
            color="gray"
          />
          <StatsChip
            label={t("ownerDashboard.incomingOffers.chips.accepted", {
              defaultValue: "Angenommen",
            })}
            value={stats.accepted}
            color="emerald"
          />
          <StatsChip
            label={t("ownerDashboard.incomingOffers.chips.rejected", {
              defaultValue: "Abgelehnt",
            })}
            value={stats.rejected}
            color="rose"
          />
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5">
        {loading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("offer.loading", { defaultValue: "Angebote werden geladen…" })}
          </p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("ownerDashboard.incomingOffers.empty", {
              defaultValue:
                "Aktuell liegen keine Angebote zu deinen Inseraten vor.",
            })}
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-900/80">
                  <tr>
                    <TH>
                      {t("offer.columns.buyer", {
                        defaultValue: "Interessent:in",
                      })}
                    </TH>
                    <TH>
                      {t("offer.columns.listing", {
                        defaultValue: "Inserat",
                      })}
                    </TH>
                    <TH className="text-right">
                      {t("offer.columns.price", {
                        defaultValue: "Angebot",
                      })}
                    </TH>
                    <TH>
                      {t("offer.columns.status", {
                        defaultValue: "Status",
                      })}
                    </TH>
                    <TH>
                      {t("offer.columns.date", {
                        defaultValue: "Datum",
                      })}
                    </TH>
                    <TH className="text-right">
                      {t("offer.columns.actions", {
                        defaultValue: "Aktionen",
                      })}
                    </TH>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/70"
                    >
                      <TD>
                        <div className="line-clamp-1 font-medium text-slate-900 dark:text-white">
                          {offer.buyerName || "—"}
                        </div>
                        <div className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                          {offer.buyerEmail || "—"}
                        </div>
                      </TD>

                      <TD>
                        <div className="line-clamp-1 font-medium text-slate-900 dark:text-white">
                          {offer.listingTitle || "—"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {offer.listingCity || ""}
                        </div>
                      </TD>

                      <TD className="text-right font-semibold text-slate-900 dark:text-white">
                        <div>{formatPrice(offer.amount)}</div>

                        {(offer.financing || offer.moveInDate) && (
                          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {offer.financing && (
                              <span>{formatFinancing(offer.financing)}</span>
                            )}
                            {offer.financing && offer.moveInDate && " · "}
                            {offer.moveInDate && (
                              <span>
                                {t("offer.moveInDateShort", {
                                  defaultValue: "Einzug ab",
                                })}{" "}
                                {offer.moveInDate}
                              </span>
                            )}
                          </div>
                        )}
                      </TD>

                      <TD>
                        <StatusBadge status={offer.status || "open"} t={t} />
                      </TD>

                      <TD>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {offer.createdAt?.toDate
                            ? offer.createdAt.toDate().toLocaleString("de-DE")
                            : "—"}
                        </div>
                      </TD>

                      <TD className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(offer)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            title={t("offer.actions.view", {
                              defaultValue: "Details",
                            })}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(offer, "accepted")
                            }
                            disabled={
                              busyOfferId === offer.id ||
                              offer.status === "accepted"
                            }
                            className={`inline-flex items-center justify-center rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                              offer.status === "accepted"
                                ? "cursor-default bg-emerald-700 text-white"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            }`}
                            title={t("offer.actions.accept", {
                              defaultValue: "Annehmen",
                            })}
                          >
                            <FaCheck />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(offer, "rejected")
                            }
                            disabled={
                              busyOfferId === offer.id ||
                              offer.status === "rejected"
                            }
                            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            title={t("offer.actions.reject", {
                              defaultValue: "Ablehnen",
                            })}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {offer.listingTitle || "—"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {offer.listingCity || ""}
                      </div>
                    </div>
                    <StatusBadge status={offer.status || "open"} t={t} />
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {offer.buyerName && (
                      <div>
                        <span className="font-semibold">
                          {t("offer.labels.buyer", {
                            defaultValue: "Interessent:in",
                          })}
                          {": "}
                        </span>
                        {offer.buyerName}
                      </div>
                    )}
                    {offer.buyerEmail && (
                      <div className="truncate">{offer.buyerEmail}</div>
                    )}
                  </div>

                  {(offer.financing || offer.moveInDate) && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {offer.financing && (
                        <div>
                          <span className="font-semibold">
                            {t("offer.labels.financing", {
                              defaultValue: "Finanzierung",
                            })}
                            {": "}
                          </span>
                          {formatFinancing(offer.financing)}
                        </div>
                      )}
                      {offer.moveInDate && (
                        <div>
                          <span className="font-semibold">
                            {t("offer.labels.moveInDate", {
                              defaultValue: "Einzug ab",
                            })}
                            {": "}
                          </span>
                          {offer.moveInDate}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(offer.amount)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(offer)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FaEye />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(offer, "accepted")
                        }
                        disabled={
                          busyOfferId === offer.id ||
                          offer.status === "accepted"
                        }
                        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FaCheck />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(offer, "rejected")
                        }
                        disabled={
                          busyOfferId === offer.id ||
                          offer.status === "rejected"
                        }
                        className="inline-flex items-center justify-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          onClose={handleCloseDetails}
          onAccept={() => handleUpdateStatus(selectedOffer, "accepted")}
          onReject={() => handleUpdateStatus(selectedOffer, "rejected")}
          busy={busyOfferId === selectedOffer.id}
          t={t}
        />
      )}
    </section>
  );
}

function StatsChip({ icon, label, value, color = "slate" }) {
  const colorClasses =
    {
      slate:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
      emerald:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
      rose:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200",
    }[color] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorClasses}`}
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
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-3 align-top text-sm text-slate-900 dark:text-white ${className}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    open: {
      label: t("offer.status.open", {
        defaultValue: "Offen",
      }),
      classes: "border border-sky-700/70 bg-sky-900/50 text-sky-200",
    },
    accepted: {
      label: t("offer.status.accepted", {
        defaultValue: "Angenommen",
      }),
      classes:
        "border border-emerald-700/70 bg-emerald-900/40 text-emerald-200",
    },
    rejected: {
      label: t("offer.status.rejected", {
        defaultValue: "Abgelehnt",
      }),
      classes: "border border-rose-700/70 bg-rose-900/40 text-rose-200",
    },
  };

  const conf = map[status] || {
    label: status || "—",
    classes: "border border-gray-700/70 bg-gray-800 text-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${conf.classes}`}
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

function getFinancingLabel(t, value) {
  if (!value || value === "none") {
    return t("offer.financingOptions.none", {
      defaultValue: "Keine Angabe zur Finanzierung",
    });
  }
  if (value === "cash") {
    return t("offer.financingOptions.cash", {
      defaultValue: "Kaufpreis wird bar / ohne Finanzierung bezahlt",
    });
  }
  if (value === "mortgageApproved") {
    return t("offer.financingOptions.mortgageApproved", {
      defaultValue: "Finanzierung ist bereits zugesagt",
    });
  }
  if (value === "mortgagePlanned") {
    return t("offer.financingOptions.mortgagePlanned", {
      defaultValue: "Finanzierung ist geplant",
    });
  }
  return value;
}

function OfferDetailsModal({ offer, onClose, onAccept, onReject, busy, t }) {
  const financingLabel = getFinancingLabel(t, offer.financing);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-xl leading-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          aria-label={t("offer.modal.close", { defaultValue: "Schließen" })}
        >
          &times;
        </button>

        <h3 className="mb-3 text-lg font-semibold">
          {t("offer.modal.title", { defaultValue: "Angebotsdetails" })}
        </h3>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">
              {t("offer.labels.listing", { defaultValue: "Inserat: " })}
            </span>
            {offer.listingTitle || "—"}
          </div>

          {offer.listingCity && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {offer.listingCity}
            </div>
          )}

          <div className="mt-3">
            <span className="font-semibold">
              {t("offer.labels.buyer", { defaultValue: "Käufer: " })}
            </span>
            {offer.buyerName || "—"}
          </div>

          {offer.buyerEmail && (
            <div className="break-all text-xs text-slate-500 dark:text-slate-400">
              {offer.buyerEmail}
            </div>
          )}

          <div className="mt-3">
            <span className="font-semibold">
              {t("offer.labels.offerAmount", {
                defaultValue: "Angebot: ",
              })}
            </span>
            {formatPrice(offer.amount)}
          </div>

          {offer.financing && (
            <div className="mt-2">
              <span className="font-semibold">
                {t("offer.labels.financing", {
                  defaultValue: "Finanzierung: ",
                })}
              </span>
              {financingLabel}
            </div>
          )}

          {offer.moveInDate && (
            <div className="mt-2">
              <span className="font-semibold">
                {t("offer.labels.moveInDate", {
                  defaultValue: "Einzug ab: ",
                })}
              </span>
              {offer.moveInDate}
            </div>
          )}

          {offer.message && (
            <div className="mt-3">
              <span className="font-semibold">
                {t("offer.labels.message", {
                  defaultValue: "Nachricht:",
                })}
              </span>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
                {offer.message}
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {offer.createdAt?.toDate
              ? t("offer.labels.createdAt", {
                  defaultValue: "Erstellt am {{date}}",
                  date: offer.createdAt.toDate().toLocaleString("de-DE"),
                })
              : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onReject}
            disabled={busy || offer.status === "rejected"}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("offer.actions.reject", { defaultValue: "Ablehnen" })}
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={busy || offer.status === "accepted"}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("offer.actions.accept", { defaultValue: "Annehmen" })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OwnerOffersPanel;