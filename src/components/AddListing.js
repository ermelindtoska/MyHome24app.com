import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiImage,
  FiTrash2,
  FiTag,
  FiFileText,
} from "react-icons/fi";

const FALLBACK_IMG = "/images/hero-1.jpg";

export default function AddListing({ user, filters = {}, setModalListing }) {
  const { t } = useTranslation();

  const initialForm = {
    title: "",
    description: "",
    type: "rent",
    location: "",
    category: "apartment",
    price: "",
    images: [],
  };

  const [form, setForm] = useState(initialForm);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("listings");
    if (saved) {
      try {
        setListings(JSON.parse(saved));
      } catch (error) {
        console.error("[AddListing] Fehler beim Lesen aus localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    return () => {
      form.images.forEach((img) => {
        if (img?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [form.images]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      const selected = Array.from(files || []).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));

      setForm((prev) => {
        prev.images.forEach((img) => {
          if (img?.url?.startsWith("blob:")) {
            URL.revokeObjectURL(img.url);
          }
        });

        return {
          ...prev,
          images: selected,
        };
      });

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    form.images.forEach((img) => {
      if (img?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });
    setForm(initialForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newListing = {
      ...form,
      user,
      timestamp: new Date().toLocaleString(),
    };

    setListings((prev) => [newListing, ...prev]);
    resetForm();
  };

  const handleDelete = (index) => {
    setListings((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const keywordMatch =
        !filters.keyword ||
        item.title.toLowerCase().includes(filters.keyword.toLowerCase());

      const typeMatch = !filters.type || item.type === filters.type;

      const cityMatch =
        !filters.city ||
        item.location.toLowerCase().includes(filters.city.toLowerCase());

      const categoryMatch =
        !filters.category || item.category === filters.category;

      return keywordMatch && typeMatch && cityMatch && categoryMatch;
    });
  }, [listings, filters]);

  return (
    <div className="mt-10 space-y-10">
      {/* FORM */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-8">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            <FiHome size={14} />
            {t("formTitle", { defaultValue: "Anzeige hinzufügen" })}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("formTitle", { defaultValue: "Anzeige hinzufügen" })}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t("formSubtitle", {
              defaultValue:
                "Erstellen Sie ein einfaches Inserat mit den wichtigsten Angaben und Bildvorschau.",
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("title", { defaultValue: "Titel" })}
            </label>
            <div className="relative">
              <FiHome className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="title"
                placeholder={t("title", { defaultValue: "Titel" })}
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("descriptionField", { defaultValue: "Beschreibung" })}
            </label>
            <div className="relative">
              <FiFileText className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <textarea
                name="description"
                placeholder={t("descriptionField", {
                  defaultValue: "Beschreibung",
                })}
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 pl-10 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("type", { defaultValue: "Typ" })}
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="rent">{t("rent", { defaultValue: "Mieten" })}</option>
                <option value="sale">{t("sale", { defaultValue: "Kaufen" })}</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("category", { defaultValue: "Kategorie" })}
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="apartment">
                  {t("apartment", { defaultValue: "Wohnung" })}
                </option>
                <option value="house">{t("house", { defaultValue: "Haus" })}</option>
                <option value="office">{t("office", { defaultValue: "Büro" })}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("location", { defaultValue: "Ort" })}
            </label>
            <div className="relative">
              <FiMapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="location"
                placeholder={t("location", { defaultValue: "Ort" })}
                value={form.location}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("price", { defaultValue: "Preis" })}
            </label>
            <div className="relative">
              <FiDollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="price"
                placeholder={t("price", { defaultValue: "Preis" })}
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("images", { defaultValue: "Bilder" })}
            </label>
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FiImage />
                {t("imageUploadHint", {
                  defaultValue: "Mehrere Bilder können ausgewählt werden.",
                })}
              </div>

              <input
                name="images"
                type="file"
                accept="image/*"
                onChange={handleChange}
                multiple
                className="w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:text-slate-300"
              />
            </div>

            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {form.images.map((img, index) => (
                  <div
                    key={`${img.name}-${index}`}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-28 w-full object-cover"
                    />
                    <div className="truncate px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("submit", { defaultValue: "Einreichen" })}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-slate-700 transition hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("reset", { defaultValue: "Zurücksetzen" })}
            </button>
          </div>
        </form>
      </section>

      {/* LISTINGS GRID */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("listingsTitle", { defaultValue: "Ihre Inserate" })}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {t("listingsSubtitle", {
                defaultValue:
                  "Hier sehen Sie alle lokal gespeicherten Inserate passend zu den aktuellen Filtern.",
              })}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <FiTag size={14} />
            {filteredListings.length}
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {t("noResults", { defaultValue: "Keine Ergebnisse gefunden." })}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("noResultsHint", {
                defaultValue:
                  "Versuchen Sie andere Filter oder erstellen Sie ein neues Inserat.",
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((item, index) => (
              <div
                key={`${item.title}-${index}-${item.timestamp}`}
                onClick={() => setModalListing?.(item)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <img
                      src="/images/hero-1.jpg"
                      alt="Fallback"
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  )}

                  <div className="absolute bottom-3 left-3 rounded-2xl bg-slate-950/85 px-3 py-2 text-sm font-bold text-white backdrop-blur">
                    {item.price} €
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {item.location}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {item.type === "rent"
                        ? t("rent", { defaultValue: "Mieten" })
                        : t("sale", { defaultValue: "Kaufen" })}
                    </span>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {item.category === "apartment"
                        ? t("apartment", { defaultValue: "Wohnung" })
                        : item.category === "house"
                        ? t("house", { defaultValue: "Haus" })
                        : t("office", { defaultValue: "Büro" })}
                    </span>
                  </div>

                  {item.user === user && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                      className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      <FiTrash2 size={16} />
                      {t("delete", { defaultValue: "Löschen" })}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}