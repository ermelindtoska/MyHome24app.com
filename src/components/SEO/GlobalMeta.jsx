// src/components/SEO/GlobalMeta.jsx
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import SiteMeta from "./SiteMeta";

export default function GlobalMeta() {
  const { pathname } = useLocation();
  const canonical = `${window.location.origin}${pathname}`;
  const defaults = useMemo(
    () => ({
      title: "Immobilien kaufen & mieten in Deutschland",
      description:
        "MyHome24App – moderne Plattform für Immobilien in Deutschland. Kaufen, mieten, verkaufen – einfach & schnell.",
      canonical,
      ogImage: "/icons/icon-512.png",
    }),
    [canonical]
  );

  return <SiteMeta {...defaults} />;
}
