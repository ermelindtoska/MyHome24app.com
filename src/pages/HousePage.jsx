import React from 'react';
import houseImg from '../assets/house-living.png';
import logo from '../assets/logo.png';

const HousePage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={houseImg}
          alt="Haus zur Miete"
          className="w-full h-[800px] object-contain rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Familienfreundliche Häuser zur Miete</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Finden Sie Ihr neues Zuhause in einem geräumigen Haus – perfekt für Familien oder alle, die mehr Platz und Privatsphäre wünschen. Unsere Mietangebote bieten komfortables Wohnen in attraktiven Wohngegenden.
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Geräumigkeit:</strong> Mehrere Zimmer, Garten und Stellplatz</li>
        <li><strong>Privatsphäre:</strong> Eigener Eingang, keine direkten Nachbarn</li>
        <li><strong>Familienfreundlich:</strong> In der Nähe von Schulen, Spielplätzen und Parks</li>
        <li><strong>Flexibilität:</strong> Oft mit Keller, Dachboden oder zusätzlichem Büro</li>
      </ul>

      <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-md shadow-sm">
        <h2 className="text-green-800 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Vergleichen Sie verschiedene Stadtteile und nutzen Sie unsere Filteroptionen für Haustierhaltung, Garten, Garagen und mehr.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          Jetzt Häuser entdecken
        </button>
      </div>
    </div>
  );
};

export default HousePage;
