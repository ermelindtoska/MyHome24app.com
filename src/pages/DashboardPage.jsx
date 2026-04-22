// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaCheckCircle } from "react-icons/fa";
import { MdImage, MdInfoOutline, MdClose } from "react-icons/md";
import { toast } from "sonner";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_MB = 8;

function formatEUR(value, lang) {
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return value;
  try {
    return new Intl.NumberFormat(lang || "de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n} €`;
  }
}

export default function DashboardPage({ onAdd }) {
  const { t, i18n } = useTranslation(["userDashboard", "listing", "filterBar"]);
  const lang = i18n.language?.slice(0, 2) || "de";

  const [form, setForm] = useState({
    title: "",
    city: "",
    price: "",
    type: "apartment",
    purpose: "rent",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create / cleanup preview URL
  useEffect(() => {
    if (!form.image) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(form.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const typeOptions = useMemo(
    () => [
      { value: "apartment", label: t("listing:type.apartment", { defaultValue: "Apartment" }) },
      { value: "house", label: t("listing:type.house", { defaultValue: "Haus" }) },
    ],
    [t]
  );

  const purposeOptions = useMemo(
    () => [
      { value: "rent", label: t("filterBar:purpose.rent", { defaultValue: "Mieten" }) },
      { value: "buy", label: t("filterBar:purpose.buy", { defaultValue: "Kaufen" }) },
    ],
    [t]
  );

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const validate = () => {
    if (!form.title.trim()) return t("userDashboard:form.errors.titleRequired");
    if (!form.city.trim()) return t("userDashboard:form.errors.cityRequired");
    if (!String(form.price).trim()) return t("userDashboard:form.errors.priceRequired");
    if (!form.image) return t("userDashboard:form.errors.imageRequired");

    const priceNum = Number(String(form.price).replace(",", "."));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return t("userDashboard:form.errors.priceInvalid");
    }

    if (form.image) {
      if (!ACCEPTED_IMAGE_TYPES.includes(form.image.type)) {
        return t("userDashboard:form.errors.imageType", {
          defaultValue: "Bitte JPG, PNG oder WEBP hochladen.",
        });
      }
      const mb = form.image.size / (1024 * 1024);
      if (mb > MAX_IMAGE_MB) {
        return t("userDashboard:form.errors.imageTooLarge", {
          max: MAX_IMAGE_MB,
          defaultValue: `Bild ist zu groß (max. ${MAX_IMAGE_MB} MB).`,
        });
      }
    }

    return "";
  };

  const resetForm = () => {
    setForm({
      title: "",
      city: "",
      price: "",
      type: "apartment",
      purpose: "rent",
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errMsg = validate();
    if (errMsg) {
      toast.error(t("userDashboard:form.toast.errorTitle", { defaultValue: "Bitte prüfen" }), {
        description: errMsg,
      });
      return;
    }

    try {
      setSubmitting(true);

      // Optional: normalize price to number
      const normalized = {
        ...form,
        title: form.title.trim(),
        city: form.city.trim(),
        price: Number(String(form.price).replace(",", ".")),
      };

      await Promise.resolve(onAdd?.(normalized));

      toast.success(t("userDashboard:form.toast.successTitle", { defaultValue: "Gespeichert" }), {
        description: t("userDashboard:form.toast.successText", {
          defaultValue: "Dein Eintrag wurde hinzugefügt.",
        }),
      });

      resetForm();
    } catch (err) {
      console.error("[DashboardPage] onAdd error:", err);
      toast.error(t("userDashboard:form.toast.errorTitle", { defaultValue: "Fehler" }), {
        description: t("userDashboard:form.toast.errorText", {
          defaultValue: "Konnte nicht gespeichert werden. Bitte erneut versuchen.",
        }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => setField("image", null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">
                {t("userDashboard:dashboardTitle", { defaultValue: "Neues Listing hinzufügen" })}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t("userDashboard:form.subtitle", {
                  defaultValue:
                    "Fülle die wichtigsten Angaben aus. Du kannst später weitere Details ergänzen.",
                })}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-200 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-300">
              <MdInfoOutline className="text-base" />
              <span>
                {t("userDashboard:form.hintTop", {
                  defaultValue: "Tipp: Verwende eine klare, kurze Überschrift.",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("userDashboard:form.titleLabel", { defaultValue: "Titel" })}
              </label>
              <input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={t("userDashboard:form.titlePlaceholder", {
                  defaultValue: "z. B. Helle 2-Zimmer-Wohnung mit Balkon",
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("userDashboard:form.cityLabel", { defaultValue: "Stadt" })}
              </label>
              <input
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder={t("userDashboard:form.cityPlaceholder", {
                  defaultValue: "z. B. Berlin",
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("userDashboard:form.priceLabel", { defaultValue: "Preis" })}
              </label>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder={t("userDashboard:form.pricePlaceholder", {
                  defaultValue: "z. B. 1200",
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50"
              />
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("userDashboard:form.priceHelper", { defaultValue: "Vorschau:" })}{" "}
                <span className="font-semibold">
                  {formatEUR(form.price, lang)}
                </span>
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("userDashboard:form.typeLabel", { defaultValue: "Objekttyp" })}
              </label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose (pill buttons) */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t("userDashboard:form.purposeLabel", { defaultValue: "Zweck" })}
            </div>

            <div className="flex flex-wrap gap-2">
              {purposeOptions.map((opt) => {
                const active = form.purpose === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setField("purpose", opt.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border transition
                      ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 dark:bg-slate-950/40 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-950/70"
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t("userDashboard:form.imageLabel", { defaultValue: "Titelbild" })}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center dark:bg-slate-950/60 dark:border-slate-800">
                    <MdImage className="text-xl" />
                  </span>
                  <div>
                    <div className="font-semibold">
                      {t("userDashboard:form.imageHintTitle", {
                        defaultValue: "Bild hochladen",
                      })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t("userDashboard:form.imageHintText", {
                        defaultValue: "JPG/PNG/WEBP, max. 8 MB",
                      })}
                    </div>
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                  {t("userDashboard:form.imageButton", { defaultValue: "Datei wählen" })}
                  <input
                    type="file"
                    name="image"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => setField("image", e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {previewUrl && (
                <div className="mt-4 relative">
                  <img
                    src={previewUrl}
                    alt={t("userDashboard:form.imagePreviewAlt", { defaultValue: "Vorschau" })}
                    className="h-56 w-full rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70"
                  >
                    <MdClose className="mr-1" />
                    {t("userDashboard:form.removeImage", { defaultValue: "Entfernen" })}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              <FaPlus className="mr-2" />
              {submitting
                ? t("userDashboard:form.submitting", { defaultValue: "Speichere…" })
                : t("userDashboard:form.submit", { defaultValue: "Listing hinzufügen" })}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FaCheckCircle className="text-emerald-500" />
              {t("userDashboard:form.footerHint", {
                defaultValue: "Du kannst später weitere Details im Dashboard ergänzen.",
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}