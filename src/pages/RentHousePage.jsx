import React from 'react';

const RentHousePage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Haus mieten</h1>
      <p className="text-gray-700 mb-4">
        Entdecken Sie freistehende Einfamilienhäuser, Doppelhaushälften und Reihenhäuser zur Miete.
        Ideal für Familien oder Menschen, die mehr Platz benötigen.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Mit Garten, Terrasse oder Garage</li>
        <li>Ruhige Wohnlagen & familienfreundliche Umgebung</li>
        <li>Option auf Mietkauf oder langfristige Verträge</li>
        <li>Provisionsfrei von Eigentümer*innen oder mit Makler</li>
      </ul>
    </div>
  );
};

export default RentHousePage;
