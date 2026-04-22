import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ListingCard from "../components/ListingCard";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  MdHomeWork,
  MdLocationOn,
  MdRefresh,
  MdSearchOff,
} from "react-icons/md";

const ListingsPage = () => {
  const { t, i18n } = useTranslation("listing");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState("");

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/listings`;

  const loadListings = async () => {
    setLoading(true);
    setErrorKey("");

    try {
      const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setListings(data);
    } catch (error) {
      console.error("[ListingsPage] Error loading listings:", error);
      setListings([]);
      setErrorKey("loadError");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const stats = useMemo(() => {
    const total = listings.length;
    const buyCount = listings.filter((item) => item.purpose === "buy").length;
    const rentCount = listings.filter((item) => item.purpose === "rent").length;

    return { total, buyCount, rentCount };
  }, [listings]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={
          t("listPage.metaTitle", {
            defaultValue: "Alle Immobilienangebote – MyHome24App",
          }) || "Alle Immobilienangebote – MyHome24App"
        }
        description={
          t("listPage.metaDescription", {
            defaultValue:
              "Entdecken Sie alle Immobilienangebote auf MyHome24App – Häuser, Wohnungen und weitere Objekte in Deutschland.",
          }) ||
          "Entdecken Sie alle Immobilienangebote auf MyHome24App."
        }
        canonical={canonical}
        lang={lang}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center rounded-full bg-blue-600/10 border border-blue-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                <MdHomeWork className="mr-1 text-sm" />
                {t("listPage.badge", { defaultValue: "Immobilienübersicht" })}
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("listPage.title", {
                  defaultValue: "Alle Immobilienangebote",
                })}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                {t("listPage.subtitle", {
                  defaultValue:
                    "Durchsuchen Sie alle aktuell verfügbaren Immobilien auf MyHome24App. Finden Sie passende Häuser, Wohnungen und weitere Objekte in ganz Deutschland.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadListings}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <MdRefresh className="mr-2 text-base" />
                {t("listPage.refresh", { defaultValue: "Neu laden" })}
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("listPage.stats.total", { defaultValue: "Gesamt" })}
            value={stats.total}
          />
          <StatCard
            label={t("listPage.stats.buy", { defaultValue: "Kaufen" })}
            value={stats.buyCount}
          />
          <StatCard
            label={t("listPage.stats.rent", { defaultValue: "Mieten" })}
            value={stats.rentCount}
          />
        </section>

        {/* Content */}
        {loading ? (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="h-48 w-full rounded-2xl bg-slate-200 animate-pulse dark:bg-slate-800" />
                <div className="mt-4 h-5 w-3/4 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                <div className="mt-3 h-4 w-2/3 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
              </div>
            ))}
          </section>
        ) : errorKey ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 px-5 py-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-base font-semibold text-red-700 dark:text-red-300">
              {t("listPage.loadErrorTitle", {
                defaultValue: "Anzeigen konnten nicht geladen werden.",
              })}
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {t("listPage.loadErrorText", {
                defaultValue:
                  "Beim Laden der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
              })}
            </p>
            <button
              type="button"
              onClick={loadListings}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              <MdRefresh className="mr-2 text-base" />
              {t("listPage.tryAgain", { defaultValue: "Erneut versuchen" })}
            </button>
          </section>
        ) : listings.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <MdSearchOff className="text-2xl text-slate-500 dark:text-slate-300" />
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {t("listPage.emptyTitle", {
                defaultValue: "Keine Anzeigen gefunden",
              })}
            </h2>

            <p className="mt-2 max-w-xl mx-auto text-sm text-slate-600 dark:text-slate-300">
              {t("listPage.emptyText", {
                defaultValue:
                  "Aktuell sind keine Immobilienangebote verfügbar. Bitte schauen Sie später noch einmal vorbei.",
              })}
            </p>
          </section>
        )}

        {/* Bottom info */}
        {!loading && !errorKey && listings.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                <MdLocationOn className="text-xl" />
              </div>

              <div>
                <h3 className="text-base font-semibold">
                  {t("listPage.bottomTitle", {
                    defaultValue: "Mehr entdecken",
                  })}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {t("listPage.bottomText", {
                    defaultValue:
                      "Nutzen Sie zusätzlich die Kartenansicht, Filter und Detailseiten, um schneller die passende Immobilie zu finden.",
                  })}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
);

export default ListingsPage;