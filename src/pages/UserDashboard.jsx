// src/pages/UserDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  FiShield,
} from "react-icons/fi";

import { auth, db } from "../firebase";
import { logEvent } from "../utils/logEvent";
import { useRole } from "../roles/RoleContext";

import MyOffersPanel from "../components/MyOffersPanel";
import FilterControls from "../components/FilterControls";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ContactOwnerModal from "../components/ContactOwnerModal";
import ListingMapModal from "../components/ListingMapModal";
import RequestOwnerUpgradeSection from "../components/RequestOwnerUpgradeSection";
import RoleUpgradeModal from "../roles/dashboard/RoleUpgradeModal";

function getListingImage(listing) {
  if (!listing) return "";

  if (typeof listing.imageUrl === "string" && listing.imageUrl.trim()) {
    return listing.imageUrl;
  }

  if (Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0) {
    return listing.imageUrls[0];
  }

  if (Array.isArray(listing.images) && listing.images.length > 0) {
    return listing.images[0];
  }

  if (typeof listing.image === "string" && listing.image.trim()) {
    return listing.image;
  }

  return "";
}

const UserDashboard = () => {
  const { t } = useTranslation(["userDashboard", "listing", "filterBar", "offer"]);
  const { role } = useRole();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRoleModal, setOpenRoleModal] = useState(false);

  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const [selectedListing, setSelectedListing] = useState(null);
  const [showConfirmId, setShowConfirmId] = useState(null);
  const [showContact, setShowContact] = useState(null);
  const [showMap, setShowMap] = useState(null);

  const [myOffers, setMyOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const currentRole = String(role || "user").toLowerCase();
  const canRequestRoleUpgrade = currentRole === "user";

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "listings"),
          where("userId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);
        const now = Timestamp.now();

        const data = snapshot.docs.map((d) => {
          const v = d.data();
          const createdAt = v.createdAt?.seconds || 0;
          const isNew = now.seconds - createdAt < 7 * 24 * 3600;

          return { id: d.id, ...v, isNew };
        });

        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserListings();
  }, []);

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
          collection(db, "offers"),
          where("buyerId", "==", auth.currentUser.uid)
        );

        const snap = await getDocs(qOffers);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setMyOffers(items);
      } catch (err) {
        console.error("[UserDashboard] fetchOffers error:", err);
      } finally {
        setOffersLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const offerStats = useMemo(() => {
    const total = myOffers.length;
    const open = myOffers.filter((o) => (o.status || "open") === "open").length;
    const accepted = myOffers.filter((o) => o.status === "accepted").length;
    const rejected = myOffers.filter((o) => o.status === "rejected").length;
    const withdrawn = myOffers.filter((o) => o.status === "withdrawn").length;

    return { total, open, accepted, rejected, withdrawn };
  }, [myOffers]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      return (
        (filterCity
          ? listing.city?.toLowerCase().includes(filterCity.toLowerCase())
          : true) &&
        (filterType ? listing.type === filterType : true) &&
        (filterPurpose ? listing.purpose === filterPurpose : true)
      );
    });
  }, [listings, filterCity, filterType, filterPurpose]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "listings", id));
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
    }

    setShowConfirmId(null);
  };

  const handleUpdate = async (id) => {
    if (!newTitle.trim()) return;

    try {
      await updateDoc(doc(db, "listings", id), { title: newTitle });

      setListings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: newTitle } : item
        )
      );

      setEditingId(null);
      setNewTitle("");
    } catch (err) {
      console.error("Error updating:", err);
    }
  };

  const toggleFavorite = (id) => {
    let updated;

    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleWithdrawOffer = async (offerId) => {
    if (!offerId) return;

    try {
      setWithdrawingId(offerId);

      const offer = myOffers.find((o) => o.id === offerId) || null;

      await updateDoc(doc(db, "offers", offerId), {
        status: "withdrawn",
        updatedAt: serverTimestamp(),
      });

      setMyOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: "withdrawn" } : o))
      );

      await logEvent({
        type: "offer.withdrawn",
        message: offer
          ? `Angebot für "${offer.listingTitle || ""}" wurde vom:von der Käufer:in zurückgezogen.`
          : "Angebot wurde vom:von der Käufer:in zurückgezogen.",
        listingId: offer?.listingId || null,
        offerId,
        buyerId: offer?.buyerId || null,
      });
    } catch (err) {
      console.error("[UserDashboard] withdraw offer error:", err);
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {t("loading", { defaultValue: "Wird geladen..." })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-7xl px-4 pb-16">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
          <FiSearch className="text-blue-600 dark:text-blue-400" />
          {t("title", { defaultValue: "Mein Dashboard" })}
        </h2>

        <Link
          to="/add"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlusCircle size={18} />
          {t("addNew", { defaultValue: "Neue Anzeige" })}
        </Link>
      </div>

      <section className="mb-8 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow">
              <FiShield size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Rollen-Upgrade
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Verwalte hier deine Berechtigungen für MyHome24App.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Aktuelle Rolle:
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  {currentRole === "admin"
                    ? "Admin"
                    : currentRole === "owner"
                    ? "Eigentümer:in"
                    : currentRole === "agent"
                    ? "Makler:in"
                    : "Benutzer:in"}
                </span>
              </div>
            </div>
          </div>

          {canRequestRoleUpgrade ? (
            <button
              type="button"
              onClick={() => setOpenRoleModal(true)}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Rolle beantragen
            </button>
          ) : (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              Du besitzt bereits eine erweiterte Rolle.
            </span>
          )}
        </div>
      </section>

      <div className="mb-6">
        <RequestOwnerUpgradeSection />
      </div>

      <FilterControls
        filterCity={filterCity}
        setFilterCity={setFilterCity}
        filterType={filterType}
        setFilterType={setFilterType}
        filterPurpose={filterPurpose}
        setFilterPurpose={setFilterPurpose}
      />

      {filteredListings.length === 0 ? (
        <p className="mt-6 text-center italic text-gray-500 dark:text-gray-400">
          {t("noListings", { defaultValue: "Keine Anzeigen gefunden." })}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredListings.map((listing) => {
            const listingImage = getListingImage(listing);

            return (
              <div
                key={listing.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg dark:bg-gray-800"
              >
                {listingImage ? (
                  <img
                    src={listingImage}
                    alt={listing.title}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                    {t("imageFallback", { defaultValue: "Kein Bild" })}
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3
                      className="truncate text-lg font-semibold text-gray-800 dark:text-white"
                      title={listing.title}
                    >
                      {editingId === listing.id ? (
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => handleUpdate(listing.id)}
                          className="w-full rounded border p-1 text-gray-900"
                          autoFocus
                        />
                      ) : (
                        listing.title
                      )}
                    </h3>

                    {listing.isNew && (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-800 dark:text-white">
                        {t("new", { defaultValue: "Neu" })}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <FiMapPin className="mr-1 inline text-blue-500" />
                    {listing.city} –{" "}
                    {t(`fields.${listing.type}`, {
                      defaultValue: listing.type || "—",
                    })}{" "}
                    –{" "}
                    {t(`fields.${listing.purpose}`, {
                      defaultValue: listing.purpose || "—",
                    })}
                  </p>

                  <p className="mt-2 font-bold text-blue-700 dark:text-blue-400">
                    €{listing.price}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="text-sm text-blue-500 hover:underline dark:text-blue-400"
                    >
                      <FiEye className="mr-1 inline" />
                      {t("details", { defaultValue: "Details" })}
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirmId(listing.id)}
                        title={t("delete", { defaultValue: "Löschen" })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(listing.id);
                          setNewTitle(listing.title);
                        }}
                        title={t("edit", { defaultValue: "Bearbeiten" })}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit size={18} />
                      </button>

                      <button
                        onClick={() => toggleFavorite(listing.id)}
                        title="Favorit"
                        className={
                          favorites.includes(listing.id)
                            ? "text-rose-500"
                            : "text-gray-400 hover:text-rose-500"
                        }
                      >
                        <FiHeart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-sm dark:bg-gray-950/80">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">
              {t("myOffers.title", { defaultValue: "Meine Angebote" })}
            </h2>
            <p className="text-sm text-gray-400">
              {t("myOffers.subtitle", {
                defaultValue:
                  "Behalte den Überblick über alle Kaufangebote, die du für Immobilien abgegeben hast.",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <OffersStatsChip label="Gesamt" value={offerStats.total} />
            <OffersStatsChip label="Offen" value={offerStats.open} color="sky" />
            <OffersStatsChip
              label="Angenommen"
              value={offerStats.accepted}
              color="emerald"
            />
            <OffersStatsChip
              label="Abgelehnt"
              value={offerStats.rejected}
              color="rose"
            />
            <OffersStatsChip
              label="Zurückgezogen"
              value={offerStats.withdrawn}
              color="gray"
            />
          </div>
        </div>

        <div className="px-4 pt-4 md:px-6">
          <MyOffersPanel userId={auth.currentUser?.uid} />
        </div>

        <div className="px-4 py-4 md:px-6 md:py-5">
          {offersLoading ? (
            <p className="text-sm text-gray-400">
              {t("offer.loading", { defaultValue: "Angebote werden geladen…" })}
            </p>
          ) : myOffers.length === 0 ? (
            <p className="text-sm text-gray-400">
              {t("myOffers.empty", {
                defaultValue: "Du hast bisher noch keine Angebote abgegeben.",
              })}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <OffersTH>Inserat</OffersTH>
                    <OffersTH>Angebot</OffersTH>
                    <OffersTH>Status</OffersTH>
                    <OffersTH>Datum</OffersTH>
                    <OffersTH className="text-right">Aktionen</OffersTH>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {myOffers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="transition-colors hover:bg-slate-900/70"
                    >
                      <OffersTD>
                        <div className="line-clamp-1 font-medium text-gray-100">
                          {offer.listingTitle || "—"}
                        </div>
                        <div className="line-clamp-1 text-xs text-gray-400">
                          {offer.listingCity || ""}
                        </div>
                      </OffersTD>

                      <OffersTD>
                        <div className="font-semibold text-gray-100">
                          {formatOfferPrice(offer.amount)}
                        </div>
                      </OffersTD>

                      <OffersTD>
                        <OfferStatusBadge status={offer.status || "open"} />
                      </OffersTD>

                      <OffersTD>
                        <div className="text-xs text-gray-400">
                          {offer.createdAt?.toDate
                            ? offer.createdAt.toDate().toLocaleString("de-DE")
                            : "—"}
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

                          {offer.status === "open" && (
                            <button
                              type="button"
                              onClick={() => handleWithdrawOffer(offer.id)}
                              disabled={withdrawingId === offer.id}
                              className="rounded-full bg-gray-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Zurückziehen
                            </button>
                          )}
                        </div>
                      </OffersTD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showConfirmId && (
        <ConfirmDeleteModal
          onCancel={() => setShowConfirmId(null)}
          onConfirm={() => handleDelete(showConfirmId)}
        />
      )}

      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-900">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black dark:text-gray-300"
              onClick={() => setSelectedListing(null)}
            >
              <FiX size={20} />
            </button>

            <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
              {selectedListing.title}
            </h2>

            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              <FiMapPin className="mr-1 inline text-blue-500" />
              {selectedListing.city} –{" "}
              {t(`fields.${selectedListing.type}`, {
                defaultValue: selectedListing.type || "—",
              })}{" "}
              –{" "}
              {t(`fields.${selectedListing.purpose}`, {
                defaultValue: selectedListing.purpose || "—",
              })}
            </p>

            <p className="mb-4 font-bold text-blue-700 dark:text-blue-400">
              €{selectedListing.price}
            </p>

            {getListingImage(selectedListing) ? (
              <img
                src={getListingImage(selectedListing)}
                alt={selectedListing.title}
                className="h-64 w-full rounded object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                {t("imageFallback", { defaultValue: "Kein Bild" })}
              </div>
            )}

            <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <button
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => setShowContact(selectedListing)}
              >
                <FiMessageCircle /> {t("contactOwner", { defaultValue: "Kontakt" })}
              </button>

              <button
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline dark:text-gray-300"
                onClick={() => setShowMap(selectedListing)}
              >
                <FiMap /> {t("viewMap", { defaultValue: "Karte ansehen" })}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContact && (
        <ContactOwnerModal listing={showContact} onClose={() => setShowContact(null)} />
      )}

      {showMap && (
        <ListingMapModal listing={showMap} onClose={() => setShowMap(null)} />
      )}

      {selectedOffer && (
        <MyOfferDetailsModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onWithdraw={
            selectedOffer.status === "open"
              ? () => handleWithdrawOffer(selectedOffer.id)
              : undefined
          }
          withdrawing={withdrawingId === selectedOffer.id}
        />
      )}

      <RoleUpgradeModal
        isOpen={openRoleModal}
        onClose={() => setOpenRoleModal(false)}
      />
    </div>
  );
};

export default UserDashboard;

function OffersStatsChip({ label, value, color = "slate" }) {
  const colorClasses =
    {
      slate: "bg-slate-800 text-slate-200",
      gray: "bg-gray-800 text-gray-200",
      emerald: "bg-emerald-900/60 text-emerald-200",
      rose: "bg-rose-900/60 text-rose-200",
      sky: "bg-sky-900/60 text-sky-200",
    }[color] || "bg-slate-800 text-slate-200";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorClasses}`}
    >
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function OffersTH({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

function OffersTD({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-top text-sm text-gray-100 ${className}`}>
      {children}
    </td>
  );
}

function OfferStatusBadge({ status }) {
  const map = {
    open: {
      label: "Offen",
      classes: "bg-sky-900/50 text-sky-200 border border-sky-700/70",
    },
    accepted: {
      label: "Angenommen",
      classes: "bg-emerald-900/40 text-emerald-200 border border-emerald-700/70",
    },
    rejected: {
      label: "Abgelehnt",
      classes: "bg-rose-900/40 text-rose-200 border border-rose-700/70",
    },
    withdrawn: {
      label: "Zurückgezogen",
      classes: "bg-gray-800 text-gray-200 border border-gray-700/70",
    },
  };

  const conf =
    map[status] || {
      label: status || "—",
      classes: "bg-gray-800 text-gray-200 border border-gray-700/70",
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
  if (typeof value === "number") {
    return `€ ${value.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
  }

  if (!value) return "€ —";
  return `€ ${value}`;
}

function MyOfferDetailsModal({ offer, onClose, onWithdraw, withdrawing }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 text-gray-100 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-xl leading-none text-gray-400 hover:text-gray-200"
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="mb-3 text-lg font-semibold">Angebotsdetails</h3>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Inserat: </span>
            {offer.listingTitle || "—"}
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
              <span className="font-semibold">
                Nachricht an den:die Anbieter:in:
              </span>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-200">
                {offer.message}
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            {offer.createdAt?.toDate
              ? `Erstellt am ${offer.createdAt.toDate().toLocaleString("de-DE")}`
              : null}
          </div>

          <div className="mt-2">
            <span className="mr-1 font-semibold">Status:</span>
            <OfferStatusBadge status={offer.status || "open"} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {onWithdraw && offer.status === "open" && (
            <button
              type="button"
              onClick={onWithdraw}
              disabled={withdrawing}
              className="rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Zurückziehen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}