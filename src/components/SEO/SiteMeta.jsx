// src/components/SEO/SiteMeta.jsx
import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

export default function SiteMeta({
  title,
  description,
  canonical,
  ogImage,
  lang,
  keywords = "",
}) {
  const { i18n } = useTranslation();

  const currentLang = lang || i18n.language?.slice(0, 2) || "de";

  const baseTitle = "MyHome24App";
  const fullTitle = title ? `${title} – ${baseTitle}` : baseTitle;

  const canonicalUrl =
    canonical ||
    (typeof window !== "undefined" ? window.location.href : "");

  const defaultDescription =
    description ||
    "Finde Immobilien in Deutschland – kaufen, mieten und vergleichen auf MyHome24App.";

  const defaultImage =
    ogImage ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/images/hero-1.jpg`
      : "/images/hero-1.jpg");

  return (
    <Helmet>
      {/* Language */}
      <html lang={currentLang} />

      {/* Basic SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={defaultDescription} />

      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="MyHome24App" />
      <meta name="robots" content="index, follow" />

      {/* Mobile / Theme */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#2563eb" />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:locale" content={currentLang === "de" ? "de_DE" : "en_US"} />
      <meta property="og:site_name" content="MyHome24App" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content={defaultImage} />

      {/* Optional future (SEO pro-level) */}
      {/* <meta property="og:image:width" content="1200" /> */}
      {/* <meta property="og:image:height" content="630" /> */}
    </Helmet>
  );
}