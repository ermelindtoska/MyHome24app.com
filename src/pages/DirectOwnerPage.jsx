import React from 'react';

const DirectOwnerPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Direkt vom Eigentümer</h1>
      <p className="text-gray-700 mb-4">
        Entdecken Sie Immobilien, die direkt von den Eigentümer*innen angeboten werden – ganz ohne Maklerprovision.
        Dies bietet oft mehr Transparenz und Verhandlungsspielraum.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Kontakt direkt mit der/dem Eigentümer*in</li>
        <li>Verhandlung auf Augenhöhe</li>
        <li>Oft ohne zusätzliche Maklerkosten</li>
        <li>Details und Unterlagen direkt aus erster Hand</li>
      </ul>
    </div>
  );
};

export default DirectOwnerPage;
