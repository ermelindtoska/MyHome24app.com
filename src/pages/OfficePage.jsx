import React from 'react';
import officeImg from '../assets/office-space.png';
import logo from '../assets/logo.png';

const OfficePage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={officeImg}
          alt="Büro und Gewerbeflächen"
          className="w-full h-[800px] object-contain rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-blue-700 mb-6">Moderne Büro- und Gewerbeflächen</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Entdecken Sie attraktive Büro- und Gewerbeeinheiten in verschiedenen Größen und Lagen. Ideal für Startups, Agenturen,
        Praxen oder etablierte Unternehmen, die einen neuen Standort suchen.
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Flexibel:</strong> Verschiedene Größen – vom Einzelbüro bis zum Großraumbüro</li>
        <li><strong>Standortvorteil:</strong> Citylage, Gewerbeparks, gute Verkehrsanbindung</li>
        <li><strong>Ausstattung:</strong> Moderne Infrastruktur, Glasfaser-Internet, Klimaanlage</li>
        <li><strong>Sofort bezugsfertig:</strong> Viele Objekte sind sofort nutzbar oder flexibel anpassbar</li>
      </ul>

      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-md shadow-sm">
        <h2 className="text-blue-800 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Berücksichtigen Sie bei der Auswahl auch Parkmöglichkeiten, Nähe zu Kund*innen sowie Erweiterungspotenzial für die Zukunft.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          Jetzt Büroflächen entdecken
        </button>
      </div>
    </div>
  );
};

export default OfficePage;
