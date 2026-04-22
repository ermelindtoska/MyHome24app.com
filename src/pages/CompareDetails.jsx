// src/pages/CompareDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  MdArrowBack,
  MdLocationOn,
  MdOpenInNew,
  MdContentCopy,
  MdShare,
  MdInfo,
  MdCheckCircle,
} from "react-icons/md";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1400&q=80";

function formatPriceEUR(value, lang) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat(lang || "de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${num} €`;
  }
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

export default function CompareDetails() {
  const { t, i18n } = useTranslation("compare");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1) Primary: state.listing
  // 2) Fallback: ?id=... (load from localStorage cache if you saved it)
  //    You can save compare listing in localStorage from ComparePage: localStorage.setItem(`compare:${id}`, JSON.stringify(listing))
  const stateListing = location.state?.listing || null;
  const idFromQuery = searchParams.get("id");

  const [listing, setListing] = useState(stateListing);

  useEffect(() => {
    if (stateListing) {
      setListing(stateListing);
      // optional cache
      const lid = stateListing?.id || stateListing?.listingId;
      if (lid) {
        try {
          localStorage.setItem(`compare:${lid}`, JSON.stringify(stateListing));
        } catch {}
      }
      return;
    }

    if (idFromQuery) {
      try {
        const raw = localStorage.getItem(`compare:${idFromQuery}`);
        if (raw) setListing(JSON.parse(raw));
      } catch {}
    }
  }, [stateListing, idFromQuery]);

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/compare/details${idFromQuery ? `?id=${encodeURIComponent(idFromQuery)}` : ""}`;

  const title = listing?.title || listing?.name || t("details.metaTitleFallback", { defaultValue: "Vergleich – Details" });
  const city = listing?.city || listing?.location || "—";

  const imageUrl =
    listing?.coverImage ||
    listing?.imageUrl ||
    safeArray(listing?.images)[0] ||
    FALLBACK_IMG;

  const priceLabel = formatPriceEUR(listing?.price, lang);

  const facts = useMemo(() => {
    const size = listing?.size ?? listing?.area ?? listing?.livingArea;
    const rooms = listing?.rooms ?? listing?.roomCount;
    const bedrooms = listing?.bedrooms;
    const bathrooms = listing?.bathrooms;
    const type = listing?.type;
    const purpose = listing?.purpose;
    const year = listing?.yearBuilt ?? listing?.builtYear;

    return [
      { k: t("details.facts.price", { defaultValue: "Preis" }), v: priceLabel },
      {
        k: t("details.facts.area", { defaultValue: "Wohnfläche" }),
        v: Number(size) ? `${size} m²` : "—",
      },
      {
        k: t("details.facts.rooms", { defaultValue: "Zimmer" }),
        v: Number(rooms) ? String(rooms) : "—",
      },
      {
        k: t("details.facts.bedrooms", { defaultValue: "Schlafzimmer" }),
        v: Number(bedrooms) ? String(bedrooms) : "—",
      },
      {
        k: t("details.facts.bathrooms", { defaultValue: "Bäder" }),
        v: Number(bathrooms) ? String(bathrooms) : "—",
      },
      {
        k: t("details.facts.type", { defaultValue: "Typ" }),
        v: type ? String(type) : "—",
      },
      {
        k: t("details.facts.purpose", { defaultValue: "Zweck" }),
        v: purpose ? String(purpose) : "—",
      },
      {
        k: t("details.facts.year", { defaultValue: "Baujahr" }),
        v: year ? String(year) : "—",
      },
    ];
  }, [listing, priceLabel, t]);

  const highlights = useMemo(() => {
    // supports listing.highlights OR listing.amenities OR listing.features
    const a =
      safeArray(listing?.highlights).length
        ? listing.highlights
        : safeArray(listing?.amenities).length
        ? listing.amenities
        : safeArray(listing?.features);
    return safeArray(a).slice(0, 12);
  }, [listing]);

  const description =
    listing?.description ||
    listing?.desc ||
    t("details.noDescription", { defaultValue: "Keine Beschreibung verfügbar." });

  const listingId = listing?.id || listing?.listingId || idFromQuery || null;

  const goBack = () => navigate(-1);

  const openListing = () => {
    // adapt these routes to your app if needed
    if (!listingId) return;
    navigate(`/listing/${listingId}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert(t("details.copied", { defaultValue: "Link kopiert!" }));
    } catch {
      alert(t("details.copyFailed", { defaultValue: "Kopieren fehlgeschlagen." }));
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: t("details.shareText", { defaultValue: "Sieh dir dieses Listing an:" }),
          url: window.location.href,
        });
      } else {
        await copyLink();
      }
    } catch {}
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <SiteMeta
          title={t("details.metaTitleFallback", { defaultValue: "Vergleich – Details" })}
          description={t("details.metaDescriptionFallback", {
            defaultValue: "Listing-Details aus dem Vergleich.",
          })}
          canonical={canonical}
          lang={lang}
          ogImage={`${window.location.origin}/og/og-compare.jpg`}
        />

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-950/40 dark:border-slate-800">
                <MdInfo className="text-xl" />
              </span>
              <div>
                <h1 className="text-lg font-bold">
                  {t("noData", { defaultValue: "Keine Daten verfügbar." })}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {t("details.noDataHint", {
                    defaultValue:
                      "Bitte öffne diese Seite über den Vergleich oder gib eine gültige ID an.",
                  })}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <MdArrowBack className="mr-2 text-lg" />
                    {t("details.back", { defaultValue: "Zurück" })}
                  </button>
                  <Link
                    to="/compare"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    {t("details.goCompare", { defaultValue: "Zum Vergleich" })}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("details.metaTitle", { defaultValue: "{{title}} – Vergleich", title })}
        description={t("details.metaDescription", {
          defaultValue: "Details und Fakten für {{title}} in {{city}}.",
          title,
          city,
        })}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-compare.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {/* Top actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            <MdArrowBack className="mr-1 text-lg" />
            {t("details.back", { defaultValue: "Zurück" })}
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <MdContentCopy className="mr-2 text-base" />
              {t("details.copyLink", { defaultValue: "Link kopieren" })}
            </button>

            <button
              type="button"
              onClick={share}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <MdShare className="mr-2 text-base" />
              {t("details.share", { defaultValue: "Teilen" })}
            </button>

            <button
              type="button"
              onClick={openListing}
              disabled={!listingId}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <MdOpenInNew className="mr-2 text-base" />
              {t("details.openListing", { defaultValue: "Listing öffnen" })}
            </button>
          </div>
        </div>

        {/* Hero */}
        <section className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] items-start">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <img
              src={imageUrl}
              alt={title}
              className="h-[260px] md:h-[360px] w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

            <div className="absolute left-5 right-5 bottom-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-4 py-1 text-xs font-semibold text-white">
                  {t("details.badge", { defaultValue: "Vergleich – Details" })}
                </span>
                <span className="inline-flex items-center rounded-full bg-black/35 border border-white/25 px-4 py-1 text-xs font-semibold text-white">
                  <MdLocationOn className="mr-1" />
                  {city}
                </span>
              </div>

              <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-white leading-snug">
                {title}
              </h1>

              <div className="mt-2 text-lg md:text-2xl font-bold text-white">
                {priceLabel}
              </div>
            </div>
          </div>

          {/* Facts */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <h2 className="text-base md:text-lg font-bold">
              {t("details.keyFacts", { defaultValue: "Key Facts" })}
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {facts.map((x, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 dark:bg-slate-950/40 dark:border-slate-800"
                >
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {x.k}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {x.v}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              {t("details.disclaimer", {
                defaultValue: "Angaben können je nach Quelle variieren.",
              })}
            </p>
          </aside>
        </section>

        {/* Highlights + Description */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr,1.05fr] items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <h2 className="text-base md:text-lg font-bold">
              {t("details.highlights", { defaultValue: "Highlights" })}
            </h2>

            {highlights.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {highlights.map((h, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-200"
                  >
                    <MdCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                    <span>{String(h)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {t("details.noHighlights", { defaultValue: "Keine Highlights verfügbar." })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            <h2 className="text-base md:text-lg font-bold">
              {t("details.descriptionTitle", { defaultValue: "Beschreibung" })}
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
              {description}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}