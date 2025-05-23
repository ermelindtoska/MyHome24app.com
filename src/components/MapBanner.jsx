// src/components/MapBanner.jsx
import React from 'react';

const germanStates = [
  { id: 'berlin', name: 'Berlin' },
  { id: 'bayern', name: 'Bayern' },
  { id: 'baden-wuerttemberg', name: 'Baden-Württemberg' },
  { id: 'hamburg', name: 'Hamburg' },
  { id: 'niedersachsen', name: 'Niedersachsen' },
  { id: 'nordrhein-westfalen', name: 'Nordrhein-Westfalen' },
  { id: 'hessen', name: 'Hessen' },
  { id: 'sachsen', name: 'Sachsen' },
  { id: 'sachsen-anhalt', name: 'Sachsen-Anhalt' },
  { id: 'thüringen', name: 'Thüringen' },
  { id: 'brandenburg', name: 'Brandenburg' },
  { id: 'mecklenburg-vorpommern', name: 'Mecklenburg-Vorpommern' },
  { id: 'schleswig-holstein', name: 'Schleswig-Holstein' },
  { id: 'rheinland-pfalz', name: 'Rheinland-Pfalz' },
  { id: 'saarland', name: 'Saarland' },
  { id: 'bremen', name: 'Bremen' }
];

const MapBanner = ({ onRegionSelect }) => {
  return (
    <section className="bg-white border-t py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-center text-2xl font-semibold text-gray-700 mb-6">
          Bundesland auswählen um Ergebnisse zu filtern
        </h3>
        <div className="w-full h-auto bg-gray-100 p-4 rounded-xl shadow-md flex flex-wrap justify-center gap-4">
          {germanStates.map((state) => (
            <button
              key={state.id}
              onClick={() => onRegionSelect(state.name)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {state.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MapBanner;