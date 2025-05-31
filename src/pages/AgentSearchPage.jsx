import React from 'react';

const AgentSearchPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Maklersuche</h1>
      <p className="text-gray-700 mb-4">
        Finden Sie erfahrene Immobilienmakler*innen in Ihrer Region.
        Filtern Sie nach Standort, Spezialisierung und Kundenbewertungen.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Makler*innen für Kauf, Miete oder Gewerbe</li>
        <li>Mit geprüften Referenzen und Kundenfeedback</li>
        <li>Direkte Kontaktmöglichkeit über MyHome24App</li>
        <li>Regional sortiert und einfach vergleichbar</li>
      </ul>
    </div>
  );
};

export default AgentSearchPage;
