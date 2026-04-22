import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { FaEye } from "react-icons/fa";
import { db } from "../firebase";

function MyOffersPanel({ userId }) {
  const { t } = useTranslation(["userDashboard", "offer"]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const loadOffers = async () => {
      if (!userId) {
        setOffers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const qOffers = query(collection(db, "offers"), where("buyerId", "==", userId));
        const snap = await getDocs(qOffers);

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setOffers(items);
      } catch (err) {
        console.error("[MyOffersPanel] load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [userId]);

  const stats = useMemo(() => {
    const total = offers.length;
    const open = offers.filter((o) => (o.status || "open") === "open").length;
    const accepted = offers.filter((o) => o.status === "accepted").length;
    const rejected = offers.filter((o) => o.status === "rejected").length;
    const withdrawn = offers.filter((o) => o.status === "withdrawn").length;
    return { total, open, accepted, rejected, withdrawn };
  }, [offers]);

  const handleWithdraw = async (offer) => {
    if (!offer?.id) return;
    if ((offer.status || "open") !== "open") return;

    setBusyId(offer.id);
    try {
      const ref = doc(db, "offers", offer.id);
      await updateDoc(ref, {
        status: "withdrawn",
        updatedAt: serverTimestamp(),
      });

      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, status: "withdrawn" } : o))
      );
    } catch (err) {
      console.error("[MyOffersPanel] withdraw error:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenDetails = (offer) => setSelectedOffer(offer);
  const handleCloseDetails = () => setSelectedOffer(null);

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t("myOffers.title", { defaultValue: "Meine Angebote" })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("myOffers.subtitle", {
              defaultValue:
                "Behalte den Überblick über alle Kaufangebote, die du für Immobilien abgegeben hast.",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <Chip
            label={t("myOffers.chips.total", { defaultValue: "Gesamt" })}
            value={stats.total}
            color="slate"
          />
          <Chip
            label={t("myOffers.chips.open", { defaultValue: "Offen" })}
            value={stats.open}
            color="blue"
          />
          <Chip
            label={t("myOffers.chips.accepted", { defaultValue: "Angenommen" })}
            value={stats.accepted}
            color="emerald"
          />
          <Chip
            label={t("myOffers.chips.rejected", { defaultValue: "Abgelehnt" })}
            value={stats.rejected}
            color="rose"
          />
          <Chip
            label={t("myOffers.chips.withdrawn", { defaultValue: "Zurückgezogen" })}
            value={stats.withdrawn}
            color="gray"
          />
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("offer.loading", { defaultValue: "Angebote werden geladen…" })}
          </p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("myOffers.empty", {
              defaultValue: "Du hast bisher noch keine Angebote abgegeben.",
            })}
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/80">
                  <tr>
                    <TH>
                      {t("offer.columns.listing", { defaultValue: "Inserat" })}
                    </TH>
                    <TH>
                      {t("offer.columns.owner", { defaultValue: "Eigentümer:in" })}
                    </TH>
                    <TH className="text-right">
                      {t("offer.columns.price", { defaultValue: "Angebot" })}
                    </TH>
                    <TH>
                      {t("offer.columns.status", { defaultValue: "Status" })}
                    </TH>
                    <TH>
                      {t("offer.columns.date", { defaultValue: "Datum" })}
                    </TH>
                    <TH className="text-right">
                      {t("offer.columns.actions", { defaultValue: "Aktionen" })}
                    </TH>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <TD>
                        <div className="line-clamp-1 font-medium text-gray-900 dark:text-gray-100">
                          {offer.listingTitle || "—"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {offer.listingCity || ""}
                        </div>
                      </TD>

                      <TD>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {offer.ownerEmail || "—"}
                        </div>
                      </TD>

                      <TD className="text-right font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(offer.amount)}
                      </TD>

                      <TD>
                        <StatusBadge status={offer.status || "open"} t={t} />
                      </TD>

                      <TD>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-slate-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
                            title={t("actions.details", { ns: "offer", defaultValue: "Details" })}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleWithdraw(offer)}
                            disabled={busyId === offer.id || (offer.status || "open") !== "open"}
                            className="inline-flex items-center justify-center rounded-full bg-slate-700 px-3 py-1.5 text-xs font-semibold text-gray-100 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {t("myOffers.withdraw", { defaultValue: "Zurückziehen" })}
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
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {offer.listingTitle || "—"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {offer.listingCity || ""}
                      </div>
                    </div>
                    <StatusBadge status={offer.status || "open"} t={t} />
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {offer.ownerEmail && <div className="truncate">{offer.ownerEmail}</div>}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(offer.amount)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(offer)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-slate-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWithdraw(offer)}
                        disabled={busyId === offer.id || (offer.status || "open") !== "open"}
                        className="inline-flex items-center justify-center rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-gray-100 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t("myOffers.withdraw", { defaultValue: "Zurückziehen" })}
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
        <OfferDetailsModal offer={selectedOffer} onClose={handleCloseDetails} t={t} />
      )}
    </section>
  );
}

function Chip({ label, value, color = "slate" }) {
  const colorClasses =
    {
      slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      blue: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
      emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
      rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200",
      gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
    }[color] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorClasses}`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function TH({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-top text-sm text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    open: {
      label: t("status.open", { ns: "offer", defaultValue: "Offen" }),
      classes: "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/50 dark:text-sky-200 dark:border-sky-700/70",
    },
    accepted: {
      label: t("status.accepted", { ns: "offer", defaultValue: "Angenommen" }),
      classes:
        "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/70",
    },
    rejected: {
      label: t("status.rejected", { ns: "offer", defaultValue: "Abgelehnt" }),
      classes:
        "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700/70",
    },
    withdrawn: {
      label: t("status.withdrawn", { ns: "offer", defaultValue: "Zurückgezogen" }),
      classes:
        "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700/70",
    },
  };

  const conf = map[status] || {
    label: status || "—",
    classes: "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700/70",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${conf.classes}`}>
      {conf.label}
    </span>
  );
}

function formatPrice(value) {
  if (typeof value === "number") {
    return `€ ${value.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
  }
  if (!value) return "€ —";
  return `€ ${value}`;
}

function financingLabel(t, value) {
  if (!value) return "—";

  const map = {
    none: t("financingOptions.none", { ns: "offer", defaultValue: "Nicht angegeben" }),
    cash: t("financingOptions.cash", { ns: "offer", defaultValue: "Bar / Eigenkapital" }),
    mortgageApproved: t("financingOptions.mortgageApproved", {
      ns: "offer",
      defaultValue: "Finanzierung bereits zugesagt",
    }),
    mortgagePlanned: t("financingOptions.mortgagePlanned", {
      ns: "offer",
      defaultValue: "Finanzierung noch in Planung",
    }),
  };

  return map[value] || value;
}

function OfferDetailsModal({ offer, onClose, t }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-gray-900 shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-gray-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-xl leading-none text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label={t("close", { ns: "offer", defaultValue: "Schließen" })}
        >
          &times;
        </button>

        <h3 className="mb-3 text-lg font-semibold">
          {t("myOffers.title", { defaultValue: "Meine Angebote" })}
        </h3>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">
              {t("columns.listing", { ns: "offer", defaultValue: "Inserat" })}:{" "}
            </span>
            {offer.listingTitle || "—"}
          </div>

          {offer.listingCity && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{offer.listingCity}</div>
          )}

          <div className="mt-3">
            <span className="font-semibold">
              {t("columns.price", { ns: "offer", defaultValue: "Angebot" })}:{" "}
            </span>
            {formatPrice(offer.amount)}
          </div>

          {offer.financing && (
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">
                {t("financingLabel", { ns: "offer", defaultValue: "Finanzierung" })}:{" "}
              </span>
              {financingLabel(t, offer.financing)}
            </div>
          )}

          {offer.moveInDate && (
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">
                {t("moveInDateLabel", { ns: "offer", defaultValue: "Gewünschtes Einzugsdatum" })}:{" "}
              </span>
              {offer.moveInDate}
            </div>
          )}

          {offer.message && (
            <div className="mt-3">
              <span className="font-semibold">
                {t("messageLabel", { ns: "offer", defaultValue: "Nachricht" })}:
              </span>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">
                {offer.message}
              </p>
            </div>
          )}

          <div className="mt-3">
            <span className="font-semibold">
              {t("columns.status", { ns: "offer", defaultValue: "Status" })}:{" "}
            </span>
            <StatusBadge status={offer.status || "open"} t={t} />
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {offer.createdAt?.toDate
              ? `${t("columns.date", { ns: "offer", defaultValue: "Datum" })}: ${offer.createdAt
                  .toDate()
                  .toLocaleString("de-DE")}`
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOffersPanel;