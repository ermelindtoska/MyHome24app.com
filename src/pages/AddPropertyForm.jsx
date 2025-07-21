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
  const [status, setStatus] = useState("");

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!user) {
      setStatus("🔒 Please log in to add a property.");
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
      setStatus("✅ Property added successfully!");
      setFormData({ title: "", city: "", price: "", imageUrl: "" });
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to add property.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {t("add_property")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder={t("title")}
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          name="city"
          placeholder={t("city")}
          value={formData.city}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="number"
          name="price"
          placeholder={t("price")}
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="url"
          name="imageUrl"
          placeholder={t("image_url")}
          value={formData.imageUrl}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {t("submit")}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{status}</p>}
    </div>
  );
};

export default AddPropertyForm;
