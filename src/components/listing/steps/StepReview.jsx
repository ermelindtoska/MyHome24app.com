import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const FALLBACK_IMG = "/images/hero-1.jpg";

function formatPrice(value, locale = "de-DE") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `€ ${n}`;
  }
}

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return FALLBACK_IMG;

  const first = photos[0];
  if (typeof first === "string") return first || FALLBACK_IMG;
  if (first?.preview) return first.preview;
  return FALLBACK_IMG;
}

function ReviewRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
        {value || "—"}
      </div>
    </div>
  );
}

export default function StepReview({
  initial,
  onBack,
  onSubmit,
  submitting = false,
}) {
  const { t, i18n } = useTranslation("publish");

  const data = initial || {};

  const coverImage = useMemo(() => firstPhoto(data.photos), [data.photos]);

  const formattedPrice = useMemo(() => {
    return formatPrice(
      data.price,
      i18n.language?.startsWith("en") ? "en-US" : "de-DE"
    );
  }, [data.price, i18n.language]);

  const photoCount = Array.isArray(data.photos) ? data.photos.length : 0;

  const canSubmit = useMemo(() => {
    return Boolean(
      data?.title &&
        data?.description &&
        data?.address &&
        data?.postalCode &&
        data?.city &&
        photoCount > 0
    );
  }, [data, photoCount]);

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit?.(data);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {t("stepReview.stepLabel", { defaultValue: "Schritt 4" })}
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {t("stepReview.titleMain", {
              defaultValue: "Anzeige überprüfen",
            })}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
            {t("stepReview.descriptionMain", {
              defaultValue:
                "Prüfen Sie jetzt alle Angaben Ihrer Immobilie. Vor der finalen Veröffentlichung sollten Titelbild, Preis, Standort und Beschreibung vollständig sein.",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="relative">
                <img
                  src={coverImage}
                  alt={data?.title || "Listing preview"}
                  className="h-[240px] w-full object-cover md:h-[320px]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    {data?.purpose === "rent"
                      ? t("stepReview.rentBadge", { defaultValue: "Miete" })
                      : t("stepReview.buyBadge", { defaultValue: "Kauf" })}
                  </span>

                  <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow dark:bg-slate-900/95 dark:text-white">
                    {data?.type ||
                      t("stepReview.noType", { defaultValue: "Typ offen" })}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                  {photoCount}{" "}
                  {t("stepReview.photosCount", {
                    defaultValue: "Fotos",
                  })}
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {t("stepReview.previewCardLabel", {
                    defaultValue: "Vorschau",
                  })}
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {data?.title ||
                    t("stepReview.noTitle", { defaultValue: "Kein Titel" })}
                </h3>

                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formattedPrice}
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {[data?.address, data?.postalCode, data?.city]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>

                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {data?.description ||
                    t("stepReview.noDescription", {
                      defaultValue: "Keine Beschreibung vorhanden.",
                    })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                {t("stepReview.keyFacts", { defaultValue: "Wichtige Angaben" })}
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ReviewRow
                  label={t("stepReview.purpose", { defaultValue: "Zweck" })}
                  value={
                    data?.purpose === "rent"
                      ? t("stepReview.rent", { defaultValue: "Mieten" })
                      : data?.purpose === "buy"
                      ? t("stepReview.buy", { defaultValue: "Kaufen" })
                      : "—"
                  }
                />
                <ReviewRow
                  label={t("stepReview.type", { defaultValue: "Typ" })}
                  value={data?.type}
                />
                <ReviewRow
                  label={t("stepReview.price", { defaultValue: "Preis" })}
                  value={formattedPrice}
                />
                <ReviewRow
                  label={t("stepReview.livingArea", { defaultValue: "Wohnfläche" })}
                  value={data?.livingArea ? `${data.livingArea} m²` : "—"}
                />
                <ReviewRow
                  label={t("stepReview.rooms", { defaultValue: "Zimmer" })}
                  value={data?.rooms}
                />
                <ReviewRow
                  label={t("stepReview.bedrooms", { defaultValue: "Schlafzimmer" })}
                  value={data?.bedrooms}
                />
                <ReviewRow
                  label={t("stepReview.bathrooms", { defaultValue: "Badezimmer" })}
                  value={data?.bathrooms}
                />
                <ReviewRow
                  label={t("stepReview.yearBuilt", { defaultValue: "Baujahr" })}
                  value={data?.yearBuilt}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("stepReview.locationTitle", {
                  defaultValue: "Standort",
                })}
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <ReviewRow
                  label={t("stepReview.address", { defaultValue: "Adresse" })}
                  value={data?.address}
                />
                <ReviewRow
                  label={t("stepReview.postalCode", { defaultValue: "PLZ" })}
                  value={data?.postalCode}
                />
                <ReviewRow
                  label={t("stepReview.city", { defaultValue: "Stadt" })}
                  value={data?.city}
                />
                <ReviewRow
                  label={t("stepReview.state", { defaultValue: "Bundesland" })}
                  value={data?.state}
                />
                <ReviewRow
                  label={t("stepReview.country", { defaultValue: "Land" })}
                  value={data?.country}
                />
                <ReviewRow
                  label={t("stepReview.latitude", { defaultValue: "Breitengrad" })}
                  value={data?.latitude}
                />
                <ReviewRow
                  label={t("stepReview.longitude", { defaultValue: "Längengrad" })}
                  value={data?.longitude}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-200">
              <div className="font-bold">
                {t("stepReview.publishChecklistTitle", {
                  defaultValue: "Check vor Veröffentlichung",
                })}
              </div>

              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  {t("stepReview.check1", {
                    defaultValue: "Ist ein passendes Titelbild ausgewählt?",
                  })}
                </li>
                <li>
                  {t("stepReview.check2", {
                    defaultValue: "Sind Preis und Flächenangaben korrekt?",
                  })}
                </li>
                <li>
                  {t("stepReview.check3", {
                    defaultValue: "Ist die Adresse vollständig angegeben?",
                  })}
                </li>
                <li>
                  {t("stepReview.check4", {
                    defaultValue:
                      "Ist die Beschreibung klar und professionell formuliert?",
                  })}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-w-[120px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          {t("stepReview.back", { defaultValue: "Zurück" })}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`inline-flex min-w-[160px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            canSubmit && !submitting
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-slate-500"
          }`}
        >
          {submitting
            ? t("stepReview.submitting", { defaultValue: "Wird gespeichert..." })
            : t("stepReview.submit", { defaultValue: "Anzeige veröffentlichen" })}
        </button>
      </div>
    </div>
  );
}