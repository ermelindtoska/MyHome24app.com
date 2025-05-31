import React from 'react';

const PremiumListingPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Premium-Listing</h1>
      <p className="text-gray-700 mb-4">
        Heben Sie Ihre Immobilienanzeige hervor und erreichen Sie mehr Aufmerksamkeit durch unsere Premium-Platzierung.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Anzeige erscheint oben in Suchergebnissen</li>
        <li>Premium-Label und visuelle Hervorhebung</li>
        <li>Mehr Klicks und Kontaktanfragen garantiert</li>
        <li>Buchbar pro Woche oder Monat</li>
      </ul>
    </div>
  );
};

export default PremiumListingPage;
