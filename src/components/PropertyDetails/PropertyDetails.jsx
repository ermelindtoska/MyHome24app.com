// PropertyDetails.jsx – FINAL
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { getListingImages } from "../../utils/getListingImage"; // ✅ ky është correct
import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation("property");
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() }); // ✅ ruaj edhe id
        } else {
          console.error("No such property!");
          setProperty(null);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  const images = useMemo(() => getListingImages(property), [property]);

  if (!property) {
    return (
      <div className="text-center p-10 text-gray-500 dark:text-gray-300">
        {t("loading", { defaultValue: "Wird geladen..." })}
      </div>
    );
  }

  const title = property.title || t("noTitle", { defaultValue: "Ohne Titel" });

  const address =
    property.address ||
    property.street ||
    property.fullAddress ||
    [property.postalCode || property.zip, property.city].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">{title}</h1>

      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-6">
        <FaMapMarkerAlt className="mr-2" />
        <span>{address}</span>
      </div>

      {/* ✅ Images */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Property image ${idx + 1}`}
            className="rounded-xl w-full h-64 object-cover border border-gray-200 dark:border-gray-700"
            loading="lazy"
          />
        ))}
      </div>

      {/* ✅ Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <FaBed className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold">
            {property.bedrooms ?? "–"} {t("bedrooms", { defaultValue: "Schlafzimmer" })}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <FaBath className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold">
            {property.bathrooms ?? "–"} {t("bathrooms", { defaultValue: "Badezimmer" })}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <FaMoneyBill className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold">
            {property.price != null ? `${property.price} €` : "–"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <span className="text-sm font-semibold">
            {property.size != null ? `${property.size} m²` : "– m²"}
          </span>
        </div>
      </div>

      {/* ✅ Description */}
      {property.description ? (
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {property.description}
        </p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {t("noDescription", { defaultValue: "Keine Beschreibung vorhanden." })}
        </p>
      )}

      {/* ✅ Contact */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          {t("contactAgent", { defaultValue: "Kontakt" })}
        </h2>

        <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300">
          <div>
            <strong>{t("agent", { defaultValue: "Ansprechperson" })}:</strong>{" "}
            {property.agent?.name || "—"}
          </div>

          <div className="flex items-center gap-2">
            <FaPhone />
            <span>{property.agent?.phone || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaEnvelope />
            <span>{property.agent?.email || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
