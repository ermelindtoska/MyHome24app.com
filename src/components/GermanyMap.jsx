// GermanyMap.jsx – Hartë interaktive me lokalizim për lande, qarqe dhe qytete
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GermanyMap = () => {
  const navigate = useNavigate();
  const zoomRef = useRef();
  const svgRef = useRef();
  let scale = 1;
  let selectedPath = null;

  const { t: tStates } = useTranslation('states');
  const { t: tCities } = useTranslation('cities');
  const { t: tDistricts } = useTranslation('districts');

  // Hartë e ID-ve drejt emrave për lande
  const idToStateName = {
    DEBW: 'Baden-Württemberg',
    DEBY: 'Bayern',
    BE: 'Berlin',
    DEBB: 'Brandenburg',
    HB: 'Bremen',
    HH: 'Hamburg',
    HE: 'Hessen',
    DEMV: 'Mecklenburg-Vorpommern',
    DENI: 'Niedersachsen',
    DENW: 'Nordrhein-Westfalen',
    DERP: 'Rheinland-Pfalz',
    DESL: 'Saarland',
    SN: 'Sachsen',
    ST: 'Sachsen-Anhalt',
    SH: 'Schleswig-Holstein',
    TH: 'Thüringen'
  };

  useEffect(() => {
    const tooltip = document.getElementById('tooltip');
    const svgObject = svgRef.current;
    const zoomContainer = zoomRef.current;
    if (!svgObject || !zoomContainer) return;

    const setZoom = (value) => {
      scale = Math.min(Math.max(0.5, value), 3);
      svgObject.style.transform = `scale(${scale})`;
      svgObject.style.transformOrigin = 'center center';
    };

    document.getElementById('resetZoom').onclick = () => setZoom(1);
    document.getElementById('zoomIn').onclick = () => setZoom(scale + 0.1);
    document.getElementById('zoomOut').onclick = () => setZoom(scale - 0.1);

    svgObject.addEventListener('load', () => {
      const svgDoc = svgObject.contentDocument;
      if (!svgDoc) return;
      const paths = svgDoc.querySelectorAll('path');

      paths.forEach(path => {
        const originalId = path.getAttribute('id')?.replace('DE-', '').replace('DE', '') || '';
        const idKey = Object.keys(idToStateName).find(key => key.endsWith(originalId));
        const fallbackName = idKey ? idToStateName[idKey] : originalId;

        let name = path.getAttribute('data-name') || fallbackName;
        const rawName = name
          .replace(/[_-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        let type = 'states';
        if (path.classList.contains('city')) type = 'cities';
        else if (path.classList.contains('district')) type = 'districts';

        let translatedName = rawName;
        if (type === 'states') translatedName = tStates(rawName);
        else if (type === 'cities') translatedName = tCities(rawName);
        else if (type === 'districts') translatedName = tDistricts(rawName);

        path.style.transition = 'fill 0.3s ease, transform 0.2s ease';
        path.style.cursor = 'pointer';
        path.style.stroke = 'white';
        path.style.strokeWidth = '1.5';

        path.addEventListener('mouseenter', (e) => {
          tooltip.style.display = 'block';
          tooltip.innerHTML = translatedName;
          tooltip.style.left = e.clientX + 10 + 'px';
          tooltip.style.top = e.clientY + 10 + 'px';
          path.style.fill = '#ef4444';
        });

        path.addEventListener('mousemove', (e) => {
          tooltip.style.left = e.clientX + 10 + 'px';
          tooltip.style.top = e.clientY + 10 + 'px';
        });

        path.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          if (path !== selectedPath) path.style.fill = '';
        });

        path.addEventListener('click', () => {
          if (selectedPath) selectedPath.style.fill = '';
          selectedPath = path;
          path.style.fill = '#ef4444';
          const slug = rawName.toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z]/g, '-');
          navigate(`/${type}/${slug}`);
        });
      });
    });
  }, [navigate, tStates, tCities, tDistricts]);

  return (
    <div className="relative w-full max-w-[90vw] h-[calc(100vh-140px)] mx-auto bg-gradient-to-b from-slate-800 to-slate-900 py-6 overflow-auto">
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button id="zoomOut" className="bg-white text-sm px-3 py-1 rounded shadow">-</button>
        <button id="resetZoom" className="bg-white text-sm px-3 py-1 rounded shadow">Reset</button>
        <button id="zoomIn" className="bg-white text-sm px-3 py-1 rounded shadow">+</button>
      </div>
      <div ref={zoomRef} id="zoom-container" className="overflow-auto w-full h-full touch-none">
        <object
          ref={svgRef}
          id="germany-svg"
          type="image/svg+xml"
          data="/images/germany-map.svg"
          className="w-full h-full object-contain transition-transform duration-200"
          aria-label="Germany Map"
        />
        <div
          id="tooltip"
          className="tooltip"
          style={{
            position: 'absolute',
            display: 'none',
            background: 'white',
            border: '1px solid black',
            padding: '4px 8px',
            fontSize: '14px',
            zIndex: 50,
            pointerEvents: 'none',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default GermanyMap;
