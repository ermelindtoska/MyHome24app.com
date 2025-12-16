// src/pages/RentPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import MapPage from "./MapPage";

const RentPage = () => {
  const { t, i18n } = useTranslation("rent");

  const title = t("metaTitle", {
    defaultValue: "Wohnungen & Häuser mieten in Deutschland – MyHome24App",
  });

  const description = t("metaDescription", {
    defaultValue:
      "Finde Mietwohnungen und Häuser in ganz Deutschland. Kartenansicht, smarte Filter & Vergleich – wie bei Zillow, lokalisiert für DE.",
  });

  return (
    <>
      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}/rent`}
        ogImage={`${window.location.origin}/og/og-rent.jpg`}
        lang={i18n.language?.slice(0, 2) || "de"}
      />

      <MapPage purpose="rent" />
    </>
  );
};

export default RentPage;
