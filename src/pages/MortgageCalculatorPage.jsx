import React from 'react';

const MortgageCalculatorPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Hypothekenrechner</h1>
      <p className="text-gray-700 mb-4">
        Nutzen Sie unseren Hypothekenrechner, um Ihre monatlichen Raten zu berechnen.
        Geben Sie Kaufpreis, Eigenkapital, Zinssatz und Laufzeit ein, um einen Überblick zu erhalten.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Individuelle Eingabe von Eckdaten</li>
        <li>Berechnung von Monatsrate und Gesamtkosten</li>
        <li>Berücksichtigung von Tilgung und Zinsen</li>
        <li>Ideal zur Vorbereitung eines Finanzierungsgesprächs</li>
      </ul>
    </div>
  );
};

export default MortgageCalculatorPage;
