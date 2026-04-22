import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../firebase";
import { useTranslation } from "react-i18next";

const AddPropertyForm = () => {
  const [user] = useAuthState(auth);
  const { t } = useTranslation("dashboard");

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    price: "",
    imageUrl: "",
  });

  const [status, setStatus] = useState({ type: "", text: "" }); // type: "ok" | "err" | "info"

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus({
        type: "info",
        text: t("loginRequired", { defaultValue: "🔒 Bitte zuerst anmelden." }),
      });
      return;
    }

    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        price: parseFloat(formData.price),
        imageUrls: [formData.imageUrl],
        userId: user.uid, // 🔐 ky është çelësi për të funksionuar OwnerDashboard
        createdAt: serverTimestamp(),
      });

      setStatus({
        type: "ok",
        text: t("addSuccess", { defaultValue: "✅ Immobilie wurde hinzugefügt!" }),
      });

      setFormData({ title: "", city: "", price: "", imageUrl: "" });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "err",
        text: t("addFailed", { defaultValue: "❌ Speichern fehlgeschlagen. Bitte erneut versuchen." }),
      });
    }
  };

  const statusClass =
    status.type === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
      : status.type === "err"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200"
      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-2xl font-bold mb-1">
            {t("add_property", { defaultValue: "Immobilie hinzufügen" })}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            {t("add_property_subtitle", {
              defaultValue: "Tragen Sie die wichtigsten Daten ein und speichern Sie das Listing.",
            })}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t("title", { defaultValue: "Titel" })}
              </label>
              <input
                type="text"
                name="title"
                placeholder={t("title", { defaultValue: "Titel" })}
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40
                           dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t("city", { defaultValue: "Stadt" })}
              </label>
              <input
                type="text"
                name="city"
                placeholder={t("city", { defaultValue: "Stadt" })}
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40
                           dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t("price", { defaultValue: "Preis" })}
              </label>
              <input
                type="number"
                name="price"
                placeholder={t("price", { defaultValue: "Preis" })}
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40
                           dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t("image_url", { defaultValue: "Bild-URL" })}
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder={t("image_url", { defaultValue: "Bild-URL" })}
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40
                           dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              {t("submit", { defaultValue: "Speichern" })}
            </button>
          </form>

          {status.text && (
            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${statusClass}`}>
              {status.text}
            </div>
          )}
        </div>

        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 text-center">
          {t("add_property_footer", {
            defaultValue: "Tipp: Nutzen Sie möglichst ein korrektes Bildformat (JPG/PNG) und eine valide URL.",
          })}
        </p>
      </div>
    </main>
  );
};

export default AddPropertyForm;