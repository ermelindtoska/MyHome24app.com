// src/components/PropertyList/PropertyList.jsx
import React from "react";
import PropertyCard from "../PropertyCard/PropertyCard";
import { useTranslation } from "react-i18next";

const PropertyList = ({ listings }) => {
  const { t } = useTranslation("property");

  if (!listings || listings.length === 0) {
    return <p className="text-center text-gray-500">{t("noListings", { defaultValue: "Keine Anzeigen." })}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};

export default PropertyList;
