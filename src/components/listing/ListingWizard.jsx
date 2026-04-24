import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import StepInfo from "./steps/StepInfo";
import StepLocation from "./steps/StepLocation";
import StepPhotos from "./steps/StepPhotos";
import StepReview from "./steps/StepReview";
import { submitListingWizard } from "./submitListingWizard";

const DRAFT_KEY = "mh24_listing_wizard_draft";
const FALLBACK_IMG = "/images/hero-1.jpg";

export default function ListingWizard() {
  const { t, i18n } = useTranslation("publish");

  const [data, setData] = useState({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (err) {
      console.error("[ListingWizard] Draft load error:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("[ListingWizard] Draft save error:", err);
    }
  }, [data]);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const resetWizard = () => {
    setData({});
    setStep(0);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);

      const result = await submitListingWizard(payload);

      alert(
        t("wizard.submitSuccessReal", {
          defaultValue: "Die Anzeige wurde erfolgreich veröffentlicht.",
        })
      );

      console.log("[ListingWizard] Listing erstellt:", result);
      resetWizard();
    } catch (err) {
      console.error("[ListingWizard] Submit error:", err);

      const message =
        err?.message === "NOT_AUTHENTICATED"
          ? t("wizard.submitAuthError", {
              defaultValue: "Bitte melden Sie sich zuerst an.",
            })
          : t("wizard.submitError", {
              defaultValue: "Fehler beim Veröffentlichen der Anzeige.",
            });

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    t("wizard.steps.info", { defaultValue: "Basisdaten" }),
    t("wizard.steps.location", { defaultValue: "Standort" }),
    t("wizard.steps.photos", { defaultValue: "Fotos" }),
    t("wizard.steps.review", { defaultValue: "Überprüfung" }),
  ];

  const totalSteps = steps.length;
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  const coverImage = useMemo(() => {
    const photos = data?.photos;
    if (!Array.isArray(photos) || photos.length === 0) return FALLBACK_IMG;

    const first = photos[0];
    if (typeof first === "string") return first || FALLBACK_IMG;
    if (first?.preview) return first.preview;
    return FALLBACK_IMG;
  }, [data]);

  const formattedPrice = useMemo(() => {
    const n = Number(data?.price);
    if (!Number.isFinite(n) || n <= 0) return "—";

    try {
      return new Intl.NumberFormat(
        i18n.language?.startsWith("en") ? "en-US" : "de-DE",
        {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }
      ).format(n);
    } catch {
      return `€ ${n}`;
    }
  }, [data?.price, i18n.language]);

  const photoCount = Array.isArray(data?.photos) ? data.photos.length : 0;

  const summaryRows = [
    {
      label: t("wizard.summary.purpose", { defaultValue: "Zweck" }),
      value:
        data?.purpose === "rent"
          ? t("stepReview.rent", { defaultValue: "Mieten" })
          : data?.purpose === "buy"
          ? t("stepReview.buy", { defaultValue: "Kaufen" })
          : "—",
    },
    {
      label: t("wizard.summary.type", { defaultValue: "Typ" }),
      value: data?.type || "—",
    },
    {
      label: t("wizard.summary.price", { defaultValue: "Preis" }),
      value: formattedPrice,
    },
    {
      label: t("wizard.summary.city", { defaultValue: "Stadt" }),
      value: data?.city || "—",
    },
    {
      label: t("wizard.summary.photos", { defaultValue: "Fotos" }),
      value: String(photoCount),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {t("wizard.title", {
                defaultValue: "Immobilie veröffentlichen",
              })}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t("wizard.subtitle", {
                defaultValue: "Erstellen Sie Schritt für Schritt Ihre Anzeige",
              })}
            </p>
          </div>

          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {t("wizard.progress", { defaultValue: "Fortschritt" })}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {progressPercent}%
              </span>
            </div>

            <div className="mb-6 h-2 rounded-full bg-gray-200 dark:bg-slate-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              {steps.map((label, index) => {
                const isActive = index === step;
                const isDone = index < step;

                return (
                  <div key={index} className="flex min-w-0 flex-1 items-center">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold
                      ${isActive ? "bg-blue-600 text-white" : ""}
                      ${isDone ? "bg-green-500 text-white" : ""}
                      ${
                        !isActive && !isDone
                          ? "bg-gray-300 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
                          : ""
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </div>

                    <div className="ml-2 truncate text-[11px] text-gray-600 dark:text-gray-300 md:text-sm">
                      {label}
                    </div>

                    {index !== steps.length - 1 && (
                      <div className="mx-2 h-[2px] flex-1 bg-gray-300 dark:bg-slate-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow dark:bg-gray-900 md:p-8">
            {step === 0 && (
              <StepInfo
                initial={data}
                onChange={(d) => setData((s) => ({ ...s, ...d }))}
                onNext={next}
              />
            )}

            {step === 1 && (
              <StepLocation
                initial={data}
                onChange={(d) => setData((s) => ({ ...s, ...d }))}
                onNext={next}
                onBack={back}
              />
            )}

            {step === 2 && (
              <StepPhotos
                initial={data}
                onChange={(d) => setData((s) => ({ ...s, ...d }))}
                onNext={next}
                onBack={back}
              />
            )}

            {step === 3 && (
              <StepReview
                initial={data}
                onBack={back}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            )}
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="relative">
                <img
                  src={coverImage}
                  alt={data?.title || "Listing preview"}
                  className="h-52 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />

                <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  {t("wizard.summary.previewBadge", {
                    defaultValue: "Live-Vorschau",
                  })}
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {t("wizard.summary.cardLabel", {
                    defaultValue: "Kurzübersicht",
                  })}
                </div>

                <h3 className="line-clamp-2 text-xl font-bold text-slate-900 dark:text-white">
                  {data?.title ||
                    t("wizard.summary.noTitle", {
                      defaultValue: "Noch kein Titel eingegeben",
                    })}
                </h3>

                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formattedPrice}
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {[data?.address, data?.postalCode, data?.city]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("wizard.summary.title", {
                  defaultValue: "Zusammenfassung",
                })}
              </h3>

              <div className="mt-4 space-y-3">
                {summaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-200">
              <div className="font-bold">
                {t("wizard.summary.tipTitle", {
                  defaultValue: "Tipps für bessere Inserate",
                })}
              </div>

              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  {t("wizard.summary.tip1", {
                    defaultValue: "Verwenden Sie einen klaren und präzisen Titel.",
                  })}
                </li>
                <li>
                  {t("wizard.summary.tip2", {
                    defaultValue: "Beschreiben Sie Lage, Zustand und Highlights der Immobilie.",
                  })}
                </li>
                <li>
                  {t("wizard.summary.tip3", {
                    defaultValue: "Laden Sie helle, scharfe Fotos in guter Qualität hoch.",
                  })}
                </li>
                <li>
                  {t("wizard.summary.tip4", {
                    defaultValue: "Prüfen Sie Preis, Fläche und Adresse sorgfältig vor dem Veröffentlichen.",
                  })}
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}