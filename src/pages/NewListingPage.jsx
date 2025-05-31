import React from 'react';

const NewListingPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Neue Anzeige</h1>
      <p className="text-gray-700 mb-4">
        Hier können Sie eine neue Immobilienanzeige erstellen und veröffentlichen.
        Fügen Sie alle relevanten Informationen und Fotos hinzu, um Käufer*innen oder Mieter*innen zu erreichen.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Titel, Beschreibung, Preis und Lage eingeben</li>
        <li>Bilder und Grundrisse hochladen</li>
        <li>Veröffentlichung sofort oder geplant</li>
        <li>Kategorie: Kauf / Miete / Gewerbe</li>
      </ul>
    </div>
  );
};

export default NewListingPage;
