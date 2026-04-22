import React, { useMemo, useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { FiUploadCloud, FiHome, FiMapPin, FiDollarSign, FiImage } from "react-icons/fi";

const AddListingForm = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("apartment");
  const [purpose, setPurpose] = useState("rent");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const previews = useMemo(() => {
    return images.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setError("");
  };

  const resetForm = () => {
    setTitle("");
    setCity("");
    setPrice("");
    setType("apartment");
    setPurpose("rent");
    setImages([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;

    setUploading(true);
    setError("");

    try {
      if (!onSubmit || typeof onSubmit !== "function") {
        throw new Error("Submit function is not defined or invalid.");
      }

      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, `listings/${uuidv4()}-${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      const listing = {
        title: title.trim(),
        city: city.trim(),
        price: Number(price) || 0,
        type,
        purpose,
        imageUrls,
      };

      console.log("[DEBUG] Submitting listing:", listing);
      await onSubmit(listing);
      resetForm();
    } catch (submitError) {
      console.error("Error while uploading or submitting:", submitError);
      setError("Fehler beim Hochladen oder Speichern.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-950 md:p-8"
      >
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            <FiUploadCloud size={14} />
            Anzeige hinzufügen
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Neue Immobilie erstellen
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Erfasse die wichtigsten Eckdaten und lade Bilder hoch, damit dein
            Inserat professionell dargestellt wird.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Titel
            </label>
            <div className="relative">
              <FiHome className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Helle 3-Zimmer-Wohnung in Berlin"
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Stadt
            </label>
            <div className="relative">
              <FiMapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="z. B. Hamburg"
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Preis
            </label>
            <div className="relative">
              <FiDollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Preis (€)"
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Immobilientyp
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="apartment">Wohnung</option>
                <option value="house">Haus</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Zweck
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="rent">Zur Miete</option>
                <option value="buy">Zum Kauf</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bilder
            </label>

            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FiImage />
                Mehrere Bilder sind möglich
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:text-slate-300"
              />
            </div>

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {previews.map((preview) => (
                  <div
                    key={preview.name}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="h-28 w-full object-cover"
                    />
                    <div className="truncate px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {preview.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Wird hochgeladen..." : "Einreichen"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={uploading}
              className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddListingForm;