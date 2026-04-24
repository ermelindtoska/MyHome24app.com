import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import FavoriteButton from "./FavoriteButton";
import ContactOwnerModal from "./ContactOwnerModal";
import ImageLightbox from "./gallery/ImageLightbox";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const PLACEHOLDER_IMG = "/images/hero-1.jpg";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "€ 0";
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `€ ${n}`;
  }
};

const safeStr = (v) => (v == null ? "" : String(v));

const getListingUrl = (id) => {
  const base = window.location.origin;
  return `${base}/listing/${encodeURIComponent(id)}`;
};

const getImages = (item) => {
  const imgs = item?.images || item?.imageUrls || item?.photos || [];
  const cleaned = Array.isArray(imgs) ? imgs.filter(Boolean) : [];

  if (cleaned.length) return cleaned;

  const one = item?.imageUrl || item?.image;
  return one ? [one] : [PLACEHOLDER_IMG];
};

const firstImage = (item) => getImages(item)[0] || PLACEHOLDER_IMG;

const normalizeFeatures = (item) => {
  const raw = item?.features ?? item?.amenities ?? [];

  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map((x) => String(x));
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);
  }

  return [];
};

export default function ListingDetailsModal({
  listing,
  allListings = [],
  onClose,
  onSelectListing,
}) {
  const { t } = useTranslation(["listingDetails", "listing", "map"]);
  const scrollRef = useRef(null);

  const [current, setCurrent] = useState(listing || null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imgIdx, setImgIdx] = useState(0);
  const [toast, setToast] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setCurrent(listing || null);
    setImgIdx(0);
    setImgLoading(true);
    setActiveTab("overview");
    setLightboxOpen(false);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [listing?.id]);

  useEffect(() => {
    setImgLoading(true);
  }, [imgIdx, current?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !lightboxOpen) onClose?.();
      if (!lightboxOpen && e.key === "ArrowRight") {
        setImgIdx((i) => clamp(i + 1, 0, Math.max(images.length - 1, 0)));
      }
      if (!lightboxOpen && e.key === "ArrowLeft") {
        setImgIdx((i) => clamp(i - 1, 0, Math.max(images.length - 1, 0)));
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, lightboxOpen]);

  const listingId = safeStr(current?.id);
  const shareUrl = listingId ? getListingUrl(listingId) : window.location.href;

  const images = useMemo(() => getImages(current), [current]);
  const features = useMemo(() => normalizeFeatures(current), [current]);

  useEffect(() => {
    setImgIdx(0);
  }, [listingId]);

  const price = formatEUR(current?.price);
  const city = safeStr(current?.city);
  const address = safeStr(current?.address || current?.street);
  const zip = safeStr(current?.zip || current?.zipCode);
  const type = safeStr(current?.type || current?.category || "Apartment");
  const purpose = safeStr(current?.purpose || current?.intent).toLowerCase();

  const beds = current?.bedrooms ?? current?.beds ?? current?.rooms ?? null;
  const baths = current?.bathrooms ?? current?.baths ?? null;
  const size = current?.size ?? current?.area ?? null;

  const badgePurpose =
    purpose === "rent"
      ? t("badgeRent", {
          ns: "listingDetails",
          defaultValue: "Zu vermieten",
        })
      : t("badgeBuy", {
          ns: "listingDetails",
          defaultValue: "Zu verkaufen",
        });

  const fullAddress = useMemo(() => {
    const parts = [address, zip, city].filter(Boolean);
    return parts.length
      ? parts.join(", ")
      : city ||
          t("unknownAddress", {
            ns: "listingDetails",
            defaultValue: "Adresse nicht verfügbar",
          });
  }, [address, zip, city, t]);

  const facts = useMemo(() => {
    const arr = [];

    if (type) {
      arr.push({
        k: t("factsType", {
          ns: "listingDetails",
          defaultValue: "Immobilientyp",
        }),
        v: type,
      });
    }

    if (beds != null) {
      arr.push({
        k: t("factsBeds", {
          ns: "listingDetails",
          defaultValue: "Schlafzimmer",
        }),
        v: String(beds),
      });
    }

    if (baths != null) {
      arr.push({
        k: t("factsBaths", {
          ns: "listingDetails",
          defaultValue: "Bäder",
        }),
        v: String(baths),
      });
    }

    if (size != null) {
      arr.push({
        k: t("factsSize", {
          ns: "listingDetails",
          defaultValue: "Größe",
        }),
        v: `${size} m²`,
      });
    }

    if (city) {
      arr.push({
        k: t("factsCity", {
          ns: "listingDetails",
          defaultValue: "Stadt",
        }),
        v: city,
      });
    }

    if (address) {
      arr.push({
        k: t("factsAddress", {
          ns: "listingDetails",
          defaultValue: "Adresse",
        }),
        v: address,
      });
    }

    if (zip) {
      arr.push({
        k: t("factsZip", {
          ns: "listingDetails",
          defaultValue: "PLZ",
        }),
        v: zip,
      });
    }

    return arr;
  }, [t, type, beds, baths, size, city, address, zip]);

  const sections = useMemo(
    () => [
      {
        id: "overview",
        label: t("tabOverview", {
          ns: "listingDetails",
          defaultValue: "Übersicht",
        }),
      },
      {
        id: "facts",
        label: t("tabFacts", {
          ns: "listingDetails",
          defaultValue: "Fakten",
        }),
      },
      {
        id: "features",
        label: t("tabFeatures", {
          ns: "listingDetails",
          defaultValue: "Ausstattung",
        }),
      },
      {
        id: "location",
        label: t("tabLocation", {
          ns: "listingDetails",
          defaultValue: "Lage",
        }),
      },
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
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          )[0];

        if (visible?.target?.id) {
          const id = visible.target.id.replace("ldm-", "");
          if (id) setActiveTab(id);
        }
      },
      {
        root,
        threshold: [0.2, 0.35, 0.5],
        rootMargin: "-20% 0px -55% 0px",
      }
    );

    targets.forEach((tgt) => obs.observe(tgt));
    return () => obs.disconnect();
  }, [sections]);

  const nextImg = () =>
    setImgIdx((i) => clamp(i + 1, 0, images.length - 1));

  const prevImg = () =>
    setImgIdx((i) => clamp(i - 1, 0, images.length - 1));

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
    } catch {}

    try {
      await navigator.clipboard.writeText(shareUrl);
      const msg = t("toastLinkCopied", {
        ns: "listingDetails",
        defaultValue: "Link kopiert",
      });
      setToast(msg);
      setTimeout(() => setToast(""), 1400);
    } catch {
      const msg = t("toastCopyFailed", {
        ns: "listingDetails",
        defaultValue: "Kopieren fehlgeschlagen",
      });
      setToast(msg);
      setTimeout(() => setToast(""), 1400);
    }
  };

  const similar = useMemo(() => {
    const id = safeStr(current?.id);
    const cCity = safeStr(current?.city).toLowerCase();
    const cType = safeStr(current?.type || current?.category).toLowerCase();
    const cPurpose = safeStr(current?.purpose || current?.intent).toLowerCase();

    const pool = Array.isArray(allListings) ? allListings : [];

    return pool
      .filter((x) => safeStr(x?.id) && safeStr(x?.id) !== id)
      .filter((x) => {
        const xCity = safeStr(x?.city).toLowerCase();
        const xType = safeStr(x?.type || x?.category).toLowerCase();
        const xPurpose = safeStr(x?.purpose || x?.intent).toLowerCase();

        const cityMatch = cCity && xCity && xCity === cCity;
        const typeMatch = cType && xType && xType === cType;
        const purposeOk = cPurpose ? xPurpose === cPurpose : true;

        return purposeOk && (cityMatch || typeMatch);
      })
      .slice(0, 4);
  }, [allListings, current]);

  const ownerEmail =
    current?.ownerEmail ||
    current?.email ||
    current?.userEmail ||
    current?.contactEmail ||
    null;

  const handleSelectSimilar = (item) => {
    if (!item) return;

    if (typeof onSelectListing === "function") {
      onSelectListing(item);
      return;
    }

    setCurrent(item);
    setImgIdx(0);
    setImgLoading(true);
    setActiveTab("overview");
    setLightboxOpen(false);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!current) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999999]">
        <div
          className="absolute inset-0 z-[999998] bg-black/55"
          onClick={onClose}
        />

        <div
          className="
            fixed inset-x-0 bottom-0 top-0
            md:absolute md:inset-6
            flex flex-col overflow-hidden
            rounded-t-3xl md:rounded-2xl
            border border-black/10 bg-white shadow-2xl
            dark:border-white/10 dark:bg-slate-950
            z-[999999]
          "
          role="dialog"
          aria-modal="true"
        >
          <div className="flex justify-center pb-1 pt-2 md:hidden">
            <div className="h-1.5 w-12 rounded-full bg-slate-300/70 dark:bg-slate-700/70" />
          </div>

          <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/92 backdrop-blur dark:border-slate-800 dark:bg-slate-950/88">
            <div className="flex items-center justify-between gap-2 px-3 py-3 md:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                  aria-label={t("close", {
                    ns: "listingDetails",
                    defaultValue: "Schließen",
                  })}
                >
                  ✕
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white md:text-xl">
                      {price}
                    </span>

                    <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                      {badgePurpose}
                    </span>

                    {type ? (
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        {type}
                      </span>
                    ) : null}
                  </div>

                  <div className="truncate text-xs text-slate-600 dark:text-slate-300 md:text-sm">
                    {fullAddress}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={share}
                  className="h-10 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {t("share", {
                    ns: "listingDetails",
                    defaultValue: "Teilen",
                  })}
                </button>

                <div className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                  <FavoriteButton listingId={listingId} />
                </div>
              </div>
            </div>

            <div className="px-3 pb-3 md:px-5">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {sections.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`h-9 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-slate-700 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {toast ? (
            <div className="absolute right-3 top-[76px] z-40 md:right-6">
              <div className="rounded-xl bg-black/80 px-3 py-2 text-sm text-white shadow-lg">
                {toast}
              </div>
            </div>
          ) : null}

          <div
            ref={scrollRef}
            className="h-[calc(100%-128px)] flex-1 overflow-y-auto md:h-[calc(100%-136px)]"
          >
            <div className="grid grid-cols-1 gap-4 p-3 md:gap-6 md:p-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <div className="relative">
                    {imgLoading && (
                      <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
                    )}

                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="block w-full cursor-zoom-in"
                    >
                      <img
                        src={images[imgIdx]}
                        alt={current?.title || ""}
                        className={`h-[240px] w-full object-cover transition-opacity md:h-[380px] ${
                          imgLoading ? "opacity-0" : "opacity-100"
                        }`}
                        loading="eager"
                        onLoad={() => setImgLoading(false)}
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_IMG;
                          setImgLoading(false);
                        }}
                      />
                    </button>

                    <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                      {imgIdx + 1}/{images.length}
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImg}
                          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white"
                          aria-label="Prev"
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextImg}
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white"
                          aria-label="Next"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-2">
                      {images.slice(0, 12).map((src, idx) => (
                        <button
                          key={`${src}-${idx}`}
                          onClick={() => setImgIdx(idx)}
                          className={`h-16 w-24 overflow-hidden rounded-xl border transition ${
                            idx === imgIdx
                              ? "border-blue-600"
                              : "border-gray-200 dark:border-slate-800"
                          }`}
                          aria-label={`Image ${idx + 1}`}
                        >
                          <div className="relative h-full w-full">
                            <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
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

                <section id="ldm-overview" className="scroll-mt-24">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("overviewTitle", {
                        ns: "listingDetails",
                        defaultValue: "Übersicht",
                      })}
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

                <section id="ldm-facts" className="scroll-mt-24">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("factsTitle", {
                        ns: "listingDetails",
                        defaultValue: "Fakten",
                      })}
                    </h2>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {facts.length ? (
                        facts.map((f, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-gray-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {f.k}
                            </div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {f.v}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {t("noFacts", {
                            ns: "listingDetails",
                            defaultValue: "Keine Fakten verfügbar.",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section id="ldm-features" className="scroll-mt-24">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("featuresTitle", {
                        ns: "listingDetails",
                        defaultValue: "Ausstattung",
                      })}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {features.length ? (
                        features.slice(0, 30).map((x, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                          >
                            {String(x)}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {t("featuresFallback", {
                            ns: "listingDetails",
                            defaultValue: "Keine Ausstattung hinterlegt.",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section id="ldm-location" className="scroll-mt-24">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("locationTitle", {
                        ns: "listingDetails",
                        defaultValue: "Lage",
                      })}
                    </h2>

                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      <div className="font-semibold">
                        {city ||
                          t("unknownCity", {
                            ns: "listingDetails",
                            defaultValue: "Unbekannt",
                          })}
                      </div>
                      <div className="opacity-80">
                        {address ||
                          t("unknownAddress", {
                            ns: "listingDetails",
                            defaultValue: "Adresse nicht verfügbar",
                          })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const q = encodeURIComponent(
                            [address, zip, city, "Deutschland"]
                              .filter(Boolean)
                              .join(", ")
                          );
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${q}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                        className="mt-3 inline-flex h-10 items-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {t("openInMaps", {
                          ns: "listingDetails",
                          defaultValue: "In Maps öffnen",
                        })}
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t("contactTitle", {
                      ns: "listingDetails",
                      defaultValue: "Kontakt",
                    })}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {t("contactText", {
                      ns: "listingDetails",
                      defaultValue:
                        "Fragen stellen, Besichtigung anfragen oder mehr Details bekommen – schnell und direkt.",
                    })}
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      className="h-11 rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700"
                      onClick={() => setContactOpen(true)}
                    >
                      {t("askQuestion", {
                        ns: "listingDetails",
                        defaultValue: "Frage stellen",
                      })}
                    </button>

                    <button
                      className="h-11 rounded-xl border border-gray-200 bg-white font-semibold text-slate-900 transition hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      onClick={() => scrollToSection("facts")}
                    >
                      {t("seeFacts", {
                        ns: "listingDetails",
                        defaultValue: "Fakten ansehen",
                      })}
                    </button>
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t("listingId", {
                        ns: "listingDetails",
                        defaultValue: "Anzeige-ID",
                      })}
                      :{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {listingId || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t("similarTitle", {
                      ns: "listingDetails",
                      defaultValue: "Ähnliche Anzeigen",
                    })}
                  </h3>

                  {similar.length ? (
                    <div className="mt-3 space-y-2">
                      {similar.map((it) => (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => handleSelectSimilar(it)}
                          className="flex w-full gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200 dark:bg-slate-800">
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
                            <div className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                              {it?.title || "—"}
                            </div>
                            <div className="line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
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
                        defaultValue:
                          "Aktuell keine ähnlichen Anzeigen gefunden.",
                      })}
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>

          <ContactOwnerModal
            isOpen={contactOpen}
            onClose={() => setContactOpen(false)}
            ownerEmail={ownerEmail}
            listing={current}
          />
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        activeIndex={imgIdx}
        onChangeIndex={setImgIdx}
        onClose={() => setLightboxOpen(false)}
        title={current?.title || ""}
        fallbackImage={PLACEHOLDER_IMG}
      />
    </>
  );
}

ListingDetailsModal.propTypes = {
  listing: PropTypes.object,
  allListings: PropTypes.array,
  onClose: PropTypes.func,
  onSelectListing: PropTypes.func,
};