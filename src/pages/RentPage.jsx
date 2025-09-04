// src/pages/RentPage.jsx
import React from "react";
import GermanyMapReal from "./GermanyMapReal"; // rruga e saktë brenda /pages
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";

const RentPage = () => {
  const navigate = useNavigate();

  // për meta përdor namespace "rent"
  const { t, i18n } = useTranslation("rent");

  const title = t("metaTitle", {
    defaultValue: "Wohnungen & Häuser mieten in Deutschland – MyHome24App",
  });

  const description = t("metaDescription", {
    defaultValue:
      "Finde Mietwohnungen und Häuser in ganz Deutschland. Kartenansicht, smarte Filter und Vergleich – schnell wie bei Zillow, lokalisiert für DE.",
  });

  return (
    <>
      {/* SEO meta për këtë faqe */}
      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}/rent`}
        ogImage={`${window.location.origin}/og/og-rent.jpg`}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      {/* Harta/faqja kryesore e qirasë */}
      <GermanyMapReal purpose="rent" />

      {/* Buton “Show Map” vetëm në mobile */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => navigate("/map")}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {t("showMap", { ns: "navbar", defaultValue: "Karte anzeigen" })}
        </button>
      </div>
    </>
  );
};

export default RentPage;
