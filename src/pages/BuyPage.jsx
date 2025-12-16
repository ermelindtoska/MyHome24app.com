// src/pages/BuyPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import MapPage from "./MapPage";

const BuyPage = () => {
  const { t, i18n } = useTranslation("buy");

  const title = t("metaTitle", {
    defaultValue: "Immobilien kaufen in Deutschland – MyHome24App",
  });

  const description = t("metaDescription", {
    defaultValue:
      "Durchsuche Häuser, Wohnungen und Neubauten zum Kauf in Deutschland. Kartenansicht, Filter & Vergleich – wie bei Zillow, lokalisiert für DE.",
  });

  return (
    <>
      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}/buy`}
        ogImage={`${window.location.origin}/og/og-buy.jpg`}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      <MapPage purpose="buy" />
    </>
  );
};

export default BuyPage;
