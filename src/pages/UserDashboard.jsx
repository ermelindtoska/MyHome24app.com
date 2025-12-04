// src/pages/UserDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTranslation } from 'react-i18next';
import MyOffersPanel from '../components/MyOffersPanel';

import { Link } from 'react-router-dom';
import {
  FiTrash2,
  FiEdit,
  FiHeart,
  FiPlusCircle,
  FiSearch,
  FiEye,
  FiX,
  FiMapPin,
  FiMessageCircle,
  FiMap,
} from 'react-icons/fi';

import FilterControls from '../components/FilterControls';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ContactOwnerModal from '../components/ContactOwnerModal';
import ListingMapModal from '../components/ListingMapModal';

// ✅ Seksioni i ri që menaxhon vetë modalin e kërkesës + statusin
import RequestOwnerUpgradeSection from '../components/RequestOwnerUpgradeSection';

const UserDashboard = () => {
  // i18n: mbaj të gjitha namespace-t që përdor ky ekran
  const { t } = useTranslation(['userDashboard', 'listing', 'filterBar', 'offer']);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem('favorites') || '[]')
  );

  const [selectedListing, setSelectedListing] = useState(null);
  const [showConfirmId, setShowConfirmId] = useState(null);
  const [showContact, setShowContact] = useState(null);
  const [showMap, setShowMap] = useState(null);

  // 🔵 Oferta të mia (kur veproj si blerës:in)
  const [myOffers, setMyOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // ============================================================
  // 🔎 Merr listimet e përdoruesit
  // ============================================================
  useEffect(() => {
    const fetchUserListings = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'listings'),
          where('userId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const now = Timestamp.now();
        const data = snapshot.docs.map((d) => {
          const v = d.data();
          const createdAt = v.createdAt?.seconds || 0;
          const isNew = now.seconds - createdAt < 7 * 24 * 3600; // 7 ditë
          return { id: d.id, ...v, isNew };
        });
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserListings();
  }, []);

  // ============================================================
  // 🔵 Merr ofertat ku unë jam blerës (buyerId)
  // ============================================================
  useEffect(() => {
    const fetchOffers = async () => {
      if (!auth.currentUser) {
        setMyOffers([]);
        setOffersLoading(false);
        return;
      }

      setOffersLoading(true);
      try {
        const qOffers = query(
          collection(db, 'offers'),
          where('buyerId', '==', auth.currentUser.uid)
        );
        const snap = await getDocs(qOffers);

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // sortim lokal (më e reja lart)
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setMyOffers(items);
      } catch (err) {
        console.error('[UserDashboard] fetchOffers error:', err);
      } finally {
        setOffersLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // ============================================================
  // 🧮 Stats për ofertat e mia
  // ============================================================
  const offerStats = useMemo(() => {
    const total = myOffers.length;
    const open = myOffers.filter((o) => (o.status || 'open') === 'open').length;
    const accepted = myOffers.filter((o) => o.status === 'accepted').length;
    const rejected = myOffers.filter((o) => o.status === 'rejected').length;
    const withdrawn = myOffers.filter((o) => o.status === 'withdrawn').length;
    return { total, open, accepted, rejected, withdrawn };
  }, [myOffers]);

  // ============================================================
  // 🗑️ Fshi listing
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
    setShowConfirmId(null);
  };

  // ============================================================
  // ✏️ Përditëso titull
  // ============================================================
  const handleUpdate = async (id) => {
    if (!newTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'listings', id), { title: newTitle });
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
      );
      setEditingId(null);
      setNewTitle('');
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  // ============================================================
  // ⭐ Favorite toggle
  // ============================================================
  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // ============================================================
  // 🧨 Ofertën time e tërheq (withdrawn)
  // ============================================================
  const handleWithdrawOffer = async (offerId) => {
    if (!offerId) return;
    try {
      setWithdrawingId(offerId);
      const ref = doc(db, 'offers', offerId);
      await updateDoc(ref, {
        status: 'withdrawn',
        updatedAt: serverTimestamp(),
      });

      setMyOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: 'withdrawn' } : o))
      );
    } catch (err) {
      console.error('[UserDashboard] withdraw offer error:', err);
    } finally {
      setWithdrawingId(null);
    }
  };

  // 🔍 Filtrim lokal i listimeve
  const filteredListings = listings.filter((listing) => {
    return (
      (filterCity ? listing.city?.toLowerCase().includes(filterCity.toLowerCase()) : true) &&
      (filterType ? listing.type === filterType : true) &&
      (filterPurpose ? listing.purpose === filterPurpose : true)
    );
  });

  if (loading)
    return (
      <p className="text-center p-4 text-gray-500 dark:text-gray-400">
        {t('loading')}
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FiSearch className="text-blue-600 dark:text-blue-400" /> {t('title')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/add"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FiPlusCircle size={18} /> {t('addNew')}
          </Link>
          {/* ❌ u hoq butoni i vjetër që hapte modalin direkt */}
        </div>
      </div>

      {/* ✅ Seksioni i ri: tregon statusin e kërkesës + hap modalin modern nga brenda */}
      <div className="mt-4">
        <RequestOwnerUpgradeSection />
      </div>

      {/* Filtra */}
      <FilterControls
        filterCity={filterCity}
        setFilterCity={setFilterCity}
        filterType={filterType}
        setFilterType={setFilterType}
        filterPurpose={filterPurpose}
        setFilterPurpose={setFilterPurpose}
      />

      {/* Lista e listimeve të mia */}
      {filteredListings.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 italic mt-6">
          {t('noListings')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              {listing.imageUrl && (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-lg font-semibold text-gray-800 dark:text-white truncate"
                    title={listing.title}
                  >
                    {editingId === listing.id ? (
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleUpdate(listing.id)}
                        className="w-full p-1 border rounded"
                        autoFocus
                      />
                    ) : (
                      listing.title
                    )}
                  </h3>

                  {listing.isNew && (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-white rounded-full px-2 py-0.5">
                      {t('new')}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  <FiMapPin className="inline mr-1 text-blue-500" />
                  {listing.city} – {t(`fields.${listing.type}`)} –{' '}
                  {t(`fields.${listing.purpose}`)}
                </p>

                <p className="text-blue-700 dark:text-blue-400 font-bold mt-2">
                  €{listing.price}
                </p>

                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    <FiEye className="inline mr-1" /> {t('details')}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmId(listing.id)}
                      title={t('delete')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(listing.id);
                        setNewTitle(listing.title);
                      }}
                      title={t('edit')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit size={18} />
                    </button>

                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      title={
                        favorites.includes(listing.id)
                          ? t('unfavorite')
                          : t('favorite')
                      }
                      className={`hover:text-pink-600 ${
                        favorites.includes(listing.id)
                          ? 'text-pink-500'
                          : 'text-gray-400'
                      }`}
                    >
                      <FiHeart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
         Meine Angebote (Buyer-Sicht, wie bei Zillow)
      ======================================================= */}
      <section className="mt-12 bg-slate-950/70 dark:bg-gray-950/80 border border-slate-800 dark:border-gray-900 rounded-2xl shadow-sm">
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-800 dark:border-gray-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">
              {t('myOffers.title', {
                defaultValue: 'Meine Angebote',
              })}
            </h2>
            <p className="text-sm text-gray-400">
              {t('myOffers.subtitle', {
                defaultValue:
                  'Behalte den Überblick über alle Kaufangebote, die du für Immobilien abgegeben hast.',
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <OffersStatsChip
              label={t('myOffers.chips.total', { defaultValue: 'Gesamt' })}
              value={offerStats.total}
              color="slate"
            />
            <OffersStatsChip
              label={t('myOffers.chips.open', { defaultValue: 'Offen' })}
              value={offerStats.open}
              color="sky"
            />
            <OffersStatsChip
              label={t('myOffers.chips.accepted', { defaultValue: 'Angenommen' })}
              value={offerStats.accepted}
              color="emerald"
            />
            <OffersStatsChip
              label={t('myOffers.chips.rejected', { defaultValue: 'Abgelehnt' })}
              value={offerStats.rejected}
              color="rose"
            />
            <OffersStatsChip
              label={t('myOffers.chips.withdrawn', { defaultValue: 'Zurückgezogen' })}
              value={offerStats.withdrawn}
              color="gray"
            />
            <MyOffersPanel userId={auth.currentUser?.uid} />
          </div>
        </div>

        <div className="px-4 py-4 md:px-6 md:py-5">
          {offersLoading ? (
            <p className="text-sm text-gray-400">
              {t('offer.loading', { defaultValue: 'Angebote werden geladen…' })}
            </p>
          ) : myOffers.length === 0 ? (
            <p className="text-sm text-gray-400">
              {t('myOffers.empty', {
                defaultValue:
                  'Du hast bisher noch keine Angebote abgegeben.',
              })}
            </p>
          ) : (
            <>
              {/* Desktop: Tabelle */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <OffersTH>
                        {t('offer.columns.listing', { defaultValue: 'Inserat' })}
                      </OffersTH>
                      <OffersTH>
                        {t('offer.columns.price', { defaultValue: 'Angebot' })}
                      </OffersTH>
                      <OffersTH>
                        {t('offer.columns.status', { defaultValue: 'Status' })}
                      </OffersTH>
                      <OffersTH>
                        {t('offer.columns.date', { defaultValue: 'Datum' })}
                      </OffersTH>
                      <OffersTH className="text-right">
                        {t('offer.columns.actions', { defaultValue: 'Aktionen' })}
                      </OffersTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {myOffers.map((offer) => (
                      <tr
                        key={offer.id}
                        className="hover:bg-slate-900/70 transition-colors"
                      >
                        <OffersTD>
                          <div className="font-medium text-gray-100 line-clamp-1">
                            {offer.listingTitle || '—'}
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {offer.listingCity || ''}
                          </div>
                        </OffersTD>
                        <OffersTD>
                          <div className="font-semibold text-gray-100">
                            {formatOfferPrice(offer.amount)}
                          </div>
                        </OffersTD>
                        <OffersTD>
                          <OfferStatusBadge status={offer.status || 'open'} />
                        </OffersTD>
                        <OffersTD>
                          <div className="text-xs text-gray-400">
                            {offer.createdAt?.toDate
                              ? offer.createdAt
                                  .toDate()
                                  .toLocaleString('de-DE')
                              : '—'}
                          </div>
                        </OffersTD>
                        <OffersTD className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOffer(offer)}
                              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-2.5 py-1.5 text-xs text-gray-200 hover:bg-slate-800"
                            >
                              <FiEye />
                            </button>
                            {offer.status === 'open' && (
                              <button
                                type="button"
                                onClick={() => handleWithdrawOffer(offer.id)}
                                disabled={withdrawingId === offer.id}
                                className="inline-flex items-center justify-center rounded-full px-2.5 py-1.5 text-xs font-semibold bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {t('myOffers.withdraw', {
                                  defaultValue: 'Zurückziehen',
                                })}
                              </button>
                            )}
                          </div>
                        </OffersTD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Karten */}
              <div className="space-y-3 md:hidden">
                {myOffers.map((offer) => (
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
                      <OfferStatusBadge status={offer.status || 'open'} />
                    </div>

                    <div className="text-sm font-semibold text-gray-100">
                      {formatOfferPrice(offer.amount)}
                    </div>

                    <div className="text-xs text-gray-400">
                      {offer.createdAt?.toDate
                        ? offer.createdAt.toDate().toLocaleString('de-DE')
                        : '—'}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedOffer(offer)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-600 px-3 py-1 text-xs text-gray-200 hover:bg-slate-800"
                      >
                        <FiEye />
                      </button>
                      {offer.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => handleWithdrawOffer(offer.id)}
                          disabled={withdrawingId === offer.id}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {t('myOffers.withdraw', {
                            defaultValue: 'Zurückziehen',
                          })}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ======================================================
         Modals ekzistues për listime
      ======================================================= */}
      {showConfirmId && (
        <ConfirmDeleteModal
          onCancel={() => setShowConfirmId(null)}
          onConfirm={() => handleDelete(showConfirmId)}
        />
      )}

      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-black"
              onClick={() => setSelectedListing(null)}
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              {selectedListing.title}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <FiMapPin className="inline mr-1 text-blue-500" />
              {selectedListing.city} – {t(`fields.${selectedListing.type}`)} –{' '}
              {t(`fields.${selectedListing.purpose}`)}
            </p>

            <p className="text-blue-700 dark:text-blue-400 font-bold mb-4">
              €{selectedListing.price}
            </p>

            {selectedListing.imageUrl && (
              <img
                src={selectedListing.imageUrl}
                alt={selectedListing.title}
                className="w-full h-64 object-cover rounded"
              />
            )}

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <button
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setShowContact(selectedListing)}
              >
                <FiMessageCircle /> {t('contactOwner')}
              </button>

              <button
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:underline"
                onClick={() => setShowMap(selectedListing)}
              >
                <FiMap /> {t('viewMap')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContact && (
        <ContactOwnerModal
          listing={showContact}
          onClose={() => setShowContact(null)}
        />
      )}

      {showMap && (
        <ListingMapModal listing={showMap} onClose={() => setShowMap(null)} />
      )}

      {/* Modal me detajet e ofertës sime */}
      {selectedOffer && (
        <MyOfferDetailsModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onWithdraw={
            selectedOffer.status === 'open'
              ? () => handleWithdrawOffer(selectedOffer.id)
              : undefined
          }
          withdrawing={withdrawingId === selectedOffer.id}
        />
      )}
    </div>
  );
};

export default UserDashboard;

/* -----------------------------------------------------------
   Sub-komponentë ndihmës për seksionin "Meine Angebote"
----------------------------------------------------------- */

function OffersStatsChip({ label, value, color = 'slate' }) {
  const colorClasses =
    {
      slate: 'bg-slate-800 text-slate-200',
      gray: 'bg-gray-800 text-gray-200',
      emerald: 'bg-emerald-900/60 text-emerald-200',
      rose: 'bg-rose-900/60 text-rose-200',
      sky: 'bg-sky-900/60 text-sky-200',
    }[color] || 'bg-slate-800 text-slate-200';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorClasses}`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function OffersTH({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function OffersTD({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 align-top text-gray-100 text-sm ${className}`}>
      {children}
    </td>
  );
}

function OfferStatusBadge({ status }) {
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
    withdrawn: {
      label: 'Zurückgezogen',
      classes:
        'bg-gray-800 text-gray-200 border border-gray-700/70',
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

function formatOfferPrice(value) {
  if (typeof value === 'number') {
    return `€ ${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
  }
  if (!value) return '€ —';
  return `€ ${value}`;
}

function MyOfferDetailsModal({ offer, onClose, onWithdraw, withdrawing }) {
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

        <h3 className="text-lg font-semibold mb-3">Angebotsdetails</h3>

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
            {formatOfferPrice(offer.amount)}
          </div>

          {offer.message && (
            <div className="mt-3">
              <span className="font-semibold">Nachricht an den:die Anbieter:in:</span>
              <p className="mt-1 text-sm text-gray-200 whitespace-pre-line">
                {offer.message}
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            {offer.createdAt?.toDate
              ? `Erstellt am ${offer.createdAt.toDate().toLocaleString('de-DE')}`
              : null}
          </div>

          <div className="mt-2">
            <span className="font-semibold mr-1">Status:</span>
            <OfferStatusBadge status={offer.status || 'open'} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {onWithdraw && offer.status === 'open' && (
            <button
              type="button"
              onClick={onWithdraw}
              disabled={withdrawing}
              className="rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Zurückziehen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
