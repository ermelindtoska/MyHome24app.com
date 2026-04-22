// src/publish/PublishProperty.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  GeoPoint,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { toast } from "sonner";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiMapPin,
  FiImage,
  FiEye,
  FiUpload,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";

const STEP = {
  INFO: 0,
  LOCATION: 1,
  PHOTOS: 2,
  REVIEW: 3,
};

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 8;

const initialState = {
  purpose: "buy",
  type: "apartment",
  title: "",
  description: "",
  price: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  yearBuilt: "",
  amenities: {
    balcony: false,
    parking: false,
    garden: false,
    elevator: false,
  },

  address: "",
  zipCode: "",
  city: "",
  lat: null,
  lng: null,

  images: [],
  imagePreviews: [],
};

export default function PublishProperty() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useTranslation("newListing");

  const [step, setStep] = useState(STEP.INFO);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [form, setForm] = useState(initialState);

  const setField = (name, value) =>
    setForm((s) => ({
      ...s,
      [name]: value,
    }));

  const setAmenity = (name) =>
    setForm((s) => ({
      ...s,
      amenities: {
        ...s.amenities,
        [name]: !s.amenities[name],
      },
    }));

  const canContinueInfo = useMemo(() => {
    return (
      form.title.trim().length >= 6 &&
      form.description.trim().length >= 20 &&
      Number(form.price) > 0 &&
      form.type &&
      form.purpose
    );
  }, [form]);

  const canContinueLocation = useMemo(() => {
    return (
      form.address.trim().length >= 3 &&
      form.city.trim().length >= 2 &&
      form.zipCode.trim().length >= 3
    );
  }, [form]);

  const progressPercent = useMemo(() => {
    return ((step + 1) / 4) * 100;
  }, [step]);

  const formattedPrice = useMemo(() => {
    const value = Number(form.price);
    if (!value) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }, [form.price]);

  const geocodeOnce = async () => {
    const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

    if (!MAPBOX_TOKEN) {
      toast.warning(
        t("toast.noMapboxToken", {
          defaultValue: "Kein Mapbox-Token für Geocoding konfiguriert.",
        })
      );
      return null;
    }

    try {
      setGeocoding(true);

      const q = `${form.address}, ${form.zipCode} ${form.city}, Deutschland`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        q
      )}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=DE`;

      const resp = await fetch(url);

      if (!resp.ok) {
        toast.warning(
          t("toast.geocodeServer", {
            defaultValue:
              "Adresse konnte nicht automatisch verortet werden (Server-Antwort).",
          })
        );
        return null;
      }

      const data = await resp.json();

      if (
        data &&
        Array.isArray(data.features) &&
        data.features.length > 0 &&
        Array.isArray(data.features[0].center)
      ) {
        const [lng, lat] = data.features[0].center;

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setForm((s) => ({ ...s, lat, lng }));
          toast.success(
            t("toast.geocodeSuccess", {
              defaultValue: "Adresse erfolgreich verortet.",
            })
          );
          return { lat, lng };
        }
      }

      toast.warning(
        t("toast.geocodeNoResult", {
          defaultValue:
            "Adresse konnte nicht automatisch verortet werden (kein Ergebnis).",
        })
      );
      return null;
    } catch (err) {
      console.error("[Geocode] Mapbox Fehler:", err);
      toast.warning(
        t("toast.geocodeNetwork", {
          defaultValue:
            "Adresse konnte nicht automatisch verortet werden (Netzwerkfehler).",
        })
      );
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  const handleImages = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const currentCount = form.images.length;
    const remaining = MAX_IMAGES - currentCount;

    if (remaining <= 0) {
      toast.error(
        t("toast.maxImages", {
          count: MAX_IMAGES,
          defaultValue: `Maximal ${MAX_IMAGES} Bilder erlaubt.`,
        })
      );
      return;
    }

    const validFiles = [];
    const previews = [];

    for (const file of list.slice(0, remaining)) {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

      if (!isImage) {
        toast.error(
          t("toast.invalidImageType", {
            defaultValue: "Nur Bilddateien sind erlaubt.",
          })
        );
        continue;
      }

      if (!isValidSize) {
        toast.error(
          t("toast.imageTooLarge", {
            max: MAX_FILE_SIZE_MB,
            defaultValue: `Ein Bild ist größer als ${MAX_FILE_SIZE_MB} MB.`,
          })
        );
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (!validFiles.length) return;

    setForm((s) => ({
      ...s,
      images: [...s.images, ...validFiles],
      imagePreviews: [...s.imagePreviews, ...previews],
    }));
  };

  const removeImage = (idx) => {
    setForm((s) => {
      const imgs = [...s.images];
      const prevs = [...s.imagePreviews];

      if (prevs[idx]) URL.revokeObjectURL(prevs[idx]);

      imgs.splice(idx, 1);
      prevs.splice(idx, 1);

      return {
        ...s,
        images: imgs,
        imagePreviews: prevs,
      };
    });
  };

  const uploadPhotos = async (listingId) => {
    if (!form.images.length) return [];

    if (!currentUser?.uid) {
      toast.error(
        t("toast.mustBeLoggedInPhotos", {
          defaultValue: "Du musst angemeldet sein, um Fotos hochzuladen.",
        })
      );
      return [];
    }

    const urls = [];

    for (const file of form.images) {
      try {
        const path = `listingPhotos/${currentUser.uid}/${listingId}/${Date.now()}-${file.name}`;
        const r = storageRef(storage, path);
        await uploadBytes(r, file);
        const url = await getDownloadURL(r);
        urls.push(url);
      } catch (err) {
        console.error("[Upload] Fehler beim Bild-Upload:", err);
        toast.error(
          t("toast.photoUploadFailed", {
            defaultValue: "Ein Foto konnte nicht hochgeladen werden.",
          })
        );
      }
    }

    return urls;
  };

  const handlePublish = async () => {
    if (!currentUser?.uid) {
      toast.error(
        t("toast.mustBeLoggedIn", {
          defaultValue: "Du musst angemeldet sein.",
        })
      );
      return;
    }

    if (!canContinueInfo || !canContinueLocation) {
      toast.error(
        t("toast.fillRequired", {
          defaultValue: "Bitte fülle alle Pflichtfelder aus.",
        })
      );
      return;
    }

    setSaving(true);

    try {
      let coords = null;

      if (!(Number.isFinite(form.lat) && Number.isFinite(form.lng))) {
        coords = await geocodeOnce();
      }

      const lat =
        coords?.lat ??
        (form.lat != null && form.lat !== "" ? Number(form.lat) : null);

      const lng =
        coords?.lng ??
        (form.lng != null && form.lng !== "" ? Number(form.lng) : null);

      const payload = {
        userId: currentUser.uid,
        ownerId: currentUser.uid,
        purpose: (form.purpose || "").toLowerCase().trim(),
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        rooms: Number(form.rooms) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        size: Number(form.size) || 0,
        yearBuilt: Number(form.yearBuilt) || null,
        amenities: form.amenities,
        address: form.address.trim(),
        city: form.city.trim(),
        zipCode: form.zipCode.trim(),
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        geopt: lat !== null && lng !== null ? new GeoPoint(lat, lng) : null,
        searchIndex: [
          form.city?.toLowerCase() || "",
          form.zipCode || "",
          form.address?.toLowerCase() || "",
          form.type || "",
          (form.purpose || "").toLowerCase() || "",
        ].filter(Boolean),
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        images: [],
        imageUrls: [],
      };

      const docRef = await addDoc(collection(db, "listings"), payload);

      const urls = await uploadPhotos(docRef.id);

      if (urls.length) {
        await setDoc(
          doc(db, "listings", docRef.id),
          {
            images: urls,
            imageUrls: urls,
            imageUrl: urls[0],
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      toast.success(
        t("toast.publishSuccess", {
          defaultValue: "Immobilie erfolgreich veröffentlicht!",
        })
      );

      navigate(`/listing/${docRef.id}`, { replace: true });
    } catch (e) {
      console.error("[PublishProperty] Fehler beim Speichern:", e);
      toast.error(
        t("toast.publishError", {
          defaultValue: "Speichern fehlgeschlagen.",
        }) + ` ${e?.message || ""}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-3">
              {t("pageTitle", { defaultValue: "Immobilie veröffentlichen" })}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("loginRequired", {
                defaultValue:
                  "Bitte melde dich zuerst an, um Inserate zu erstellen.",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#dbe7e5] dark:border-gray-800 bg-gradient-to-r from-[#eef7f5] via-[#f4fbfb] to-[#eef7f5] dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 shadow-sm p-6 md:p-8">
              <div className="inline-flex items-center rounded-full border border-[#cfe1de] dark:border-slate-700 bg-white/85 dark:bg-slate-800/80 px-3 py-1 text-xs font-semibold text-[#1d4f91] dark:text-blue-300 mb-4">
                {t("badge", { defaultValue: "Neues Inserat" })}
              </div>

              <h1 className="text-3xl md:text-[34px] leading-tight font-bold tracking-tight text-[#111827] dark:text-white">
                {t("pageTitle", { defaultValue: "Immobilie veröffentlichen" })}
              </h1>

              <p className="mt-3 max-w-2xl text-sm md:text-[15px] leading-6 text-[#4b5563] dark:text-gray-300">
                {t("pageDescription", {
                  defaultValue:
                    "Fülle die wichtigsten Informationen aus, lade Fotos hoch und veröffentliche dein Inserat professionell auf MyHome24App.",
                })}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#4b5563] dark:text-gray-400">
                  <span>{t("progress", { defaultValue: "Fortschritt" })}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-[#deebe8] dark:border-slate-700">
                  <div
                    className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <Stepper step={step} t={t} />

            <div className="rounded-[28px] border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_10px_30px_rgba(17,24,39,0.04)] dark:shadow-none p-6 md:p-7">
              {step === STEP.INFO && (
                <InfoStep
                  form={form}
                  setField={setField}
                  setAmenity={setAmenity}
                  t={t}
                  formattedPrice={formattedPrice}
                />
              )}

              {step === STEP.LOCATION && (
                <LocationStep
                  form={form}
                  setField={setField}
                  geocode={geocodeOnce}
                  t={t}
                  geocoding={geocoding}
                />
              )}

              {step === STEP.PHOTOS && (
                <PhotosStep
                  form={form}
                  handleImages={handleImages}
                  removeImage={removeImage}
                  t={t}
                />
              )}

              {step === STEP.REVIEW && <ReviewStep form={form} t={t} />}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(STEP.INFO, s - 1))}
                className="inline-flex items-center gap-2 rounded-full border border-[#d1d5db] dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 text-sm font-semibold text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                disabled={step === STEP.INFO || saving}
              >
                <FiChevronLeft />
                {t("back", { defaultValue: "Zurück" })}
              </button>

              {step < STEP.REVIEW ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                  disabled={
                    saving ||
                    (step === STEP.INFO && !canContinueInfo) ||
                    (step === STEP.LOCATION && !canContinueLocation)
                  }
                >
                  {t("next", { defaultValue: "Weiter" })}
                  <FiChevronRight />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                >
                  <FiCheckCircle />
                  {saving
                    ? t("publishing", { defaultValue: "Wird veröffentlicht…" })
                    : t("publishNow", {
                        defaultValue: "Jetzt veröffentlichen",
                      })}
                </button>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_10px_30px_rgba(17,24,39,0.04)] dark:shadow-none overflow-hidden">
              <div className="border-b border-[#eef0f2] dark:border-gray-800 px-5 py-4">
                <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                  {t("summary.title", { defaultValue: "Kurzüberblick" })}
                </h2>
              </div>

              <div className="px-5 py-3">
                <SummaryRow
                  label={t("summary.purpose", { defaultValue: "Zweck" })}
                  value={t(`purposeOptions.${form.purpose}`, {
                    defaultValue: form.purpose,
                  })}
                />
                <SummaryRow
                  label={t("summary.type", { defaultValue: "Typ" })}
                  value={t(`typeOptions.${form.type}`, {
                    defaultValue: form.type,
                  })}
                />
                <SummaryRow
                  label={t("summary.price", { defaultValue: "Preis" })}
                  value={formattedPrice}
                />
                <SummaryRow
                  label={t("summary.city", { defaultValue: "Stadt" })}
                  value={form.city || "—"}
                />
                <SummaryRow
                  label={t("summary.photos", { defaultValue: "Fotos" })}
                  value={`${form.images.length}/${MAX_IMAGES}`}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_10px_30px_rgba(17,24,39,0.04)] dark:shadow-none p-5">
              <h2 className="text-lg font-bold text-[#111827] dark:text-white mb-4">
                {t("tips.title", { defaultValue: "Tipps für bessere Inserate" })}
              </h2>

              <div className="space-y-3">
                {[
                  t("tips.tip1", {
                    defaultValue: "Verwende einen klaren und präzisen Titel.",
                  }),
                  t("tips.tip2", {
                    defaultValue:
                      "Beschreibe Lage, Zustand und Highlights der Immobilie.",
                  }),
                  t("tips.tip3", {
                    defaultValue:
                      "Lade helle, scharfe Fotos in guter Qualität hoch.",
                  }),
                  t("tips.tip4", {
                    defaultValue:
                      "Prüfe Preis, Fläche und Adresse sorgfältig vor dem Veröffentlichen.",
                  }),
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f1ff] dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-300">
                      <FiCheck size={12} />
                    </div>
                    <p className="text-sm leading-6 text-[#4b5563] dark:text-gray-300">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eef0f2] dark:border-gray-800 py-3 last:border-b-0">
      <span className="text-sm text-[#6b7280] dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-[#111827] dark:text-white text-right">
        {value || "—"}
      </span>
    </div>
  );
}

function Stepper({ step, t }) {
  const items = [
    {
      key: "info",
      label: t("steps.info", { defaultValue: "Infos" }),
      icon: <FiHome />,
    },
    {
      key: "location",
      label: t("steps.location", { defaultValue: "Standort" }),
      icon: <FiMapPin />,
    },
    {
      key: "photos",
      label: t("steps.photos", { defaultValue: "Fotos" }),
      icon: <FiImage />,
    },
    {
      key: "review",
      label: t("steps.review", { defaultValue: "Prüfen" }),
      icon: <FiEye />,
    },
  ];

  return (
    <div className="rounded-[28px] border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_10px_30px_rgba(17,24,39,0.04)] dark:shadow-none p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const active = step === idx;
          const done = step > idx;

          return (
            <div
              key={item.key}
              className={`rounded-2xl border px-4 py-4 transition ${
                active
                  ? "border-[#93c5fd] bg-[#eff6ff] dark:bg-blue-950/30 dark:border-blue-700"
                  : done
                  ? "border-[#bbf7d0] bg-[#f0fdf4] dark:bg-emerald-950/20 dark:border-emerald-700"
                  : "border-[#e5e7eb] bg-[#fafafa] dark:border-gray-800 dark:bg-slate-950"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm ${
                    active
                      ? "bg-[#2563eb] text-white"
                      : done
                      ? "bg-[#16a34a] text-white"
                      : "bg-[#e5e7eb] dark:bg-gray-800 text-[#6b7280] dark:text-gray-300"
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#6b7280] dark:text-gray-400">
                    {t("step", { defaultValue: "Schritt" })} {idx + 1}
                  </div>
                  <div className="text-sm font-semibold text-[#111827] dark:text-white">
                    {item.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoStep({ form, setField, setAmenity, t, formattedPrice }) {
  const amenities = [
    ["balcony", t("amenities.balcony", { defaultValue: "Balkon" })],
    ["parking", t("amenities.parking", { defaultValue: "Parkplatz" })],
    ["garden", t("amenities.garden", { defaultValue: "Garten" })],
    ["elevator", t("amenities.elevator", { defaultValue: "Aufzug" })],
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
          {t("form.infoTitle", { defaultValue: "Grundinformationen" })}
        </h2>
        <p className="mt-1 text-sm text-[#6b7280] dark:text-gray-300">
          {t("form.infoSubtitle", {
            defaultValue:
              "Fülle die wichtigsten Angaben aus. Du kannst später weitere Details ergänzen.",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field>
          <Label>{t("form.purposeLabel", { defaultValue: "Zweck" })}</Label>
          <select
            value={form.purpose}
            onChange={(e) => setField("purpose", e.target.value)}
            className={fieldClass}
          >
            <option value="buy">
              {t("purposeOptions.buy", { defaultValue: "Kaufen" })}
            </option>
            <option value="rent">
              {t("purposeOptions.rent", { defaultValue: "Mieten" })}
            </option>
          </select>
        </Field>

        <Field>
          <Label>{t("form.typeLabel", { defaultValue: "Typ" })}</Label>
          <select
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
            className={fieldClass}
          >
            <option value="apartment">
              {t("typeOptions.apartment", { defaultValue: "Wohnung" })}
            </option>
            <option value="house">
              {t("typeOptions.house", { defaultValue: "Haus" })}
            </option>
            <option value="commercial">
              {t("typeOptions.commercial", { defaultValue: "Büro / Gewerbe" })}
            </option>
          </select>
        </Field>

        <Field className="md:col-span-2">
          <Label>{t("form.titleLabel", { defaultValue: "Titel" })}</Label>
          <input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className={fieldClass}
            placeholder={t("form.titlePlaceholder", {
              defaultValue: "Helle 3-Zimmer-Wohnung im Zentrum",
            })}
          />
        </Field>

        <Field className="md:col-span-2">
          <Label>
            {t("form.descriptionLabel", { defaultValue: "Beschreibung" })}
          </Label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={5}
            className={fieldClass}
            placeholder={t("form.descriptionPlaceholder", {
              defaultValue: "Beschreibe die Immobilie ausführlich…",
            })}
          />
        </Field>

        <Field>
          <Label>
            {form.purpose === "rent"
              ? t("form.rentPriceLabel", { defaultValue: "Miete (€/Monat)" })
              : t("form.priceLabel", { defaultValue: "Preis (€)" })}
          </Label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            className={fieldClass}
          />
          <p className="mt-2 text-xs text-[#6b7280] dark:text-gray-400">
            {t("form.pricePreview", { defaultValue: "Vorschau" })}:{" "}
            <span className="font-semibold text-[#111827] dark:text-white">
              {formattedPrice}
            </span>
          </p>
        </Field>

        <Field>
          <Label>{t("form.sizeLabel", { defaultValue: "Wohnfläche (m²)" })}</Label>
          <input
            type="number"
            min="0"
            value={form.size}
            onChange={(e) => setField("size", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field>
          <Label>{t("form.roomsLabel", { defaultValue: "Zimmer" })}</Label>
          <input
            type="number"
            min="0"
            value={form.rooms}
            onChange={(e) => setField("rooms", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field>
          <Label>{t("form.bedroomsLabel", { defaultValue: "Schlafzimmer" })}</Label>
          <input
            type="number"
            min="0"
            value={form.bedrooms}
            onChange={(e) => setField("bedrooms", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field>
          <Label>{t("form.bathroomsLabel", { defaultValue: "Badezimmer" })}</Label>
          <input
            type="number"
            min="0"
            value={form.bathrooms}
            onChange={(e) => setField("bathrooms", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field>
          <Label>{t("form.yearBuiltLabel", { defaultValue: "Baujahr" })}</Label>
          <input
            type="number"
            min="1800"
            value={form.yearBuilt}
            onChange={(e) => setField("yearBuilt", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field className="md:col-span-2">
          <Label>{t("form.amenitiesLabel", { defaultValue: "Ausstattung" })}</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenities.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAmenity(key)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  form.amenities[key]
                    ? "border-[#93c5fd] bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700"
                    : "border-[#e5e7eb] bg-white text-[#374151] hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-950 dark:text-gray-200 dark:hover:bg-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function LocationStep({ form, setField, geocode, t, geocoding }) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
          {t("location.title", { defaultValue: "Standort" })}
        </h2>
        <p className="mt-1 text-sm text-[#6b7280] dark:text-gray-300">
          {t("location.subtitle", {
            defaultValue:
              "Gib die Adresse deiner Immobilie an und verorte sie auf der Karte.",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field className="md:col-span-2">
          <Label>{t("location.addressLabel", { defaultValue: "Adresse" })}</Label>
          <input
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            className={fieldClass}
            placeholder={t("location.addressPlaceholder", {
              defaultValue: "Straße und Hausnummer",
            })}
          />
        </Field>

        <Field>
          <Label>{t("location.zipLabel", { defaultValue: "PLZ" })}</Label>
          <input
            value={form.zipCode}
            onChange={(e) => setField("zipCode", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field>
          <Label>{t("location.cityLabel", { defaultValue: "Stadt" })}</Label>
          <input
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="md:col-span-2 rounded-3xl border border-[#e5e7eb] dark:border-gray-800 bg-[#fafafa] dark:bg-slate-950 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#111827] dark:text-white mb-1">
                {t("location.geocodeTitle", {
                  defaultValue: "Adresse automatisch verorten",
                })}
              </h3>
              <p className="text-sm text-[#6b7280] dark:text-gray-300">
                {Number.isFinite(form.lat) && Number.isFinite(form.lng)
                  ? `${t("location.coordsFound", {
                      defaultValue: "Koordinaten gefunden",
                    })}: ${Number(form.lat).toFixed(6)}, ${Number(form.lng).toFixed(6)}`
                  : t("location.coordsEmpty", {
                      defaultValue: "Noch keine Koordinaten vorhanden.",
                    })}
              </p>
            </div>

            <button
              type="button"
              onClick={geocode}
              disabled={geocoding}
              className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              {geocoding
                ? t("location.geocoding", { defaultValue: "Wird verortet…" })
                : t("location.geocodeButton", {
                    defaultValue: "Adresse verorten",
                  })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotosStep({ form, handleImages, removeImage, t }) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
          {t("photos.title", { defaultValue: "Fotos hochladen" })}
        </h2>
        <p className="mt-1 text-sm text-[#6b7280] dark:text-gray-300">
          {t("photos.subtitle", {
            defaultValue:
              "Gute Bilder erhöhen die Sichtbarkeit und verbessern den ersten Eindruck.",
          })}
        </p>
      </div>

      <div className="rounded-[28px] border-2 border-dashed border-[#cfd8e3] dark:border-gray-700 bg-[#fafafa] dark:bg-slate-950 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f1ff] dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-300">
          <FiUpload size={24} />
        </div>

        <h3 className="font-bold text-[#111827] dark:text-white mb-2">
          {t("photos.uploadTitle", { defaultValue: "Bilder auswählen" })}
        </h3>

        <p className="text-sm text-[#6b7280] dark:text-gray-300 mb-5">
          {t("photos.uploadHint", {
            defaultValue: "JPG, PNG, WEBP · maximal 10 Bilder · max. 8 MB pro Datei",
          })}
        </p>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
          {t("photos.selectFiles", { defaultValue: "Dateien auswählen" })}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImages(e.target.files)}
          />
        </label>
      </div>

      {form.imagePreviews.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-[#111827] dark:text-white">
              {t("photos.previewTitle", { defaultValue: "Vorschau" })}
            </h3>
            <span className="text-sm text-[#6b7280] dark:text-gray-400">
              {form.imagePreviews.length}/{MAX_IMAGES}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {form.imagePreviews.map((src, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-3xl border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-900 group shadow-sm"
              >
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-full h-44 object-cover"
                />

                {idx === 0 && (
                  <div className="absolute left-3 top-3 rounded-full bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white">
                    {t("photos.coverImage", { defaultValue: "Titelbild" })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ form, t }) {
  const selectedAmenities = Object.entries(form.amenities)
    .filter(([, value]) => value)
    .map(([key]) =>
      t(`amenities.${key}`, {
        defaultValue: key,
      })
    );

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
          {t("review.title", { defaultValue: "Alles prüfen" })}
        </h2>
        <p className="mt-1 text-sm text-[#6b7280] dark:text-gray-300">
          {t("review.subtitle", {
            defaultValue:
              "Kontrolliere alle Angaben, bevor du dein Inserat veröffentlichst.",
          })}
        </p>
      </div>

      <div className="rounded-[28px] border border-[#e5e7eb] dark:border-gray-800 bg-[#fafafa] dark:bg-slate-950 p-5 md:p-6">
        <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-3">
          {form.title || "—"}
        </h3>

        <p className="text-sm leading-6 text-[#4b5563] dark:text-gray-300 whitespace-pre-line mb-5">
          {form.description || "—"}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReviewItem
            label={t("review.purpose", { defaultValue: "Zweck" })}
            value={t(`purposeOptions.${form.purpose}`, {
              defaultValue: form.purpose,
            })}
          />
          <ReviewItem
            label={t("review.type", { defaultValue: "Typ" })}
            value={t(`typeOptions.${form.type}`, {
              defaultValue: form.type,
            })}
          />
          <ReviewItem
            label={t("review.price", { defaultValue: "Preis" })}
            value={`${form.price || "—"} €`}
          />
          <ReviewItem
            label={t("review.size", { defaultValue: "Fläche" })}
            value={`${form.size || "—"} m²`}
          />
          <ReviewItem
            label={t("review.rooms", { defaultValue: "Zimmer" })}
            value={form.rooms || "—"}
          />
          <ReviewItem
            label={t("review.bedrooms", { defaultValue: "Schlafzimmer" })}
            value={form.bedrooms || "—"}
          />
          <ReviewItem
            label={t("review.bathrooms", { defaultValue: "Badezimmer" })}
            value={form.bathrooms || "—"}
          />
          <ReviewItem
            label={t("review.yearBuilt", { defaultValue: "Baujahr" })}
            value={form.yearBuilt || "—"}
          />
        </div>

        <div className="mt-5 text-sm text-[#374151] dark:text-gray-300">
          <strong>{t("review.address", { defaultValue: "Adresse" })}:</strong>{" "}
          {form.address}, {form.zipCode} {form.city}
        </div>

        <div className="mt-3 text-sm text-[#374151] dark:text-gray-300">
          <strong>{t("review.amenities", { defaultValue: "Ausstattung" })}:</strong>{" "}
          {selectedAmenities.length ? selectedAmenities.join(", ") : "—"}
        </div>
      </div>

      {form.imagePreviews.length > 0 && (
        <div>
          <h3 className="font-bold text-[#111827] dark:text-white mb-3">
            {t("review.photos", { defaultValue: "Fotos" })}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {form.imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`review-${idx}`}
                className="w-full h-36 object-cover rounded-3xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="text-xs font-medium text-[#6b7280] dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-[#111827] dark:text-white">
        {value}
      </div>
    </div>
  );
}

function Field({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Label({ children }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#111827] dark:text-gray-200">
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-2xl border border-[#d1d5db] dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-sm text-[#111827] dark:text-white shadow-sm outline-none transition focus:border-[#60a5fa] focus:ring-4 focus:ring-[#dbeafe] dark:focus:ring-blue-950/40";