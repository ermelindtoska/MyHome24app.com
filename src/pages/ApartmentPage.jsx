import React from 'react';
import apartmentImg from '../assets/apartment-living.png';
import logo from '../assets/logo.png';

const ApartmentPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
  src={apartmentImg}
  alt="Moderne Wohnungen"
  className="w-full h-[600px] object-contain rounded-xl shadow-md"
/>

        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Moderne Wohnungen zur Miete</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Entdecken Sie eine große Auswahl an stilvollen Wohnungen in attraktiven Lagen. Ob gemütliche Stadtwohnung
        oder großzügiges Loft – hier finden Sie Ihr neues Zuhause mit Komfort, guter Anbindung und moderner Ausstattung.
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Vielfalt:</strong> 1-Zimmer, Familienwohnungen, barrierefreie Optionen</li>
        <li><strong>Lage:</strong> Top-Infrastruktur, Nahverkehr, Einkaufsmöglichkeiten</li>
        <li><strong>Komfort:</strong> Aufzug, Balkon, Einbauküche, smarte Haustechnik</li>
        <li><strong>Service:</strong> Ansprechpartner direkt vor Ort, einfacher Mietprozess</li>
      </ul>

      <div className="mt-8 bg-indigo-50 border border-indigo-200 p-6 rounded-md shadow-sm">
        <h2 className="text-indigo-800 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Nutzen Sie Filtermöglichkeiten bei der Suche, um Ihre perfekte Wohnung schneller zu finden – z. B. nach Größe,
          Preis, Ausstattung oder Haustierfreundlichkeit.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition">
          Jetzt Wohnungen entdecken
        </button>
      </div>
    </div>
  );
};

export default ApartmentPage;
