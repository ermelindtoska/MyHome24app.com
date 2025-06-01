import React from 'react';
import foreclosureHeader from '../assets/foreclosure-header.png'; // e siguruar më herët

const ForeclosurePage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Image */}
      <div className="rounded-xl overflow-hidden shadow-md mb-20">
        <img
          src={foreclosureHeader}
          alt="Zwangsversteigerungen in Deutschland"
          className="w-full h-[400px] object-contain rounded-xl shadow-md"
        />
      </div>

      {/* Main Content */}
      <h1 className="text-3xl font-extrabold text-red-700 mb-4">Zwangsversteigerungen</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Entdecken Sie einzigartige Möglichkeiten, Immobilien unter dem Marktwert zu erwerben. 
        Im Rahmen von Zwangsversteigerungen haben Sie die Chance, Häuser, Wohnungen oder Grundstücke 
        zu einem attraktiven Preis zu kaufen – ideal für Investoren, Eigennutzer*innen und Kapitalanleger.
      </p>

      <ul className="list-disc list-inside space-y-2 text-gray-800">
        <li><strong>Vielfältige Objekte:</strong> Wohnungen, Häuser und Grundstücke im gerichtlichen Verfahren</li>
        <li><strong>Transparente Termine:</strong> Einblicke in alle Versteigerungstermine und Bewertungsunterlagen</li>
        <li><strong>Wichtige Hinweise:</strong> Mindestgebote, Finanzierungstipps und rechtliche Aspekte</li>
        <li><strong>Direkter Kontakt:</strong> Kontakt zu Amtsgerichten und Insolvenzverwaltern – keine Maklerprovision</li>
      </ul>

      {/* Info Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700 mb-2">🔎 Tipp für Interessenten</h2>
        <p className="text-gray-700">
          Viele Immobilien aus Zwangsversteigerungen sind deutlich günstiger als der Marktpreis – 
          aber es ist wichtig, sich gut vorzubereiten. Wir unterstützen Sie mit Informationen, Checklisten 
          und Expertennetzwerk.
        </p>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <h3 className="text-blue-800 font-bold text-xl mb-2">Bereit für Ihre nächste Investition?</h3>
        <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition">
          Jetzt Objekte entdecken
        </button>
      </div>
    </div>
  );
};

export default ForeclosurePage;
