// src/components/HomeSections/LatestListingsSection.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import PropertyList from "../PropertyList/PropertyList";
import { FaExclamationTriangle } from "react-icons/fa";

const LatestListingsSection = () => {
  const { t } = useTranslation("home");
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const listingsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};

          // ✅ Normalize images/imageUrls ALWAYS to arrays (keeps old + new schema)
          const images = Array.isArray(data.images) ? data.images : [];
          const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : Array.isArray(data.imageUrls) ? data.imageUrls : [];
          // (Above line looks redundant; keep it simple below)
          const safeImageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [];

          return {
            id: docSnap.id,
            ...data,
            images, // ✅ always array
            imageUrls: safeImageUrls, // ✅ always array
          };
        });

        setListings(listingsData);
        setError(null);
      } catch (err) {
        console.error("Fehler beim Laden der Anzeigen:", err);
        setError(t("errorLoadingListings", { defaultValue: "Es gab einen Fehler beim Laden der Anzeigen." }));
      }
    };

    fetchListings();
  }, [t]);

  return (
    <section className="bg-gray-100 dark:bg-gray-800 py-20 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {t("latestListings", { defaultValue: "Neueste Anzeigen" })}
        </h2>

        {error ? (
          <div className="text-center text-red-500 flex flex-col items-center gap-2 mt-4">
            <FaExclamationTriangle className="text-3xl" />
            <p>{error}</p>
          </div>
        ) : listings.length > 0 ? (
          <PropertyList listings={listings} />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-300 mt-4">
            {t("noListings", { defaultValue: "Keine Anzeigen gefunden." })}
          </p>
        )}
      </div>
    </section>
  );
};

export default LatestListingsSection;
