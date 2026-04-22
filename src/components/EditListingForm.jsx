import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiHome, FiMapPin, FiDollarSign, FiImage } from "react-icons/fi";

const EditListingForm = () => {
  const { t } = useTranslation(["editListing", "listing", "userDashboard"]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    city: "",
    price: "",
    type: "apartment",
    purpose: "buy",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const previewImage = useMemo(() => {
    return form.imageUrl?.trim() || "/images/hero-1.jpg";
  }, [form.imageUrl]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const ref = doc(db, "listings", id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          alert(
            t("notFoundAlert", {
              defaultValue: "Anzeige nicht gefunden.",
            })
          );
          navigate("/");
          return;
        }

        const data = snapshot.data();

        if (data.userId && data.userId !== auth.currentUser?.uid) {
          alert(
            t("notOwnerAlert", {
              defaultValue: "Du darfst diese Anzeige nicht bearbeiten.",
            })
          );
          navigate("/");
          return;
        }

        setForm({
          title: data.title || "",
          city: data.city || "",
          price: data.price ?? "",
          type: data.type || "apartment",
          purpose: data.purpose || "buy",
          imageUrl:
            data.images?.[0] ||
            data.imageUrls?.[0] ||
            data.imageUrl ||
            "",
        });
      } catch (err) {
        console.error("[EditListingForm] fetch error:", err);
        alert(
          t("loadError", {
            defaultValue: "Fehler beim Laden der Anzeige.",
          })
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.city.trim()) {
      alert(
        t("validationRequired", {
          defaultValue: "Bitte Titel und Stadt ausfüllen.",
        })
      );
      return;
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "listings", id), {
        title: form.title.trim(),
        city: form.city.trim(),
        price: Number(form.price) || 0,
        type: form.type,
        purpose: form.purpose,
        imageUrl: form.imageUrl.trim(),
        updatedAt: serverTimestamp(),
      });

      alert(
        t("updateSuccess", {
          defaultValue: "Anzeige wurde aktualisiert.",
        })
      );

      navigate(`/listing/${id}`);
    } catch (err) {
      console.error("[EditListingForm] update error:", err);
      alert(
        t("updateError", {
          defaultValue: "Fehler beim Aktualisieren.",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          {t("loading", { defaultValue: "Anzeige wird geladen…" })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <FiArrowLeft />
          {t("backButton", { defaultValue: "Zurück" })}
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("titlePage", { defaultValue: "Anzeige bearbeiten" })}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t("subtitle", {
                  defaultValue:
                    "Aktualisiere die wichtigsten Informationen deiner Immobilie.",
                })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t("fields.title", { defaultValue: "Titel" })}
                </label>
                <div className="relative">
                  <FiHome className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder={t("titlePlaceholder", {
                      defaultValue: "z. B. Moderne Wohnung in Berlin",
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t("fields.city", { defaultValue: "Stadt" })}
                </label>
                <div className="relative">
                  <FiMapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder={t("cityPlaceholder", {
                      defaultValue: "z. B. Hamburg",
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t("fields.price", { defaultValue: "Preis" })}
                </label>
                <div className="relative">
                  <FiDollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="450000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                    {t("fields.type", { defaultValue: "Immobilientyp" })}
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="apartment">
                      {t("fields.apartment", {
                        ns: "userDashboard",
                        defaultValue: "Wohnung",
                      })}
                    </option>
                    <option value="house">
                      {t("fields.house", {
                        ns: "userDashboard",
                        defaultValue: "Haus",
                      })}
                    </option>
                    <option value="office">
                      {t("typeOptions.office", {
                        ns: "userDashboard",
                        defaultValue: "Büro / Gewerbe",
                      })}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                    {t("fields.purpose", { defaultValue: "Zweck" })}
                  </label>
                  <select
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="buy">
                      {t("fields.buy", {
                        ns: "userDashboard",
                        defaultValue: "Kaufen",
                      })}
                    </option>
                    <option value="rent">
                      {t("fields.rent", {
                        ns: "userDashboard",
                        defaultValue: "Mieten",
                      })}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t("fields.imageUrl", { defaultValue: "Bild-URL" })}
                </label>
                <div className="relative">
                  <FiImage className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? t("saving", { defaultValue: "Speichert…" })
                    : t("saveButton", { defaultValue: "Änderungen speichern" })}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("previewTitle", { defaultValue: "Vorschau" })}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("previewSubtitle", {
                defaultValue:
                  "So wirkt dein Inserat mit den aktuell eingegebenen Daten.",
              })}
            </p>

            <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
              <div className="aspect-[16/10] w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img
                  src={previewImage}
                  alt={form.title || "Preview"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/hero-1.jpg";
                  }}
                />
              </div>

              <div className="p-4">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {form.title || t("previewFallbackTitle", { defaultValue: "Titel der Anzeige" })}
                </div>

                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {form.city || t("previewFallbackCity", { defaultValue: "Stadt"})}
                </div>

                <div className="mt-3 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  € {Number(form.price || 0).toLocaleString("de-DE")}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {form.type || "-"}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {form.purpose || "-"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EditListingForm;