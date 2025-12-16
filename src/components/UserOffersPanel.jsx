// src/components/UserOffersPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { FaEuroSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const UserOffersPanel = () => {
  const { t } = useTranslation(['offer', 'userDashboard']);
  const { currentUser } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // Eigene Angebote laden (buyerId = aktueller User)
  // ---------------------------------------------------
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
          collection(db, 'offers'),
          where('buyerId', '==', currentUser.uid)
        );
        const snap = await getDocs(qOffers);

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Neueste zuerst
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setOffers(items);
      } catch (err) {
        console.error('[UserOffersPanel] loadOffers error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [currentUser]);

  // ---------------------------------------------------
  // Stats
  // ---------------------------------------------------
  const stats = useMemo(() => {
    const total = offers.length;
    const open = offers.filter((o) => (o.status || 'open') === 'open').length;
    const accepted = offers.filter((o) => o.status === 'accepted').length;
    const rejected = offers.filter((o) => o.status === 'rejected').length;
    // optional später: withdrawn
    return { total, open, accepted, rejected };
  }, [offers]);

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <section className="mt-10 bg-slate-950/60 dark:bg-gray-950/70 border border-slate-800/70 dark:border-gray-900 rounded-2xl shadow-sm">
      {/* Header + Chips */}
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-800/70 dark:border-gray-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {t('userOffers.title', {
              defaultValue: 'Meine Angebote',
            })}
          </h2>
          <p className="text-sm text-gray-400">
            {t('userOffers.subtitle', {
              defaultValue:
                'Behalte den Überblick über alle Kaufangebote, die du für Immobilien abgegeben hast.',
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <StatsChip
            icon={<FaEuroSign size={10} />}
            label={t('userOffers.chips.total', { defaultValue: 'Gesamt' })}
            value={stats.total}
            color="slate"
          />
          <StatsChip
            label={t('userOffers.chips.open', { defaultValue: 'Offen' })}
            value={stats.open}
            color="gray"
          />
          <StatsChip
            label={t('userOffers.chips.accepted', { defaultValue: 'Angenommen' })}
            value={stats.accepted}
            color="emerald"
          />
          <StatsChip
            label={t('userOffers.chips.rejected', { defaultValue: 'Abgelehnt' })}
            value={stats.rejected}
            color="rose"
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
            {t('userOffers.empty', {
              defaultValue:
                'Du hast bisher noch keine Angebote abgegeben.',
            })}
          </p>
        ) : (
          <>
            {/* Desktop-Tabelle */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <TH>
                      {t('offer.columns.listing', { defaultValue: 'Inserat' })}
                    </TH>
                    <TH className="text-right">
                      {t('offer.columns.price', { defaultValue: 'Dein Angebot' })}
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
                        <div className="text-xs text-gray-400 line-clamp-1">
                          {offer.listingCity || ''}
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
                            ? offer.createdAt
                                .toDate()
                                .toLocaleString('de-DE')
                            : '—'}
                        </div>
                      </TD>
                      <TD className="text-right">
                        <Link
                          to={`/listing/${offer.listingId}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-600 px-3 py-1.5 text-xs text-gray-200 hover:bg-slate-800"
                        >
                          {t('userOffers.actions.viewListing', {
                            defaultValue: 'Inserat öffnen',
                          })}
                        </Link>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile-Karten */}
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

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-semibold text-gray-100">
                      {formatPrice(offer.amount)}
                    </div>
                    <Link
                      to={`/listing/${offer.listingId}`}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {t('userOffers.actions.viewListingShort', {
                        defaultValue: 'Details',
                      })}
                    </Link>
                  </div>

                  <div className="mt-1 text-[11px] text-gray-400">
                    {offer.createdAt?.toDate
                      ? offer.createdAt
                          .toDate()
                          .toLocaleString('de-DE')
                      : null}
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

// ---------------------------------------------------
// Sub-Komponenten (gleich wie im Owner-Panel, damit Style passt)
// ---------------------------------------------------

function StatsChip({ icon, label, value, color = 'slate' }) {
  const colorClasses =
    {
      slate: 'bg-slate-800 text-slate-200',
      gray: 'bg-gray-800 text-gray-200',
      emerald: 'bg-emerald-900/60 text-emerald-200',
      rose: 'bg-rose-900/60 text-rose-200',
    }[color] || 'bg-slate-800 text-slate-200';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorClasses}`}>
      {icon && <span className="text-xs">{icon}</span>}
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
      classes:
        'bg-sky-900/50 text-sky-200 border border-sky-700/70',
    },
    accepted: {
      label: 'Angenommen',
      classes:
        'bg-emerald-900/40 text-emerald-200 border border-emerald-700/70',
    },
    rejected: {
      label: 'Abgelehnt',
      classes:
        'bg-rose-900/40 text-rose-200 border border-rose-700/70',
    },
  };

  const conf =
    map[status] ||
    {
      label: status || '—',
      classes: 'bg-gray-800 text-gray-200 border border-gray-700/70',
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
  if (typeof value === 'number') {
    return `€ ${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
  }
  if (!value) return '€ —';
  return `€ ${value}`;
}

export default UserOffersPanel;
