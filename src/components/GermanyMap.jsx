import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GermanyMap = () => {
  const navigate = useNavigate();

  const svgRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const scaleRef = useRef(1);
  const selectedPathRef = useRef(null);
  const cleanupRef = useRef([]);

  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });

  const { t: tStates } = useTranslation("states");
  const { t: tCities } = useTranslation("cities");
  const { t: tDistricts } = useTranslation("districts");
  const { t } = useTranslation("map");

  const idToStateName = {
    DEBW: "Baden-Württemberg",
    DEBY: "Bayern",
    BE: "Berlin",
    DEBB: "Brandenburg",
    HB: "Bremen",
    HH: "Hamburg",
    HE: "Hessen",
    DEMV: "Mecklenburg-Vorpommern",
    DENI: "Niedersachsen",
    DENW: "Nordrhein-Westfalen",
    DERP: "Rheinland-Pfalz",
    DESL: "Saarland",
    SN: "Sachsen",
    ST: "Sachsen-Anhalt",
    SH: "Schleswig-Holstein",
    TH: "Thüringen",
  };

  const slugify = useCallback((value = "") => {
    return value
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const setZoom = useCallback((nextValue) => {
    const svgObject = svgRef.current;
    const newScale = Math.min(Math.max(0.65, nextValue), 3);

    scaleRef.current = newScale;

    if (svgObject) {
      svgObject.style.transform = `scale(${newScale})`;
      svgObject.style.transformOrigin = "center center";
    }
  }, []);

  useEffect(() => {
    const svgObject = svgRef.current;
    if (!svgObject) return;

    const handleLoad = () => {
      const svgDoc = svgObject.contentDocument;
      if (!svgDoc) return;

      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];

      const paths = svgDoc.querySelectorAll("path");

      paths.forEach((path) => {
        const originalId =
          path.getAttribute("id")?.replace("DE-", "").replace("DE", "") || "";

        const idKey = Object.keys(idToStateName).find((key) =>
          key.endsWith(originalId)
        );

        const fallbackName = idKey ? idToStateName[idKey] : originalId;

        let name = path.getAttribute("data-name") || fallbackName;
        const rawName = String(name)
          .replace(/[_-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        let type = "states";
        if (path.classList.contains("city")) type = "cities";
        else if (path.classList.contains("district")) type = "districts";

        let translatedName = rawName;
        if (type === "states") translatedName = tStates(rawName);
        else if (type === "cities") translatedName = tCities(rawName);
        else if (type === "districts") translatedName = tDistricts(rawName);

        path.style.transition = "fill 0.25s ease, transform 0.2s ease";
        path.style.cursor = "pointer";
        path.style.stroke = "rgba(255,255,255,0.9)";
        path.style.strokeWidth = "1.2";
        path.style.outline = "none";

        const onMouseEnter = (e) => {
          setTooltip({
            visible: true,
            text: translatedName,
            x: e.clientX + 12,
            y: e.clientY + 12,
          });

          if (path !== selectedPathRef.current) {
            path.style.fill = "#3b82f6";
          }
        };

        const onMouseMove = (e) => {
          setTooltip((prev) => ({
            ...prev,
            visible: true,
            x: e.clientX + 12,
            y: e.clientY + 12,
          }));
        };

        const onMouseLeave = () => {
          setTooltip((prev) => ({ ...prev, visible: false }));

          if (path !== selectedPathRef.current) {
            path.style.fill = "";
          }
        };

        const onClick = () => {
          if (selectedPathRef.current) {
            selectedPathRef.current.style.fill = "";
          }

          selectedPathRef.current = path;
          path.style.fill = "#ef4444";

          const slug = slugify(rawName);
          navigate(`/${type}/${slug}`);
        };

        path.addEventListener("mouseenter", onMouseEnter);
        path.addEventListener("mousemove", onMouseMove);
        path.addEventListener("mouseleave", onMouseLeave);
        path.addEventListener("click", onClick);

        cleanupRef.current.push(() => {
          path.removeEventListener("mouseenter", onMouseEnter);
          path.removeEventListener("mousemove", onMouseMove);
          path.removeEventListener("mouseleave", onMouseLeave);
          path.removeEventListener("click", onClick);
        });
      });
    };

    svgObject.addEventListener("load", handleLoad);

    return () => {
      svgObject.removeEventListener("load", handleLoad);
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
    };
  }, [navigate, slugify, tCities, tDistricts, tStates]);

  return (
    <div className="relative mx-auto h-[calc(100vh-140px)] w-full max-w-[95vw] overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-slate-100 to-white shadow-xl dark:border-gray-800 dark:from-slate-900 dark:to-gray-950">
      {/* Toolbar */}
      <div className="absolute right-4 top-4 z-50 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setZoom(scaleRef.current - 0.15)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          −
        </button>

        <button
          type="button"
          onClick={() => setZoom(1)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          {t("reset", { defaultValue: "Reset" })}
        </button>

        <button
          type="button"
          onClick={() => setZoom(scaleRef.current + 0.15)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>

      {/* Hint */}
      <div className="absolute left-4 top-4 z-40 max-w-xs rounded-2xl border border-blue-200 bg-white/90 px-4 py-3 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-blue-900 dark:bg-gray-900/90 dark:text-gray-200">
        <p className="font-semibold text-blue-700 dark:text-blue-400">
          {t("germanyMapTitle", { defaultValue: "Deutschlandkarte" })}
        </p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {t("germanyMapHint", {
            defaultValue:
              "Klicke auf ein Bundesland, eine Stadt oder einen Bezirk, um passende Ergebnisse zu öffnen.",
          })}
        </p>
      </div>

      {/* SVG container */}
      <div
        ref={zoomContainerRef}
        className="flex h-full w-full items-center justify-center overflow-auto p-6"
      >
        <object
          ref={svgRef}
          type="image/svg+xml"
          data="/images/germany-map.svg"
          className="h-full w-full object-contain transition-transform duration-200"
          aria-label="Germany Map"
        />
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none fixed z-[9999] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default GermanyMap;