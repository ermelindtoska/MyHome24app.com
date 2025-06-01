import React from 'react';
import calculatorImg from '../assets/mortgage-calculator.png';
import logo from '../assets/logo.png';

const MortgageCalculatorPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={calculatorImg}
          alt="Hypothekenrechner"
          className="w-full h-[700px] object-contain rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-blue-800 mb-6">Hypothekenrechner</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Berechnen Sie schnell und einfach Ihre monatliche Kreditrate. Unser Hypothekenrechner hilft Ihnen,
        Ihre Finanzierung besser zu planen – egal ob Sie kaufen, bauen oder modernisieren möchten.
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Flexibel:</strong> Geben Sie Kaufpreis, Eigenkapital, Zinssatz und Laufzeit ein</li>
        <li><strong>Transparenz:</strong> Sofortige Anzeige der monatlichen Belastung</li>
        <li><strong>Vergleich:</strong> Verschiedene Szenarien einfach durchspielen</li>
        <li><strong>Planung:</strong> Realistische Einschätzung Ihrer finanziellen Möglichkeiten</li>
      </ul>

      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-md shadow-sm">
        <h2 className="text-blue-800 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Nutzen Sie unseren Rechner, um unterschiedliche Laufzeiten und Zinssätze zu vergleichen. So erhalten Sie
          ein besseres Gefühl für Ihre ideale Finanzierung.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          Jetzt berechnen
        </button>
      </div>
    </div>
  );
};

export default MortgageCalculatorPage;
