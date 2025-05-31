import React from 'react';

const ForeclosurePage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-red-700 mb-6">Zwangsversteigerungen</h1>
      <p className="text-gray-700 mb-4">
        Hier finden Sie Immobilien, die im Rahmen von Zwangsversteigerungen angeboten werden.
        Dies ist eine Gelegenheit, Objekte zu einem günstigen Preis zu erwerben – mit entsprechender Vorbereitung.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Wohnungen, Häuser und Grundstücke im Versteigerungsverfahren</li>
        <li>Transparente Versteigerungstermine und Bewertungsunterlagen</li>
        <li>Hinweise zu Mindestgeboten und Finanzierung</li>
        <li>Kontakt zum zuständigen Amtsgericht oder Insolvenzverwalter</li>
      </ul>
    </div>
  );
};

export default ForeclosurePage;
