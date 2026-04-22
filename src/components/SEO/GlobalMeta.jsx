// src/components/SEO/GlobalMeta.jsx
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteMeta from "./SiteMeta";

export default function GlobalMeta() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation("meta");

  const currentLang = i18n.language?.slice(0, 2) || "de";

  const canonical =
    typeof window !== "undefined"
      ? `${window.location.origin}${pathname}`
      : "";

  const defaults = useMemo(
    () => ({
      title: t("global.title", {
        defaultValue: "Immobilien kaufen & mieten in Deutschland",
      }),
      description: t("global.description", {
        defaultValue:
          "MyHome24App – moderne Plattform für Immobilien in Deutschland. Kaufen, mieten und vergleichen.",
      }),
      canonical,
      ogImage:
        typeof window !== "undefined"
          ? `${window.location.origin}/icons/icon-512.png`
          : "/icons/icon-512.png",
      lang: currentLang,
    }),
    [canonical, t, currentLang]
  );

  return <SiteMeta {...defaults} />;
}