import React from 'react';

const AgentRatePage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Makler bewerten</h1>
      <p className="text-gray-700 mb-4">
        Teilen Sie Ihre Erfahrungen mit Immobilienmakler*innen, um anderen Nutzer*innen zu helfen.
        Bewertungen schaffen Transparenz und Vertrauen.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Sternebewertung und Freitext möglich</li>
        <li>Nur verifizierte Nutzer*innen können bewerten</li>
        <li>Makler*innen können auf Bewertungen reagieren</li>
        <li>Qualitätssicherung durch unser Support-Team</li>
      </ul>
    </div>
  );
};

export default AgentRatePage;
