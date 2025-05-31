import React from 'react';

const MortgagePartnersPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Unsere Bankpartner</h1>
      <p className="text-gray-700 mb-4">
        MyHome24App arbeitet mit einer Vielzahl von seriösen Banken und Finanzierungsinstituten zusammen.
        Finden Sie den richtigen Partner für Ihre Immobilienfinanzierung.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Vergleich von Hypothekenzinsen</li>
        <li>Direktkontakt zu Finanzierungsberatern</li>
        <li>Unterstützung bei Anträgen und Unterlagen</li>
        <li>Exklusive Angebote für MyHome24App-Nutzer*innen</li>
      </ul>
    </div>
  );
};

export default MortgagePartnersPage;
