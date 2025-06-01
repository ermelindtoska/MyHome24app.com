import React from 'react';
import rateAgentImg from '../assets/rate-agent.png';
import logo from '../assets/logo.png';

const RateAgentPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Foto + Logo */}
      <div className="relative mb-8">
        <img
          src={rateAgentImg}
          alt="Makler bewerten"
          className="w-full h-[600px] object-cover object-top rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      {/* Titulli */}
      <h1 className="text-3xl font-bold text-red-600 mb-6">Makler bewerten</h1>

      {/* Përshkrimi */}
      <p className="text-gray-800 mb-4 leading-relaxed">
        Ihre Meinung zählt! Bewerten Sie Ihre Erfahrungen mit Immobilienmakler*innen und helfen Sie anderen bei ihrer Entscheidung.
        Ob Sie eine Immobilie gekauft, verkauft oder gemietet haben – Ihr Feedback trägt zu mehr Transparenz auf dem Immobilienmarkt bei.
      </p>

      {/* Listë me piketa */}
      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Vertrauen schaffen:</strong> Teilen Sie Ihre ehrliche Meinung über Service, Kompetenz und Kommunikation.</li>
        <li><strong>Andere unterstützen:</strong> Ihre Bewertung hilft anderen Interessent*innen, den passenden Makler zu finden.</li>
        <li><strong>Einfach und schnell:</strong> In wenigen Minuten eine Bewertung abgeben.</li>
        <li><strong>Fair bleiben:</strong> Objektivität und Sachlichkeit sind erwünscht.</li>
      </ul>

      {/* Këshillë */}
      <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-md shadow-sm">
        <h2 className="text-red-700 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Nutzen Sie die Möglichkeit, nicht nur Kritik, sondern auch Lob zu äußern – gute Makler verdienen Anerkennung!
        </p>
      </div>

      {/* Buton */}
      <div className="mt-10 text-center">
        <button className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition">
          Jetzt Makler bewerten
        </button>
      </div>
    </div>
  );
};

export default RateAgentPage;
