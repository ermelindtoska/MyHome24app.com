// src/components/SEO/SiteMeta.jsx
import React from "react";
import { Helmet } from "react-helmet";

export default function SiteMeta({
  title,
  description,
  canonical,     // p.sh. `${window.location.origin}/listing/123`
  ogImage,       // URL absolute ose relative në /public
  lang = "de",   // "de" ose "en"
}) {
  const baseTitle = "MyHome24App";
  const fullTitle = title ? `${title} – ${baseTitle}` : baseTitle;
  const canonicalUrl = canonical || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>

      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
