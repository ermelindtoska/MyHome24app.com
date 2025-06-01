import React from 'react';
import ownerHeader from '../assets/owner-header.png'; // Do e gjenerojmë me logon lart djathtas

const OwnerPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Foto header */}
      <div className="rounded-xl overflow-hidden shadow-md mb-8">
        <img
          src={ownerHeader}
          alt="Immobilien direkt vom Eigentümer kaufen"
          className="w-full h-[700px] object-contain rounded-xl shadow-md"
        />
      </div>

      {/* Titulli dhe përmbajtja */}
      <h1 className="text-3xl font-extrabold text-blue-800 mb-4">Direkt vom Eigentümer</h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        Auf MyHome24App finden Sie Immobilienangebote, die direkt von privaten Eigentümer*innen veröffentlicht wurden – ganz ohne Maklerprovision und mit persönlichem Kontakt.
        Diese Objekte bieten oft einen authentischeren Eindruck und mehr Spielraum für individuelle Absprachen.
      </p>

      <ul className="list-disc list-inside space-y-2 text-gray-800">
        <li><strong>Keine Provision:</strong> Direkter Kauf vom Eigentümer spart Maklerkosten</li>
        <li><strong>Persönlicher Kontakt:</strong> Fragen klären Sie direkt mit dem Eigentümer</li>
        <li><strong>Individuelle Vereinbarungen:</strong> Flexiblere Absprachen möglich</li>
        <li><strong>Echte Einblicke:</strong> Eigentümer kennen ihre Immobilie am besten</li>
      </ul>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 shadow-sm">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">💡 Tipp für Interessenten</h2>
        <p className="text-gray-700">
          Verhandeln Sie fair und transparent. Viele Eigentümer schätzen direkte Kommunikation und unkomplizierte Abwicklung – das schafft Vertrauen auf beiden Seiten.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <h3 className="text-blue-800 font-bold text-xl mb-2">Jetzt stöbern und direkt Kontakt aufnehmen</h3>
        <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition">
          Angebote entdecken
        </button>
      </div>
    </div>
  );
};

export default OwnerPage;
