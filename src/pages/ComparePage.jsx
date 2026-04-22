import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FiMoon,
  FiSun,
  FiRefreshCw,
  FiTrash2,
  FiCopy,
  FiSearch,
  FiHome,
  FiMapPin,
  FiLayers,
  FiCheckCircle,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";

const STORAGE_KEYS = ["compareListings", "compareItems", "compareProperties"];
const MAX_COMPARE = 3;
const FALLBACK_IMG = "/images/hero-1.jpg";

function readCompareFromStorage() {
  for (const key of STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return [];
}

function writeCompareToStorage(items) {
  for (const key of STORAGE_KEYS) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
}

function firstImage(item) {
  return (
    item?.images?.[0] ||
    item?.imageUrls?.[0] ||
    item?.imageUrl ||
    item?.image ||
    FALLBACK_IMG
  );
}

function formatPrice(value, purpose) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

  return purpose === "rent" ? `${formatted} / Monat` : formatted;
}

function getPurposeLabel(t, purpose) {
  if (purpose === "rent") {
    return t("fields.purposeRent", { defaultValue: "Miete" });
  }
  if (purpose === "buy") {
    return t("fields.purposeBuy", { defaultValue: "Kauf" });
  }
  return "—";
}

function getTypeLabel(t, type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "apartment") {
    return t("fields.typeApartment", { defaultValue: "Wohnung" });
  }
  if (normalized === "house") {
    return t("fields.typeHouse", { defaultValue: "Haus" });
  }
  if (normalized === "office" || normalized === "commercial") {
    return t("fields.typeOffice", { defaultValue: "Büro / Gewerbe" });
  }
  return type || "—";
}

function buildSummary(items, t) {
  if (!items.length) {
    return t("summary.empty", {
      defaultValue: "Keine Immobilien zum Vergleichen ausgewählt.",
    });
  }

  return items
    .map((item, index) => {
      return `${index + 1}. ${item.title || "—"} | ${item.city || "—"} | ${formatPrice(
        item.price,
        item.purpose
      )} | ${item.bedrooms ?? item.rooms ?? "—"} ${t("fields.bedroomsShort", {
        defaultValue: "SZ",
      })} | ${item.bathrooms ?? "—"} ${t("fields.bathroomsShort", {
        defaultValue: "BZ",
      })} | ${item.size ? `${item.size} m²` : "—"}`;
    })
    .join("\n");
}

const ComparePage = () => {
  const { t, i18n } = useTranslation("compare");
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setItems(readCompareFromStorage());

    const root = document.documentElement;
    const isDark =
      root.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    writeCompareToStorage(items);
  }, [items]);

  const filledCount = items.length;
  const emptySlots = Math.max(0, MAX_COMPARE - filledCount);

  const stats = useMemo(() => {
    if (!items.length) {
      return {
        avgPrice: "—",
        largestSize: "—",
        cities: 0,
      };
    }

    const prices = items
      .map((item) => Number(item.price))
      .filter((n) => Number.isFinite(n));

    const sizes = items
      .map((item) => Number(item.size))
      .filter((n) => Number.isFinite(n));

    const avg =
      prices.length > 0
        ? new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(prices.reduce((a, b) => a + b, 0) / prices.length)
        : "—";

    const maxSize =
      sizes.length > 0
        ? `${Math.max(...sizes).toLocaleString("de-DE")} m²`
        : "—";

    const cities = new Set(items.map((item) => item.city).filter(Boolean)).size;

    return {
      avgPrice: avg,
      largestSize: maxSize,
      cities,
    };
  }, [items]);

  const summaryText = useMemo(() => buildSummary(items, t), [items, t]);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const next = !darkMode;
    setDarkMode(next);

    if (next) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const refreshCompare = () => {
    setItems(readCompareFromStorage());
  };

  const clearAll = () => {
    setItems([]);
    writeCompareToStorage([]);
  };

  const removeItem = (id) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    writeCompareToStorage(updated);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const renderSlot = (item, index) => {
    if (!item) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex h-full flex-col justify-between gap-5">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {t("slots.emptyTitle", { defaultValue: "Freier Slot" })}
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t("slots.emptyText", {
                  defaultValue:
                    "Füge eine Immobilie hinzu, um sie hier mit anderen Objekten zu vergleichen.",
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/buy")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <FiSearch />
              {t("actions.goSearch", { defaultValue: "Zur Suche" })}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <img
            src={firstImage(item)}
            alt={item.title || t("fields.imageFallback", { defaultValue: "Immobilie" })}
            className="h-48 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />

          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow dark:bg-slate-950/95 dark:text-white">
            {t("slots.slotLabel", {
              defaultValue: "Objekt {{index}}",
              index: index + 1,
            })}
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow transition hover:bg-rose-50 dark:bg-slate-950/95 dark:hover:bg-slate-800"
            aria-label={t("actions.remove", { defaultValue: "Entfernen" })}
            title={t("actions.remove", { defaultValue: "Entfernen" })}
          >
            <FiTrash2 />
          </button>

          <div className="absolute bottom-3 left-3 rounded-2xl bg-slate-950/85 px-3 py-2 text-sm font-bold text-white backdrop-blur">
            {formatPrice(item.price, item.purpose)}
          </div>
        </div>

        <div className="p-5">
          <div className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
            {item.title || "—"}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <FiMapPin />
            <span className="line-clamp-1">
              {[item.address, item.city].filter(Boolean).join(", ") || "—"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>
              {item.bedrooms ?? item.rooms ?? "—"}{" "}
              {t("fields.bedroomsShort", { defaultValue: "SZ" })}
            </Pill>
            <Pill>
              {item.bathrooms ?? "—"}{" "}
              {t("fields.bathroomsShort", { defaultValue: "BZ" })}
            </Pill>
            <Pill>{item.size ? `${item.size} m²` : "—"}</Pill>
            <Pill>{getTypeLabel(t, item.type)}</Pill>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/listing/${item.id}`)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("actions.viewDetails", { defaultValue: "Details ansehen" })}
            </button>

            <button
              type="button"
              onClick={() => navigate("/buy")}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("actions.replace", { defaultValue: "Ersetzen" })}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const allSlots = [...items];
  while (allSlots.length < MAX_COMPARE) allSlots.push(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* HERO / TOP BAR */}
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 p-5 md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  <FiBarChart2 />
                  {t("hero.badge", { defaultValue: "Vergleichszentrale" })}
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                  {t("hero.title", {
                    defaultValue: "Immobilien professionell vergleichen",
                  })}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                  {t("hero.subtitle", {
                    defaultValue:
                      "Vergleiche Preise, Größe, Ausstattung und Lage deiner ausgewählten Immobilien auf einen Blick – klar strukturiert und deutlich hochwertiger als eine einfache Merkliste.",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[380px]">
                <StatCard
                  icon={<FiLayers />}
                  label={t("stats.selected", { defaultValue: "Ausgewählt" })}
                  value={`${filledCount}/${MAX_COMPARE}`}
                />
                <StatCard
                  icon={<FiCheckCircle />}
                  label={t("stats.avgPrice", { defaultValue: "Ø Preis" })}
                  value={stats.avgPrice}
                />
                <StatCard
                  icon={<FiHome />}
                  label={t("stats.largest", { defaultValue: "Größte Fläche" })}
                  value={stats.largestSize}
                />
                <StatCard
                  icon={<FiMapPin />}
                  label={t("stats.cities", { defaultValue: "Städte" })}
                  value={String(stats.cities)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={() => navigate("/buy")} icon={<FiSearch />}>
                {t("actions.addListings", { defaultValue: "Immobilien hinzufügen" })}
              </ActionButton>

              <ActionButton onClick={copySummary} icon={<FiCopy />} secondary>
                {copied
                  ? t("actions.copied", { defaultValue: "Kopiert" })
                  : t("actions.copySummary", { defaultValue: "Zusammenfassung kopieren" })}
              </ActionButton>

              <ActionButton onClick={refreshCompare} icon={<FiRefreshCw />} secondary>
                {t("actions.refresh", { defaultValue: "Aktualisieren" })}
              </ActionButton>

              <ActionButton
                onClick={toggleDarkMode}
                icon={darkMode ? <FiSun /> : <FiMoon />}
                secondary
              >
                {darkMode
                  ? t("actions.lightMode", { defaultValue: "Light Mode" })
                  : t("actions.darkMode", { defaultValue: "Dark Mode" })}
              </ActionButton>

              <ActionButton onClick={clearAll} icon={<FiTrash2 />} danger>
                {t("actions.clearAll", { defaultValue: "Alles entfernen" })}
              </ActionButton>
            </div>
          </div>
        </section>

        {/* SLOTS */}
        <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {allSlots.map((item, index) => (
            <React.Fragment key={item?.id || `slot-${index}`}>
              {renderSlot(item, index)}
            </React.Fragment>
          ))}
        </section>

        {/* SUMMARY STRIP */}
        <section className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {t("summary.title", { defaultValue: "Schnelleinschätzung" })}
              </div>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                {items.length > 0
                  ? t("summary.filled", {
                      defaultValue:
                        "Du hast aktuell {{count}} Immobilien im Vergleich. Nutze die Tabelle unten für einen detaillierten Überblick.",
                      count: items.length,
                    })
                  : t("summary.emptyInfo", {
                      defaultValue:
                        "Noch keine Immobilien ausgewählt. Füge bis zu drei Objekte hinzu, um Preis, Lage und Ausstattung direkt zu vergleichen.",
                    })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/buy")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                {t("summary.primaryCta", { defaultValue: "Jetzt Immobilien finden" })}
                <FiArrowRight />
              </button>

              <button
                type="button"
                onClick={copySummary}
                className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-300 px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
              >
                {t("summary.secondaryCta", { defaultValue: "Zusammenfassung kopieren" })}
              </button>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 md:px-7">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                {t("table.title", { defaultValue: "Vergleichstabelle" })}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {t("table.subtitle", {
                  defaultValue:
                    "Schneller Vergleich der wichtigsten Werte für deine ausgewählten Immobilien.",
                })}
              </p>
            </div>

            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {t("table.count", {
                defaultValue: "{{count}} Immobilien",
                count: items.length,
              })}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-10 md:px-7">
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("table.emptyTitle", {
                    defaultValue: "Noch keine Immobilien im Vergleich",
                  })}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {t("table.emptyText", {
                    defaultValue:
                      "Wähle Objekte aus der Suche oder aus den Listing-Ansichten aus, um hier einen professionellen Vergleich zu sehen.",
                  })}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/buy")}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <FiSearch />
                  {t("actions.goSearch", { defaultValue: "Zur Suche" })}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40">
                    <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-5 py-4 text-left text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                      {t("table.feature", { defaultValue: "Merkmal" })}
                    </th>

                    {items.map((item) => (
                      <th
                        key={item.id}
                        className="min-w-[240px] border-b border-slate-200 px-5 py-4 text-left dark:border-slate-800"
                      >
                        <div className="text-base font-bold text-slate-950 dark:text-white">
                          {item.title || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.city || "—"}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <CompareRow
                    label={t("fields.price", { defaultValue: "Preis" })}
                    values={items.map((item) => formatPrice(item.price, item.purpose))}
                  />
                  <CompareRow
                    label={t("fields.city", { defaultValue: "Stadt" })}
                    values={items.map((item) => item.city || "—")}
                  />
                  <CompareRow
                    label={t("fields.address", { defaultValue: "Adresse" })}
                    values={items.map(
                      (item) =>
                        [item.address, item.zipCode || item.zip, item.city]
                          .filter(Boolean)
                          .join(", ") || "—"
                    )}
                  />
                  <CompareRow
                    label={t("fields.type", { defaultValue: "Immobilientyp" })}
                    values={items.map((item) => getTypeLabel(t, item.type))}
                  />
                  <CompareRow
                    label={t("fields.purpose", { defaultValue: "Zweck" })}
                    values={items.map((item) => getPurposeLabel(t, item.purpose))}
                  />
                  <CompareRow
                    label={t("fields.bedrooms", { defaultValue: "Schlafzimmer" })}
                    values={items.map((item) => item.bedrooms ?? item.rooms ?? "—")}
                  />
                  <CompareRow
                    label={t("fields.bathrooms", { defaultValue: "Badezimmer" })}
                    values={items.map((item) => item.bathrooms ?? "—")}
                  />
                  <CompareRow
                    label={t("fields.size", { defaultValue: "Fläche" })}
                    values={items.map((item) => (item.size ? `${item.size} m²` : "—"))}
                  />
                  <CompareRow
                    label={t("fields.yearBuilt", { defaultValue: "Baujahr" })}
                    values={items.map((item) => item.yearBuilt ?? "—")}
                  />
                  <CompareRow
                    label={t("fields.rooms", { defaultValue: "Zimmer" })}
                    values={items.map((item) => item.rooms ?? "—")}
                  />
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SMALL FOOT NOTE */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {t("footnote", {
            defaultValue:
              "Hinweis: Einige Werte hängen von der Datenqualität der einzelnen Inserate ab.",
          })}
        </div>
      </div>
    </div>
  );
};

function ActionButton({ children, icon, onClick, secondary = false, danger = false }) {
  let classes =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition";

  if (danger) {
    classes +=
      " border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-300 dark:hover:bg-rose-900/20";
  } else if (secondary) {
    classes +=
      " border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800";
  } else {
    classes += " bg-blue-600 text-white hover:bg-blue-700";
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {icon}
      {children}
    </button>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {children}
    </span>
  );
}

function CompareRow({ label, values }) {
  return (
    <tr className="border-t border-slate-200 dark:border-slate-800">
      <td className="sticky left-0 z-10 bg-white px-5 py-4 text-sm font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {label}
      </td>
      {values.map((value, index) => (
        <td
          key={`${label}-${index}`}
          className="px-5 py-4 text-sm text-slate-900 dark:text-slate-100"
        >
          {value}
        </td>
      ))}
    </tr>
  );
}

export default ComparePage;