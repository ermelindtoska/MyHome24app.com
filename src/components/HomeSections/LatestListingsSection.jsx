import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebase";
import PropertyList from "../PropertyList/PropertyList";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

const LatestListingsSection = () => {
  const { t } = useTranslation("home");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchListings = async () => {
      setLoading(true);

      try {
        const q = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc"),
          firestoreLimit(6)
        );

        const snapshot = await getDocs(q);

        if (!active) return;

        const listingsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};

          return {
            id: docSnap.id,
            ...data,
            images: Array.isArray(data.images) ? data.images : [],
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          };
        });

        setListings(listingsData);
        setError(null);
      } catch (err) {
        console.error("[LatestListingsSection] Fehler beim Laden:", err);

        if (!active) return;

        setError(
          t("latestListingsSection.error", {
            defaultValue: "Es gab einen Fehler beim Laden der Anzeigen.",
          })
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      active = false;
    };
  }, [t]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-700/20" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/20" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/80 dark:text-blue-300">
              <FaHome />
              {t("latestListingsSection.badge", {
                defaultValue: "Neue Immobilien",
              })}
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {t("latestListingsSection.title", {
                defaultValue: "Neueste Anzeigen",
              })}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              {t("latestListingsSection.subtitle", {
                defaultValue:
                  "Entdecken Sie aktuelle Immobilienangebote, die zuletzt auf MyHome24App veröffentlicht wurden.",
              })}
            </p>
          </div>

          <a
            href="/listings"
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-blue-900/50 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
          >
            {t("latestListingsSection.viewAll", {
              defaultValue: "Alle Anzeigen ansehen",
            })}
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[360px] animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-48 rounded-t-3xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-10 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <FaExclamationTriangle className="mb-3 text-3xl" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : listings.length > 0 ? (
          <PropertyList listings={listings} />
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {t("latestListingsSection.empty", {
                defaultValue: "Keine Anzeigen gefunden.",
              })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(LatestListingsSection);