// src/components/ListingDetailsModal.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FavoriteButton from "./FavoriteButton";
import ContactOwnerModal from "./ContactOwnerModal";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const PLACEHOLDER_IMG = "/images/hero-1.jpg";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "€0";
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `€${n}`;
  }
};

const firstImage = (item) =>
  item?.images?.[0] ||
  item?.imageUrls?.[0] ||
  item?.photos?.[0] ||
  item?.imageUrl ||
  item?.image ||
  PLACEHOLDER_IMG;

const safeStr = (v) => (v == null ? "" : String(v));

const getListingUrl = (id) => {
  const base = window.location.origin;
  return `${base}/listing/${encodeURIComponent(id)}`;
};

export default function ListingDetailsModal({ listing, allListings = [], onClose }) {
  const { t } = useTranslation(["listingDetails", "listing", "map"]);

  const scrollRef = useRef(null);

  // ✅ Wir halten die “aktuell angezeigte” Anzeige intern
  const [current, setCurrent] = useState(listing || null);

  // Modal UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [imgIdx, setImgIdx] = useState(0);
  const [toast, setToast] = useState("");
  const [contactOpen, setContactOpen] = useState(false);

  // ✅ NEW: skeleton/loading state for main image + thumbs
  const [imgLoading, setImgLoading] = useState(true);

  // Wenn Parent eine neue listing reinreicht -> sync
  useEffect(() => {
    setCurrent(listing || null);
    setImgIdx(0);
    setImgLoading(true);
    // scroll nach oben
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [listing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whenever image changes
  useEffect(() => {
    setImgLoading(true);
  }, [imgIdx, current?.id]);

  // ESC close + body scroll lock
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const listingId = safeStr(current?.id);
  const shareUrl = listingId ? getListingUrl(listingId) : window.location.href;

  const images = useMemo(() => {
    const imgs = current?.images || current?.imageUrls || current?.photos || [];
    const cleaned = Array.isArray(imgs) ? imgs.filter(Boolean) : [];
    if (cleaned.length) return cleaned;
    const one = current?.imageUrl || current?.image;
    return one ? [one] : [PLACEHOLDER_IMG];
  }, [current]);

  useEffect(() => setImgIdx(0), [listingId]);

  const price = formatEUR(current?.price);
  const city = safeStr(current?.city);
  const address = safeStr(current?.address);
  const zip = safeStr(current?.zip);
  const type = safeStr(current?.type || current?.category || "Apartment");
  const purpose = safeStr(current?.purpose || current?.intent).toLowerCase();

  const beds = current?.bedrooms ?? current?.beds ?? current?.rooms ?? null;
  const baths = current?.bathrooms ?? current?.baths ?? null;
  const size = current?.size ?? current?.area ?? null;

  const badgePurpose =
    purpose === "rent"
      ? t("badgeRent", { ns: "listingDetails", defaultValue: "Zu vermieten" })
      : t("badgeBuy", { ns: "listingDetails", defaultValue: "Zu verkaufen" });

  const fullAddress = useMemo(() => {
    const parts = [address, zip, city].filter(Boolean);
    return parts.length
      ? parts.join(", ")
      : city || t("unknownAddress", { ns: "listingDetails", defaultValue: "Adresse nicht verfügbar" });
  }, [address, zip, city, t]);

  const facts = useMemo(() => {
    const arr = [];
    if (type) arr.push({ k: t("factsType", { ns: "listingDetails", defaultValue: "Immobilientyp" }), v: type });
    if (beds != null) arr.push({ k: t("factsBeds", { ns: "listingDetails", defaultValue: "Schlafzimmer" }), v: String(beds) });
    if (baths != null) arr.push({ k: t("factsBaths", { ns: "listingDetails", defaultValue: "Bäder" }), v: String(baths) });
    if (size != null) arr.push({ k: t("factsSize", { ns: "listingDetails", defaultValue: "Größe" }), v: `${size} m²` });
    if (city) arr.push({ k: t("factsCity", { ns: "listingDetails", defaultValue: "Stadt" }), v: city });
    if (address) arr.push({ k: t("factsAddress", { ns: "listingDetails", defaultValue: "Adresse" }), v: address });
    return arr;
  }, [t, type, beds, baths, size, city, address]);

  const sections = useMemo(
    () => [
      { id: "overview", label: t("tabOverview", { ns: "listingDetails", defaultValue: "Übersicht" }) },
      { id: "facts", label: t("tabFacts", { ns: "listingDetails", defaultValue: "Fakten" }) },
      { id: "features", label: t("tabFeatures", { ns: "listingDetails", defaultValue: "Ausstattung" }) },
      { id: "location", label: t("tabLocation", { ns: "listingDetails", defaultValue: "Lage" }) },
    ],
    [t]
  );

  const scrollToSection = useCallback((id) => {
    setActiveTab(id);
    const el = document.getElementById(`ldm-${id}`);
    if (!el || !scrollRef.current) return;
    const top = el.offsetTop - 12;
    scrollRef.current.scrollTo({ top, behavior: "smooth" });
  }, []);

  // ✅ Active Tab folgt dem Scroll
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const targets = sections
      .map((s) => document.getElementById(`ldm-${s.id}`))
      .filter(Boolean);

    if (!targets.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) {
          const id = visible.target.id.replace("ldm-", "");
          if (id && id !== activeTab) setActiveTab(id);
        }
      },
      { root, threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -55% 0px" }
    );

    targets.forEach((tgt) => obs.observe(tgt));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const nextImg = () => setImgIdx((i) => clamp(i + 1, 0, images.length - 1));
  const prevImg = () => setImgIdx((i) => clamp(i - 1, 0, images.length - 1));

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: current?.title || "MyHome24App",
          text: current?.title || "",
          url: shareUrl,
        });
        return;
      }
    } catch {
      // ignore
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      const msg = t("toastLinkCopied", { ns: "listingDetails", defaultValue: "Link kopiert" });
      setToast(msg);
      setTimeout(() => setToast(""), 1400);
    } catch {
      const msg = t("toastCopyFailed", { ns: "listingDetails", defaultValue: "Kopieren fehlgeschlagen" });
      setToast(msg);
      setTimeout(() => setToast(""), 1400);
    }
  };

  // ✅ echte Similar-Logik (einfach + nachvollziehbar):
  // - gleiche city ODER gleicher type
  // - gleicher purpose wenn vorhanden
  // - current ausgeschlossen
  const similar = useMemo(() => {
    const id = safeStr(current?.id);
    const cCity = safeStr(current?.city).toLowerCase();
    const cType = safeStr(current?.type || current?.category).toLowerCase();
    const cPurpose = safeStr(current?.purpose || current?.intent).toLowerCase();

    const pool = Array.isArray(allListings) ? allListings : [];
    const filtered = pool
      .filter((x) => safeStr(x?.id) && safeStr(x?.id) !== id)
      .filter((x) => {
        const xCity = safeStr(x?.city).toLowerCase();
        const xType = safeStr(x?.type || x?.category).toLowerCase();
        const xPurpose = safeStr(x?.purpose || x?.intent).toLowerCase();

        const cityMatch = cCity && xCity && xCity === cCity;
        const typeMatch = cType && xType && xType === cType;

        // wenn current purpose gesetzt ist, wollen wir “ähnlich” im selben Zweck
        const purposeOk = cPurpose ? xPurpose === cPurpose : true;

        return purposeOk && (cityMatch || typeMatch);
      });

    return filtered.slice(0, 4);
  }, [allListings, current]);

  const ownerEmail =
    current?.ownerEmail ||
    current?.email ||
    current?.userEmail ||
    current?.contactEmail ||
    null;

  if (!current) return null;

  return (
    // ✅ NEW: z-index endgültig hoch, immer über Navbar/Dropdown
    <div className="fixed inset-0 z-[999999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 z-[999998]" onClick={onClose} />

      {/* ✅ NEW: Mobile bottom-sheet behavior:
          - Mobile: bottom sheet (rounded top)
          - Desktop: centered modal (md:inset-6)
      */}
      <div
        className="
          fixed inset-x-0 bottom-0 top-0
          md:absolute md:inset-6
          md:rounded-2xl
          rounded-t-3xl
          overflow-hidden
          bg-white dark:bg-slate-950
          shadow-2xl
          border border-black/10 dark:border-white/10
          z-[999999]
          flex flex-col
        "
        role="dialog"
        aria-modal="true"
      >
        {/* ✅ Mobile handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-300/70 dark:bg-slate-700/70" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/92 dark:bg-slate-950/88 backdrop-blur border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 px-3 md:px-5 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center"
                aria-label={t("close", { ns: "listingDetails", defaultValue: "Schließen" })}
              >
                ✕
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                    {price}
                  </span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-600 text-white">
                    {badgePurpose}
                  </span>
                  {type ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                      {type}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300 truncate">
                  {fullAddress}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={share}
                className="h-10 px-3 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                {t("share", { ns: "listingDetails", defaultValue: "Teilen" })}
              </button>

              <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid place-items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <FavoriteButton listingId={listingId} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-3 md:px-5 pb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {sections.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`h-9 px-3 rounded-full border text-sm font-semibold whitespace-nowrap transition
                    ${activeTab === tab.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast ? (
          <div className="absolute top-[76px] right-3 md:right-6 z-40">
            <div className="px-3 py-2 rounded-xl bg-black/80 text-white text-sm shadow-lg">
              {toast}
            </div>
          </div>
        ) : null}

        {/* Body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto h-[calc(100%-128px)] md:h-[calc(100%-136px)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-4 md:gap-6 p-3 md:p-6">
            {/* LEFT */}
            <div className="space-y-4">
              {/* Gallery */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="relative">
                  {/* ✅ NEW: skeleton overlay */}
                  {imgLoading && (
                    <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
                  )}

                  <img
                    src={images[imgIdx]}
                    alt={current?.title || ""}
                    className={`w-full h-[240px] md:h-[380px] object-cover transition-opacity ${
                      imgLoading ? "opacity-0" : "opacity-100"
                    }`}
                    loading="eager"
                    onLoad={() => setImgLoading(false)}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMG;
                      setImgLoading(false);
                    }}
                  />

                  <div className="absolute top-3 right-3 text-xs font-semibold bg-black/70 text-white px-2 py-1 rounded-full">
                    {imgIdx + 1}/{images.length}
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow"
                        aria-label="Prev"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow"
                        aria-label="Next"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 p-2 overflow-x-auto">
                    {images.slice(0, 12).map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        onClick={() => setImgIdx(idx)}
                        className={`h-16 w-24 rounded-xl overflow-hidden border transition
                          ${idx === imgIdx ? "border-blue-600" : "border-gray-200 dark:border-slate-800"}`}
                        aria-label={`Image ${idx + 1}`}
                      >
                        <div className="relative h-full w-full">
                          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                          <img
                            src={src}
                            alt=""
                            className="relative h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMG;
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Overview */}
              <section id="ldm-overview" className="scroll-mt-24">
                <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("overviewTitle", { ns: "listingDetails", defaultValue: "Übersicht" })}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {current?.description
                      ? current.description
                      : t("overviewFallback", {
                          ns: "listingDetails",
                          defaultValue:
                            "Keine Beschreibung vorhanden. Bitte prüfen Sie die Details und kontaktieren Sie den:die Anbieter:in.",
                        })}
                  </p>
                </div>
              </section>

              {/* Facts */}
              <section id="ldm-facts" className="scroll-mt-24">
                <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("factsTitle", { ns: "listingDetails", defaultValue: "Fakten" })}
                  </h2>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {facts.length ? (
                      facts.map((f, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3"
                        >
                          <div className="text-xs text-slate-500 dark:text-slate-400">{f.k}</div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{f.v}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {t("noFacts", { ns: "listingDetails", defaultValue: "Keine Fakten verfügbar." })}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Features */}
              <section id="ldm-features" className="scroll-mt-24">
                <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("featuresTitle", { ns: "listingDetails", defaultValue: "Ausstattung" })}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(current?.features || current?.amenities || []).length ? (
                      (current.features || current.amenities).slice(0, 30).map((x, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        >
                          {String(x)}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t("featuresFallback", { ns: "listingDetails", defaultValue: "Keine Ausstattung hinterlegt." })}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Location */}
              <section id="ldm-location" className="scroll-mt-24">
                <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("locationTitle", { ns: "listingDetails", defaultValue: "Lage" })}
                  </h2>

                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    <div className="font-semibold">
                      {city || t("unknownCity", { ns: "listingDetails", defaultValue: "Unbekannt" })}
                    </div>
                    <div className="opacity-80">
                      {address || t("unknownAddress", { ns: "listingDetails", defaultValue: "Adresse nicht verfügbar" })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const q = encodeURIComponent([address, zip, city, "Deutschland"].filter(Boolean).join(", "));
                        window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
                      }}
                      className="mt-3 inline-flex items-center h-10 px-4 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      {t("openInMaps", { ns: "listingDetails", defaultValue: "In Maps öffnen" })}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <aside className="space-y-4">
              {/* Contact */}
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("contactTitle", { ns: "listingDetails", defaultValue: "Kontakt" })}
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {t("contactText", {
                    ns: "listingDetails",
                    defaultValue: "Fragen stellen, Besichtigung anfragen oder mehr Details bekommen – schnell und direkt.",
                  })}
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    className="h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    onClick={() => setContactOpen(true)}
                  >
                    {t("askQuestion", { ns: "listingDetails", defaultValue: "Frage stellen" })}
                  </button>

                  <button
                    className="h-11 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    onClick={() => scrollToSection("facts")}
                  >
                    {t("seeFacts", { ns: "listingDetails", defaultValue: "Fakten ansehen" })}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t("listingId", { ns: "listingDetails", defaultValue: "Anzeige-ID" })}:{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{listingId || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Similar */}
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("similarTitle", { ns: "listingDetails", defaultValue: "Ähnliche Anzeigen" })}
                </h3>

                {similar.length ? (
                  <div className="mt-3 space-y-2">
                    {similar.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setCurrent(it);
                          setImgIdx(0);
                          setImgLoading(true);
                          setActiveTab("overview");
                          if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full text-left rounded-2xl border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition p-3 flex gap-3"
                      >
                        <div className="h-14 w-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-800 flex-shrink-0">
                          <img
                            src={firstImage(it)}
                            alt={it?.title || ""}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMG;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {it?.title || "—"}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                            {[it?.address, it?.city].filter(Boolean).join(", ")}
                          </div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatEUR(it?.price)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {t("similarEmpty", {
                      ns: "listingDetails",
                      defaultValue: "Aktuell keine ähnlichen Anzeigen gefunden.",
                    })}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* ✅ Real Contact Modal */}
        <ContactOwnerModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          ownerEmail={ownerEmail}
          listing={current}
        />
      </div>
    </div>
  );
}
