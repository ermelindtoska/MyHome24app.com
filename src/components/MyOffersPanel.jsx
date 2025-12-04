// src/components/MyOffersPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { FaEye } from 'react-icons/fa';
import { db } from '../firebase';

function MyOffersPanel({ userId }) {
  const { t } = useTranslation(['userDashboard', 'offer']);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // ---------------------------------------------------
  // Angebote laden (alle Angebote, die dieser User abgegeben hat)
  // ---------------------------------------------------
  useEffect(() => {
    const loadOffers = async () => {
      if (!userId) {
        setOffers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const qOffers = query(
          collection(db, 'offers'),
          where('buyerId', '==', userId)
        );
        const snap = await getDocs(qOffers);

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // neueste zuerst
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setOffers(items);
      } catch (err) {
        console.error('[MyOffersPanel] load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [userId]);

  // ---------------------------------------------------
  // Stats: Gesamt / Offen / Angenommen / Abgelehnt / Zurückgezogen
  // ---------------------------------------------------
  const stats = useMemo(() => {
    const total = offers.length;
    const open = offers.filter((o) => (o.status || 'open') === 'open').length;
    const accepted = offers.filter((o) => o.status === 'accepted').length;
    const rejected = offers.filter((o) => o.status === 'rejected').length;
    const withdrawn = offers.filter((o) => o.status === 'withdrawn').length;
    return { total, open, accepted, rejected, withdrawn };
  }, [offers]);

  // ---------------------------------------------------
  // Angebot zurückziehen (nur wenn noch "open")
  // ---------------------------------------------------
  const handleWithdraw = async (offer) => {
    if (!offer?.id) return;
    if ((offer.status || 'open') !== 'open') return;

    setBusyId(offer.id);
    try {
      const ref = doc(db, 'offers', offer.id);
      await updateDoc(ref, {
        status: 'withdrawn',
        updatedAt: serverTimestamp(),
      });

      // lokal direkt updaten
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id ? { ...o, status: 'withdrawn' } : o
        )
      );
    } catch (err) {
      console.error('[MyOffersPanel] withdraw error:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenDetails = (offer) => setSelectedOffer(offer);
  const handleCloseDetails = () => setSelectedOffer(null);

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <section className="mt-10 bg-slate-950/60 dark:bg-gray-950/70 border border-slate-800/70 dark:border-gray-900 rounded-2xl shadow-sm">
      {/* Header + Chips */}
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-800/70 dark:border-gray-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {t('myOffers.title', { defaultValue: 'Meine Angebote' })}
          </h2>
          <p className="text-sm text-gray-400">
            {t('myOffers.subtitle', {
              defaultValue:
                'Behalte den Überblick über alle Kaufangebote, die du für Immobilien abgegeben hast.',
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <Chip
            label={t('myOffers.chips.total', { defaultValue: 'Gesamt' })}
            value={stats.total}
            color="slate"
          />
          <Chip
            label={t('myOffers.chips.open', { defaultValue: 'Offen' })}
            value={stats.open}
            color="blue"
          />
          <Chip
            label={t('myOffers.chips.accepted', { defaultValue: 'Angenommen' })}
            value={stats.accepted}
            color="emerald"
          />
          <Chip
            label={t('myOffers.chips.rejected', { defaultValue: 'Abgelehnt' })}
            value={stats.rejected}
            color="rose"
          />
          <Chip
            label={t('myOffers.chips.withdrawn', { defaultValue: 'Zurückgezogen' })}
            value={stats.withdrawn}
            color="gray"
          />
        </div>
      </div>

      {/* Inhalt */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        {loading ? (
          <p className="text-sm text-gray-400">
            {t('offer.loading', { defaultValue: 'Angebote werden geladen…' })}
          </p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-gray-400">
            {t('myOffers.empty', {
              defaultValue: 'Du hast bisher noch keine Angebote abgegeben.',
            })}
          </p>
        ) : (
          <>
            {/* Desktop: Tabelle */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <TH>
                      {t('offer.columns.listing', { defaultValue: 'Inserat' })}
                    </TH>
                    <TH>
                      {t('offer.columns.owner', { defaultValue: 'Eigentümer:in' })}
                    </TH>
                    <TH className="text-right">
                      {t('offer.columns.price', { defaultValue: 'Angebot' })}
                    </TH>
                    <TH>
                      {t('offer.columns.status', { defaultValue: 'Status' })}
                    </TH>
                    <TH>
                      {t('offer.columns.date', { defaultValue: 'Datum' })}
                    </TH>
                    <TH className="text-right">
                      {t('offer.columns.actions', { defaultValue: 'Aktionen' })}
                    </TH>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-slate-900/70 transition-colors"
                    >
                      <TD>
                        <div className="font-medium text-gray-100 line-clamp-1">
                          {offer.listingTitle || '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {offer.listingCity || ''}
                        </div>
                      </TD>
                      <TD>
                        <div className="text-xs text-gray-400">
                          {/* Optional: später Owner-Name/Email speichern & anzeigen */}
                          {offer.ownerEmail || '—'}
                        </div>
                      </TD>
                      <TD className="text-right font-semibold text-gray-100">
                        {formatPrice(offer.amount)}
                      </TD>
                      <TD>
                        <StatusBadge status={offer.status || 'open'} />
                      </TD>
                      <TD>
                        <div className="text-xs text-gray-400">
                          {offer.createdAt?.toDate
                            ? offer.createdAt.toDate().toLocaleString('de-DE')
                            : '—'}
                        </div>
                      </TD>
                      <TD className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(offer)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-600 px-2.5 py-1.5 text-xs text-gray-200 hover:bg-slate-800"
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWithdraw(offer)}
                            disabled={
                              busyId === offer.id ||
                              (offer.status || 'open') !== 'open'
                            }
                            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold bg-slate-700 text-gray-100 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {t('myOffers.withdraw', { defaultValue: 'Zurückziehen' })}
                          </button>
                        </div>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Karten */}
            <div className="space-y-3 md:hidden">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-100">
                        {offer.listingTitle || '—'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {offer.listingCity || ''}
                      </div>
                    </div>
                    <StatusBadge status={offer.status || 'open'} />
                  </div>

                  <div className="text-xs text-gray-400">
                    {offer.ownerEmail && (
                      <div className="truncate">{offer.ownerEmail}</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-semibold text-gray-100">
                      {formatPrice(offer.amount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(offer)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-600 px-2.5 py-1 text-xs text-gray-200 hover:bg-slate-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWithdraw(offer)}
                        disabled={
                          busyId === offer.id ||
                          (offer.status || 'open') !== 'open'
                        }
                        className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-700 text-gray-100 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {t('myOffers.withdraw', { defaultValue: 'Zurückziehen' })}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal mit Angebotsdetails */}
      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          onClose={handleCloseDetails}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------
// Sub-Komponenten (wie bei OwnerOffersPanel)
// ---------------------------------------------------

function Chip({ label, value, color = 'slate' }) {
  const colorClasses =
    {
      slate: 'bg-slate-800 text-slate-200',
      blue: 'bg-sky-900/60 text-sky-200',
      emerald: 'bg-emerald-900/60 text-emerald-200',
      rose: 'bg-rose-900/60 text-rose-200',
      gray: 'bg-gray-800 text-gray-200',
    }[color] || 'bg-slate-800 text-slate-200';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorClasses}`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function TH({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 align-top text-gray-100 text-sm ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const map = {
    open: {
      label: 'Offen',
      classes: 'bg-sky-900/50 text-sky-200 border border-sky-700/70',
    },
    accepted: {
      label: 'Angenommen',
      classes: 'bg-emerald-900/40 text-emerald-200 border border-emerald-700/70',
    },
    rejected: {
      label: 'Abgelehnt',
      classes: 'bg-rose-900/40 text-rose-200 border border-rose-700/70',
    },
    withdrawn: {
      label: 'Zurückgezogen',
      classes: 'bg-gray-900/40 text-gray-200 border border-gray-700/70',
    },
  };

  const conf =
    map[status] ||
    ({
      label: status || '—',
      classes: 'bg-gray-800 text-gray-200 border border-gray-700/70',
    });

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${conf.classes}`}
    >
      {conf.label}
    </span>
  );
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `€ ${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
  }
  if (!value) return '€ —';
  return `€ ${value}`;
}

function OfferDetailsModal({ offer, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 text-gray-100 border border-slate-800 shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-400 hover:text-gray-200 text-xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold mb-3">
          {offer.listingTitle || 'Angebotsdetails'}
        </h3>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Inserat: </span>
            {offer.listingTitle || '—'}
          </div>
          {offer.listingCity && (
            <div className="text-xs text-gray-400">{offer.listingCity}</div>
          )}

          <div className="mt-3">
            <span className="font-semibold">Angebot: </span>
            {formatPrice(offer.amount)}
          </div>

          {offer.financing && (
            <div className="mt-3 text-xs text-gray-300">
              <span className="font-semibold">Finanzierung: </span>
              {offer.financing}
            </div>
          )}

          {offer.moveInDate && (
            <div className="mt-1 text-xs text-gray-300">
              <span className="font-semibold">Einzugsdatum: </span>
              {offer.moveInDate}
            </div>
          )}

          {offer.message && (
            <div className="mt-3">
              <span className="font-semibold">Nachricht:</span>
              <p className="mt-1 text-sm text-gray-200 whitespace-pre-line">
                {offer.message}
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            {offer.createdAt?.toDate
              ? `Erstellt am ${offer.createdAt
                  .toDate()
                  .toLocaleString('de-DE')}`
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOffersPanel;
