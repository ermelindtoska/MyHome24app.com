// src/pages/ExplorePage.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GermanyMapReal from "./GermanyMapReal";
import SiteMeta from "../components/SEO/SiteMeta";

const ExplorePage = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation("explore");

  const lang = i18n.language?.slice(0, 2) || "de";

  // --------------------------------------------------
  // Determine purpose from URL
  // --------------------------------------------------

  let purpose = "";

  if (pathname.startsWith("/buy")) {
    purpose = "buy";
  } else if (pathname.startsWith("/rent")) {
    purpose = "rent";
  } else {
    purpose = "explore";
  }

  // --------------------------------------------------
  // SEO META
  // --------------------------------------------------

  const title = t("metaTitle", {
    defaultValue: "Immobilienkarte Deutschland – MyHome24App",
  });

  const description = t("metaDescription", {
    defaultValue:
      "Entdecke Immobilien in Deutschland auf der interaktiven Karte. Häuser und Wohnungen kaufen oder mieten – wie bei Zillow.",
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      <SiteMeta
        title={title}
        description={description}
        canonical={`${window.location.origin}${pathname}`}
        lang={lang}
      />

      {/* Map + Listings */}
      <GermanyMapReal purpose={purpose} />

    </div>
  );
};

export default ExplorePage;