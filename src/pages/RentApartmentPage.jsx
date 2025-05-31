import React from 'react';

const RentApartmentPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Wohnung mieten</h1>
      <p className="text-gray-700 mb-4">
        Finden Sie Ihre neue Mietwohnung – ob in der Stadt, am Stadtrand oder auf dem Land.
        Unser Angebot umfasst moderne, renovierte und preiswerte Wohnungen in ganz Deutschland.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>1- bis 4-Zimmer-Wohnungen verfügbar</li>
        <li>Mit Balkon, Garten oder Dachterrasse</li>
        <li>Einzugsbereit oder nach Renovierung</li>
        <li>Langfristige und kurzfristige Mietverträge</li>
      </ul>
    </div>
  );
};

export default RentApartmentPage;
