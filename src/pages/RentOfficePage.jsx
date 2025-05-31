import React from 'react';

const RentOfficePage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Büro / Gewerbe mieten</h1>
      <p className="text-gray-700 mb-4">
        Finden Sie passende Gewerbeimmobilien wie Büros, Ladenflächen oder Praxisräume zur Miete.
        Für Start-ups, Freiberufler*innen und etablierte Unternehmen.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Flexible Büroflächen ab 20 m²</li>
        <li>Mit Infrastruktur und Parkmöglichkeiten</li>
        <li>Innenstadtlagen und Gewerbeparks</li>
        <li>Direkt vom Eigentümer oder über Gewerbemakler</li>
      </ul>
    </div>
  );
};

export default RentOfficePage;
