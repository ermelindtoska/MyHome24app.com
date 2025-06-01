import React from 'react';
import bankPartnerImg from '../assets/bank-partners.png';
import logo from '../assets/logo.png';

const BankPartnersPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="relative mb-8">
        <img
          src={bankPartnerImg}
          alt="Bankpartner"
          className="w-full h-[500px] object-cover object-top rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Vertrauenswürdige Bankpartner für Ihre Finanzierung</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Unsere Partnerbanken bieten Ihnen attraktive Finanzierungsmöglichkeiten, persönliche Beratung und schnelle Kreditentscheidungen.
        Ob Baufinanzierung oder Anschlussfinanzierung – hier finden Sie starke Partner an Ihrer Seite.
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><strong>Individuelle Angebote:</strong> maßgeschneiderte Finanzierungslösungen</li>
        <li><strong>Zuverlässigkeit:</strong> Zusammenarbeit mit etablierten Bankinstituten</li>
        <li><strong>Transparenz:</strong> klare Konditionen und nachvollziehbare Angebote</li>
        <li><strong>Beratung:</strong> persönliche Ansprechpartner mit Expertise</li>
      </ul>

      <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-md shadow-sm">
        <h2 className="text-green-800 font-semibold mb-2">Tipp:</h2>
        <p className="text-gray-700">
          Nutzen Sie unseren Bankenvergleich, um das passende Angebot für Ihre Situation zu finden – schnell, unkompliziert und unverbindlich.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          Jetzt Partnerbanken entdecken
        </button>
      </div>
    </div>
  );
};

export default BankPartnersPage;
