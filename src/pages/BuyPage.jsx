// src/pages/BuyPage.jsx
import React from "react";
import GermanyMapReal from "./GermanyMapReal"; // rruga e saktë nga pages/
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";

const BuyPage = () => {
  const navigate = useNavigate();

  // për meta përdor namespace "buy"
  const { t, i18n } = useTranslation("buy");

  const title = t("metaTitle", {
    defaultValue: "Immobilien kaufen in Deutschland – MyHome24App",
  });

  const description = t("metaDescription", {
    defaultValue:
      "Durchsuche Häuser, Wohnungen und Neubauten zum Kauf in ganz Deutschland. Kartenansicht, Filter und Vergleich – wie bei Zillow, nur lokalisiert.",
  });

  return (
    <>
      {/* SEO meta për këtë faqe */}
      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}/buy`}
        ogImage={`${window.location.origin}/og/og-buy.jpg`}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      {/* Harta/faqja kryesore e blerjes */}
      <GermanyMapReal purpose="buy" />

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

export default BuyPage;
