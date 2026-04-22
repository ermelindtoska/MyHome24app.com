import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiHome, FiMapPin, FiTag, FiUpload, FiX } from "react-icons/fi";

const initialForm = {
  title: "",
  city: "",
  price: "",
  type: "apartment",
  purpose: "rent",
  images: [],
};

const ListingModal = ({ onAdd, onClose }) => {
  const { t } = useTranslation("listing");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const previews = useMemo(
    () => form.images.map((file) => URL.createObjectURL(file)),
    [form.images]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10),
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = t("modal.errors.titleRequired", { defaultValue: "Bitte geben Sie einen Titel ein." });
    if (!form.city.trim()) nextErrors.city = t("modal.errors.cityRequired", { defaultValue: "Bitte geben Sie eine Stadt ein." });
    if (!form.price || Number(form.price) <= 0) {
      nextErrors.price = t("modal.errors.priceRequired", { defaultValue: "Bitte geben Sie einen gültigen Preis ein." });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onAdd?.({
      ...form,
      price: Number(form.price),
    });

    setForm(initialForm);
    setErrors({});
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              {t("modal.badge", { defaultValue: "Neues Inserat" })}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {t("modal.title", { defaultValue: "Inserat hinzufügen" })}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("modal.subtitle", {
                defaultValue: "Erstellen Sie schnell ein neues Immobilieninserat.",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t("modal.fields.title", { defaultValue: "Titel" })}
              </label>
              <div className="relative">
                <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder={t("modal.placeholders.title", { defaultValue: "z. B. Moderne Wohnung in Berlin" })}
                  className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/30"
                />
              </div>
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t("modal.fields.city", { defaultValue: "Stadt" })}
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder={t("modal.placeholders.city", { defaultValue: "z. B. München" })}
                  className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/30"
                />
              </div>
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t("modal.fields.price", { defaultValue: "Preis" })}
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder={t("modal.placeholders.price", { defaultValue: "z. B. 1200" })}
                  className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/30"
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t("modal.fields.type", { defaultValue: "Typ" })}
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/30"
              >
                <option value="apartment">{t("apartment", { defaultValue: "Wohnung" })}</option>
                <option value="house">{t("house", { defaultValue: "Haus" })}</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t("modal.fields.purpose", { defaultValue: "Zweck" })}
              </label>
              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/30"
              >
                <option value="rent">{t("rent", { defaultValue: "Mieten" })}</option>
                <option value="buy">{t("buy", { defaultValue: "Kaufen" })}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t("modal.fields.images", { defaultValue: "Bilder" })}
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800">
              <FiUpload size={18} />
              {t("modal.upload", { defaultValue: "Bilder hochladen" })}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={src}
                      alt={`preview-${index}`}
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-gray-700 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {t("modal.cancel", { defaultValue: "Abbrechen" })}
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            >
              {t("submit", { defaultValue: "Speichern" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingModal;