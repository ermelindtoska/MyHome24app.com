// src/pages/OwnerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaHome,
  FaRegClock,
  FaRegPauseCircle,
} from 'react-icons/fa';

import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import OwnerOffersPanel from '../components/OwnerOffersPanel';

const FALLBACK_IMG = '/images/hero-1.jpg';

function firstImage(listing) {
  if (Array.isArray(listing?.images) && listing.images.length > 0) {
    return listing.images[0];
  }
  if (Array.isArray(listing?.imageUrls) && listing.imageUrls.length > 0) {
    return listing.imageUrls[0];
  }
  if (listing?.imageUrl) return listing.imageUrl;
  if (listing?.primaryImageUrl) return listing.primaryImageUrl;
  return FALLBACK_IMG;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  // përdor kryesisht ownerDashboard, por mund të bjerë edhe te listing si fallback
  const { t } = useTranslation(['ownerDashboard', 'listing']);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // ============================================================
  // Ngarkimi i listimeve të pronarit (ownerId ose userId)
  // ============================================================
  useEffect(() => {
    if (authLoading || !currentUser?.uid) return;

    const load = async () => {
      setLoading(true);
      try {
        const uid = currentUser.uid;
        const results = [];

        // 1) Së pari provojmë me ownerId (skema e re)
        const qOwner = query(
          collection(db, 'listings'),
          where('ownerId', '==', uid)
        );
        const snapOwner = await getDocs(qOwner);
        snapOwner.forEach((d) =>
          results.push({ id: d.id, ...d.data() })
        );

        // 2) Për kompatibilitet me vjetrat: userId
        const existingIds = new Set(results.map((x) => x.id));
        const qUser = query(
          collection(db, 'listings'),
          where('userId', '==', uid)
        );
        const snapUser = await getDocs(qUser);
        snapUser.forEach((d) => {
          if (!existingIds.has(d.id)) {
            results.push({ id: d.id, ...d.data() });
          }
        });

        // Mund t’i rendisim sipas createdAt në front, nëse ekziston
        results.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setListings(results);
      } catch (err) {
        console.error('[OwnerDashboard] error loading listings:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser?.uid, authLoading]);

  // ============================================================
  // Statistikat (si kartat në krye)
  // ============================================================
  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((l) => l.status === 'active').length;
    const inactive = listings.filter(
      (l) => l.status && l.status !== 'active'
    ).length;
    const noStatus = listings.filter((l) => !l.status).length;

    return { total, active, inactive, noStatus };
  }, [listings]);

  // ============================================================
  // Fshirja e një listingu
  // ============================================================
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteDoc(doc(db, 'listings', confirmDeleteId));
      setListings((prev) =>
        prev.filter((x) => x.id !== confirmDeleteId)
      );
    } catch (err) {
      console.error('[OwnerDashboard] delete error:', err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // ============================================================
  // Navigime të shpejta
  // ============================================================
  const goToPublish = () => navigate('/publish');
  const goToSupport = () => navigate('/support');
  const goToPublicListings = () => navigate('/listings');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        {t('ownerDashboard.loading', {
          defaultValue: 'Dashboard wird geladen…',
        })}
      </div>
    );
  }

  if (!currentUser) {
    // normalisht rri i mbrojtur nga RequireRole, por për siguri:
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        {t('ownerDashboard.noUser', {
          defaultValue: 'Bitte zuerst einloggen.',
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ======================================================
           HEADER & CTA
        ======================================================= */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('ownerDashboard.title', {
                defaultValue: 'Owner-Dashboard',
              })}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t('ownerDashboard.subtitle', {
                defaultValue:
                  'Verwalte deine Inserate, Angebote und Anfragen – alles an einem Ort.',
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={goToPublish}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
          >
            <FaPlus />
            {t('ownerDashboard.ctaNewListing', {
              defaultValue: 'Neue Immobilie veröffentlichen',
            })}
          </button>
        </header>

        {/* ======================================================
           STATS CARDS
        ======================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FaHome />}
            label={t('ownerDashboard.stats.total', {
              defaultValue: 'Gesamt',
            })}
            value={stats.total}
            accent="blue"
          />
          <StatCard
            icon={<FaHome />}
            label={t('ownerDashboard.stats.active', {
              defaultValue: 'Aktiv',
            })}
            value={stats.active}
            accent="emerald"
          />
          <StatCard
            icon={<FaRegPauseCircle />}
            label={t('ownerDashboard.stats.inactive', {
              defaultValue: 'Inaktiv / Entwurf',
            })}
            value={stats.inactive}
            accent='amber'
          />
          <StatCard
            icon={<FaRegClock />}
            label={t('ownerDashboard.stats.noStatus', {
              defaultValue: 'Ohne Status (älter)',
            })}
            value={stats.noStatus}
            accent="gray"
          />
        </section>

        {/* ======================================================
           QUICK ACTIONS
        ======================================================= */}
        <section className="bg-white/90 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm px-4 py-4 md:px-6 md:py-5">
          <h2 className="text-lg font-semibold mb-3">
            {t('ownerDashboard.quickActions.title', {
              defaultValue: 'Schnellaktionen',
            })}
          </h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={goToPublish}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
            >
              <FaPlus />
              {t('ownerDashboard.quickActions.newListing', {
                defaultValue: 'Neue Anzeige erstellen',
              })}
            </button>

            <button
              type="button"
              onClick={goToPublicListings}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FaHome />
              {t('ownerDashboard.quickActions.viewPublic', {
                defaultValue: 'Öffentliche Seite anzeigen',
              })}
            </button>

            <button
              type="button"
              onClick={goToSupport}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('ownerDashboard.quickActions.support', {
                defaultValue: 'Support kontaktieren',
              })}
            </button>
          </div>
        </section>

        {/* ======================================================
           LISTIMET E PRONARIT
        ======================================================= */}
        <section className="bg-white/90 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">
                {t('ownerDashboard.listings.title', {
                  defaultValue: 'Deine Inserate',
                })}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('ownerDashboard.listings.subtitle', {
                  defaultValue:
                    'Bearbeite, lösche oder öffne deine Inserate in der Detailansicht.',
                })}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-4 py-8 md:px-6 text-center text-sm text-gray-600 dark:text-gray-300">
              {t('ownerDashboard.listings.loading', {
                defaultValue: 'Inserate werden geladen…',
              })}
            </div>
          ) : listings.length === 0 ? (
            <div className="px-4 py-10 md:px-6 text-center text-sm text-gray-600 dark:text-gray-300">
              {t('ownerDashboard.listings.empty', {
                defaultValue:
                  'Du hast noch keine Inserate veröffentlicht.',
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/80">
                  <tr>
                    <TH className="w-16">
                      {t('ownerDashboard.listings.columns.image', {
                        defaultValue: 'Bild',
                      })}
                    </TH>
                    <TH>
                      {t('ownerDashboard.listings.columns.title', {
                        defaultValue: 'Titel',
                      })}
                    </TH>
                    <TH>
                      {t('ownerDashboard.listings.columns.location', {
                        defaultValue: 'Ort',
                      })}
                    </TH>
                    <TH className="text-right">
                      {t('ownerDashboard.listings.columns.price', {
                        defaultValue: 'Preis',
                      })}
                    </TH>
                    <TH>
                      {t('ownerDashboard.listings.columns.status', {
                        defaultValue: 'Status',
                      })}
                    </TH>
                    <TH className="text-right">
                      {t('ownerDashboard.listings.columns.actions', {
                        defaultValue: 'Aktionen',
                      })}
                    </TH>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {listings.map((listing) => {
                    const img = firstImage(listing);
                    const price =
                      typeof listing.price === 'number'
                        ? `€ ${listing.price.toLocaleString('de-DE', {
                            maximumFractionDigits: 0,
                          })}`
                        : listing.price
                        ? `€ ${listing.price}`
                        : '–';

                    return (
                      <tr
                        key={listing.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-900/60"
                      >
                        <TD className="w-16">
                          <Link to={`/listing/${listing.id}`}>
                            <img
                              src={img}
                              alt={listing.title || 'Listing'}
                              className="h-12 w-16 rounded object-cover border border-gray-200 dark:border-gray-700"
                              loading="lazy"
                            />
                          </Link>
                        </TD>
                        <TD>
                          <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {listing.title || '—'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {listing.purpose
                              ? listing.purpose.toUpperCase()
                              : ''}
                            {listing.type ? ` · ${listing.type}` : ''}
                          </div>
                        </TD>
                        <TD>
                          <div className="text-gray-800 dark:text-gray-100">
                            {listing.city || '—'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {listing.zipCode || ''}{' '}
                            {listing.address || ''}
                          </div>
                        </TD>
                        <TD className="text-right font-semibold text-gray-900 dark:text-gray-100">
                          {price}
                        </TD>
                        <TD>
                          <StatusBadge status={listing.status} />
                        </TD>
                        <TD className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/listing/${listing.id}`)
                              }
                              className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title={t('ownerDashboard.actions.view', {
                                defaultValue: 'Ansehen',
                              })}
                            >
                              <FaEye />
                            </button>

                            <Link
                              to={`/edit/${listing.id}`}
                              title={t('ownerDashboard.actions.edit', {
                                defaultValue: 'Bearbeiten',
                              })}
                              className="inline-flex items-center justify-center rounded-full border border-blue-500/70 text-blue-600 dark:text-blue-400 px-2.5 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/40"
                            >
                              <FaEdit />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteId(listing.id)
                              }
                              className="inline-flex items-center justify-center rounded-full border border-red-500/70 text-red-600 dark:text-red-400 px-2.5 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/40"
                              title={t(
                                'ownerDashboard.actions.delete',
                                { defaultValue: 'Löschen' }
                              )}
                            >
                              <FaTrash />
                            </button>
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

        {/* ======================================================
           PANELI I OFERTAVE (si në Zillow)
        ======================================================= */}
        {currentUser?.uid && <OwnerOffersPanel ownerId={currentUser.uid} />}

        {/* ======================================================
           MODALI I KONFIRMIMIT TË FSHIRJES
        ======================================================= */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">
                {t('ownerDashboard.delete.title', {
                  defaultValue: 'Inserat löschen?',
                })}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {t('ownerDashboard.delete.text', {
                  defaultValue:
                    'Diese Aktion kann nicht rückgängig gemacht werden.',
                })}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t('ownerDashboard.delete.cancel', {
                    defaultValue: 'Abbrechen',
                  })}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  {t('ownerDashboard.delete.confirm', {
                    defaultValue: 'Ja, löschen',
                  })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Sub-komponentë të vegjël për pastërti
// ============================================================
function StatCard({ icon, label, value, accent = 'blue' }) {
  const accentClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
    emerald:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
    amber:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-200',
  }[accent];

  return (
    <div className="rounded-2xl bg-white/90 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 shadow-sm p-4 flex items-center gap-3">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${accentClasses}`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </span>
      </div>
    </div>
  );
}

function TH({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = '' }) {
  return (
    <td
      className={`px-4 py-3 align-top text-gray-800 dark:text-gray-100 ${className}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-0.5 text-xs font-medium">
        –
      </span>
    );
  }

  const map = {
    active: {
      label: 'Aktiv',
      classes:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    },
    draft: {
      label: 'Entwurf',
      classes:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    },
    inactive: {
      label: 'Inaktiv',
      classes:
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
  };

  const conf = map[status] || {
    label: status,
    classes:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${conf.classes}`}
    >
      {conf.label}
    </span>
  );
}
