import React from 'react';
import agentSearchImg from '../assets/agent-search.png';
import logo from '../assets/logo.png';

const AgentSearchPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={agentSearchImg}
          alt="Maklersuche"
          className="w-full h-[500px] object-cover object-top rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Finden Sie den richtigen Immobilienmakler</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Die Suche nach dem passenden Makler*in kann entscheidend sein für den Erfolg Ihrer Immobilienpläne. Unsere Plattform
        bietet Ihnen die Möglichkeit, qualifizierte, geprüfte und lokal erfahrene Makler*innen zu finden – ganz nach Ihren Bedürfnissen.
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Geprüfte Makler*innen:</strong> Zertifiziert, erfahren und transparent bewertet</li>
        <li><strong>Lokale Expertise:</strong> Makler*innen mit tiefem Verständnis für Ihre Region</li>
        <li><strong>Kostenfreie Vermittlung:</strong> Kein Risiko – Sie entscheiden, wer Sie begleitet</li>
        <li><strong>Individuelle Beratung:</strong> Persönlich, diskret und zielgerichtet</li>
      </ul>

      <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-md shadow-sm">
        <h2 className="text-green-800 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Achten Sie bei der Wahl Ihres Maklers auf Bewertungen, regionale Erfahrung und Spezialisierungen. Die richtige Unterstützung spart Zeit und Geld.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          Jetzt Makler finden
        </button>
      </div>
    </div>
  );
};

export default AgentSearchPage;
