import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function StepLocation({
  initial,
  onChange,
  onNext,
  onBack,
}) {
  const { t } = useTranslation("publish");

  const [form, setForm] = useState(() => ({
    address: "",
    postalCode: "",
    city: "",
    state: "",
    country: "Deutschland",
    latitude: "",
    longitude: "",
    locationNote: "",
    ...(initial || {}),
  }));

  const required = ["address", "postalCode", "city", "country"];

  const isFilled = (key) => String(form[key] ?? "").trim() !== "";

  const filledCount = useMemo(() => {
    return required.filter((k) => isFilled(k)).length;
  }, [form]);

  const canNext = useMemo(() => {
    return required.every((k) => isFilled(k));
  }, [form]);

  const updateField = (name, value) => {
    const next = {
      ...form,
      [name]: value,
    };

    setForm(next);
    onChange?.(next);
  };

  const bind = (name) => ({
    name,
    value: form[name] ?? "",
    onChange: (e) => updateField(name, e.target.value),
  });

  const handleNext = () => {
    const payload = {
      ...form,
      latitude:
        String(form.latitude || "").trim() !== ""
          ? Number(form.latitude)
          : "",
      longitude:
        String(form.longitude || "").trim() !== ""
          ? Number(form.longitude)
          : "",
    };

    onChange?.(payload);
    onNext?.();
  };

  const inputBase =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/30";

  const labelBase =
    "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200";

  const sectionCard =
    "rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950";

  return (
    <div className="space-y-6">
      <div className={sectionCard}>
        <div className="mb-5">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {t("stepLocation.stepLabel", { defaultValue: "Schritt 2" })}
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {t("stepLocation.titleMain", {
              defaultValue: "Standort der Immobilie",
            })}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
            {t("stepLocation.descriptionMain", {
              defaultValue:
                "Geben Sie die genaue Lage der Immobilie an. Diese Informationen helfen Interessent:innen bei der Orientierung und verbessern die Auffindbarkeit.",
            })}
          </p>
        </div>

        <div className="mb-6">
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(filledCount / required.length) * 100}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            {filledCount}/{required.length}{" "}
            {t("stepLocation.progressFilled", {
              defaultValue: "ausgefüllt",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelBase}>
              {t("stepLocation.address", {
                defaultValue: "Straße & Hausnummer",
              })}
            </label>
            <input
              type="text"
              {...bind("address")}
              className={inputBase}
              placeholder={t("stepLocation.addressPlaceholder", {
                defaultValue: "Zum Beispiel: Berliner Straße 12",
              })}
            />
          </div>

          <div>
            <label className={labelBase}>
              {t("stepLocation.postalCode", {
                defaultValue: "PLZ",
              })}
            </label>
            <input
              type="text"
              inputMode="numeric"
              {...bind("postalCode")}
              className={inputBase}
              placeholder={t("stepLocation.postalCodePlaceholder", {
                defaultValue: "Zum Beispiel: 10115",
              })}
            />
          </div>

          <div>
            <label className={labelBase}>
              {t("stepLocation.city", {
                defaultValue: "Stadt",
              })}
            </label>
            <input
              type="text"
              {...bind("city")}
              className={inputBase}
              placeholder={t("stepLocation.cityPlaceholder", {
                defaultValue: "Zum Beispiel: Berlin",
              })}
            />
          </div>

          <div>
            <label className={labelBase}>
              {t("stepLocation.state", {
                defaultValue: "Bundesland",
              })}
            </label>
            <input
              type="text"
              {...bind("state")}
              className={inputBase}
              placeholder={t("stepLocation.statePlaceholder", {
                defaultValue: "Zum Beispiel: Berlin",
              })}
            />
          </div>

          <div>
            <label className={labelBase}>
              {t("stepLocation.country", {
                defaultValue: "Land",
              })}
            </label>
            <input
              type="text"
              {...bind("country")}
              className={inputBase}
              placeholder={t("stepLocation.countryPlaceholder", {
                defaultValue: "Deutschland",
              })}
            />
          </div>

          <div>
            <label className={labelBase}>
              {t("stepLocation.latitude", {
                defaultValue: "Breitengrad (optional)",
              })}
            </label>
            <input
              type="text"
              inputMode="decimal"
              {...bind("latitude")}
              className={inputBase}
              placeholder={t("stepLocation.latitudePlaceholder", {
                defaultValue: "Zum Beispiel: 52.5200",
              })}
            />
          </div>

          <div>
            <label className={labelBase}>
              {t("stepLocation.longitude", {
                defaultValue: "Längengrad (optional)",
              })}
            </label>
            <input
              type="text"
              inputMode="decimal"
              {...bind("longitude")}
              className={inputBase}
              placeholder={t("stepLocation.longitudePlaceholder", {
                defaultValue: "Zum Beispiel: 13.4050",
              })}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>
              {t("stepLocation.locationNote", {
                defaultValue: "Hinweis zur Lage",
              })}
            </label>
            <textarea
              rows={5}
              {...bind("locationNote")}
              className={`${inputBase} min-h-[120px] resize-y`}
              placeholder={t("stepLocation.locationNotePlaceholder", {
                defaultValue:
                  "Zum Beispiel: Ruhige Wohnlage, gute Anbindung an ÖPNV, Schulen und Einkaufsmöglichkeiten in der Nähe.",
              })}
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-200">
          {t("stepLocation.filledFields", {
            defaultValue: "Pflichtfelder ausgefüllt",
          })}{" "}
          <span className="font-bold">
            {filledCount}/{required.length}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-w-[120px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          {t("stepLocation.back", { defaultValue: "Zurück" })}
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={handleNext}
          className={`inline-flex min-w-[130px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            canNext
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-slate-500"
          }`}
        >
          {t("stepLocation.next", { defaultValue: "Weiter" })}
        </button>
      </div>
    </div>
  );
}