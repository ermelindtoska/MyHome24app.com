import React from 'react';

const states = [
  { id: 'BY', name: 'Bayern' },
  { id: 'BW', name: 'Baden-Württemberg' },
  { id: 'HE', name: 'Hessen' },
  { id: 'NW', name: 'Nordrhein-Westfalen' },
  { id: 'BE', name: 'Berlin' },
  { id: 'HH', name: 'Hamburg' },
  { id: 'NI', name: 'Niedersachsen' },
  { id: 'SN', name: 'Sachsen' },
  { id: 'TH', name: 'Thüringen' },
  { id: 'RP', name: 'Rheinland-Pfalz' },
  { id: 'SH', name: 'Schleswig-Holstein' },
  { id: 'ST', name: 'Sachsen-Anhalt' },
  { id: 'BB', name: 'Brandenburg' },
  { id: 'MV', name: 'Mecklenburg-Vorpommern' },
  { id: 'SL', name: 'Saarland' },
  { id: 'HB', name: 'Bremen' }
];

const GermanyMap = ({ onSelect }) => {
  return (
    <div className="w-full flex flex-wrap justify-center gap-2 p-4 bg-white shadow rounded mb-4">
      {states.map((state) => (
        <button
          key={state.id}
          onClick={() => onSelect(state.name)}
          className="px-3 py-1 bg-gray-100 hover:bg-blue-200 text-sm rounded border border-gray-300"
        >
          {state.name}
        </button>
      ))}
    </div>
  );
};

export default GermanyMap;
