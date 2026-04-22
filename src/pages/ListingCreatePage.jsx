import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  MdAddHome,
  MdLocationCity,
  MdEuro,
  MdImage,
  MdCategory,
  MdSell,
  MdArrowBack,
  MdCheckCircle,
  MdError,
} from "react-icons/md";

const ListingCreatePage = () => {
  const { t, i18n } = useTranslation("listingForm");
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";

  const [form, setForm] = useState({
    title: "",
    city: "",
    type: "",
    purpose: "",
    price: "",
    imageUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const typeOptions = useMemo(
    () => [
      { value: "apartment", label: t("types.apartment", { defaultValue: "Wohnung" }) },
      { value: "house", label: t("types.house", { defaultValue: "Haus" }) },
      { value: "office", label: t("types.office", { defaultValue: "Büro" }) },
      { value: "commercial", label: t("types.commercial", { defaultValue: "Gewerbe" }) },
      { value: "land", label: t("types.land", { defaultValue: "Grundstück" }) },
    ],
    [t]
  );

  const purposeOptions = useMemo(
    () => [
      { value: "buy", label: t("purposes.buy", { defaultValue: "Kaufen" }) },
      { value: "rent", label: t("purposes.rent", { defaultValue: "Mieten" }) },
    ],
    [t]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetMessages = () => {
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!auth.currentUser) {
      setErrorMsg(
        t("errors.loginRequired", {
          defaultValue: "Bitte melden Sie sich zuerst an, um ein Inserat zu erstellen.",
        })
      );
      return;
    }

    if (
      !form.title.trim() ||
      !form.city.trim() ||
      !form.type.trim() ||
      !form.purpose.trim() ||
      !form.price.toString().trim()
    ) {
      setErrorMsg(
        t("errors.requiredFields", {
          defaultValue: "Bitte füllen Sie alle Pflichtfelder aus.",
        })
      );
      return;
    }

    const numericPrice = Number(form.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMsg(
        t("errors.invalidPrice", {
          defaultValue: "Bitte geben Sie einen gültigen Preis ein.",
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "listings"), {
        title: form.title.trim(),
        city: form.city.trim(),
        type: form.type,
        purpose: form.purpose,
        price: numericPrice,
        imageUrl: form.imageUrl.trim() || "",
        createdAt: Timestamp.now(),
        userId: auth.currentUser.uid,
        ownerEmail: auth.currentUser.email || "",
        status: "pending",
      });

      setSuccessMsg(
        t("success.created", {
          defaultValue: "Inserat erfolgreich erstellt.",
        })
      );

      setForm({
        title: "",
        city: "",
        type: "",
        purpose: "",
        price: "",
        imageUrl: "",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Fehler beim Erstellen des Inserats:", err);
      setErrorMsg(
        t("errors.createFailed", {
          defaultValue: "Beim Erstellen des Inserats ist ein Fehler aufgetreten.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("metaTitle", {
          defaultValue: "Neues Inserat erstellen – MyHome24App",
        })}
        description={t("metaDescription", {
          defaultValue:
            "Erstellen Sie ein neues Immobilieninserat auf MyHome24App und veröffentlichen Sie Ihr Objekt professionell.",
        })}
        canonical={`${window.location.origin}/listing/create`}
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr,0.92fr] items-start">
          {/* LEFT INTRO */}
          <section>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
            >
              <MdArrowBack className="mr-1 text-lg" />
              {t("back", { defaultValue: "Zurück" })}
            </button>

            <div className="mt-5 inline-flex items-center rounded-full bg-blue-600/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <MdAddHome className="mr-2" />
              {t("badge", { defaultValue: "Neues Inserat" })}
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("createTitle", { defaultValue: "Immobilieninserat erstellen" })}
            </h1>

            <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-slate-600 dark:text-slate-300">
              {t("intro", {
                defaultValue:
                  "Erstellen Sie ein neues Exposé für Ihre Immobilie. Geben Sie die wichtigsten Eckdaten ein, damit Ihr Objekt professionell auf MyHome24App dargestellt werden kann.",
              })}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<MdCategory className="text-xl" />}
                title={t("tips.typeTitle", { defaultValue: "Klare Zuordnung" })}
                text={t("tips.typeText", {
                  defaultValue:
                    "Wählen Sie den passenden Immobilientyp und Zweck, damit Ihr Inserat in den richtigen Suchergebnissen erscheint.",
                })}
              />

              <InfoCard
                icon={<MdEuro className="text-xl" />}
                title={t("tips.priceTitle", { defaultValue: "Transparenter Preis" })}
                text={t("tips.priceText", {
                  defaultValue:
                    "Ein klarer und realistischer Preis erhöht die Qualität Ihres Inserats und verbessert die Vergleichbarkeit.",
                })}
              />

              <InfoCard
                icon={<MdImage className="text-xl" />}
                title={t("tips.imageTitle", { defaultValue: "Bild hinzufügen" })}
                text={t("tips.imageText", {
                  defaultValue:
                    "Ein Bild- oder Cover-Link verbessert die Präsentation und macht das Inserat deutlich ansprechender.",
                })}
              />

              <InfoCard
                icon={<MdLocationCity className="text-xl" />}
                title={t("tips.cityTitle", { defaultValue: "Standort angeben" })}
                text={t("tips.cityText", {
                  defaultValue:
                    "Die Stadt ist eines der wichtigsten Suchkriterien für Interessent:innen und sollte korrekt eingetragen werden.",
                })}
              />
            </div>
          </section>

          {/* RIGHT FORM */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-5">
              {t("formTitle", { defaultValue: "Inseratdaten" })}
            </h2>

            {successMsg && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                <MdCheckCircle className="mt-0.5 text-lg" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
                <MdError className="mt-0.5 text-lg" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label={t("title", { defaultValue: "Titel" })}
                icon={<MdAddHome className="text-lg" />}
              >
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder={t("placeholders.title", {
                    defaultValue: "z. B. Moderne 3-Zimmer-Wohnung in Berlin",
                  })}
                  className="input"
                  required
                />
              </Field>

              <Field
                label={t("city", { defaultValue: "Stadt" })}
                icon={<MdLocationCity className="text-lg" />}
              >
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder={t("placeholders.city", {
                    defaultValue: "z. B. Berlin",
                  })}
                  className="input"
                  required
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={t("type", { defaultValue: "Immobilientyp" })}
                  icon={<MdCategory className="text-lg" />}
                >
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">
                      {t("selectType", { defaultValue: "Typ auswählen" })}
                    </option>
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={t("purpose", { defaultValue: "Zweck" })}
                  icon={<MdSell className="text-lg" />}
                >
                  <select
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">
                      {t("selectPurpose", { defaultValue: "Zweck auswählen" })}
                    </option>
                    {purposeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label={t("price", { defaultValue: "Preis" })}
                icon={<MdEuro className="text-lg" />}
              >
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder={t("placeholders.price", {
                    defaultValue: "z. B. 350000",
                  })}
                  className="input"
                  required
                />
              </Field>

              <Field
                label={t("imageUrl", { defaultValue: "Bild-URL" })}
                icon={<MdImage className="text-lg" />}
                helper={t("imageHelper", {
                  defaultValue:
                    "Optional: Fügen Sie einen direkten Bildlink hinzu, damit das Inserat sofort ein Vorschaubild erhält.",
                })}
              >
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder={t("placeholders.imageUrl", {
                    defaultValue: "https://...",
                  })}
                  className="input"
                />
              </Field>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t("creating", { defaultValue: "Wird erstellt…" })
                    : t("submit", { defaultValue: "Inserat erstellen" })}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {t("cancel", { defaultValue: "Abbrechen" })}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, icon, helper, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
      <span className="text-slate-500 dark:text-slate-400">{icon}</span>
      {label}
    </label>
    {children}
    {helper && (
      <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        {helper}
      </p>
    )}
  </div>
);

const InfoCard = ({ icon, title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h3>
        <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
          {text}
        </p>
      </div>
    </div>
  </div>
);

export default ListingCreatePage;