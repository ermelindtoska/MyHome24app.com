import React from 'react';
import newConstructionImg from '../assets/new-construction.png';
import { FaCheckCircle, FaHome, FaSolarPanel, FaUserShield, FaPhoneAlt } from 'react-icons/fa';

const NewConstructionPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <img
        src={newConstructionImg}
        alt="Neubau Immobilien"
        className="w-full h-[400px] object-contain rounded-xl shadow-md"
      />
      
      <h1 className="text-4xl font-bold text-blue-900 mb-4">Neubau Immobilien in Deutschland</h1>
      <p className="text-gray-800 text-lg mb-6 leading-relaxed">
        Neubauten bieten moderne Architektur, Energieeffizienz und eine langfristige Gewährleistung. 
        Ideal für Käufer*innen, die eine sorgenfreie und zukunftssichere Immobilie suchen.
        Entdecken Sie aktuelle Neubauprojekte mit modernster Ausstattung – vom urbanen Apartment 
        bis zum freistehenden Einfamilienhaus.
      </p>

      <ul className="text-gray-700 space-y-3 mb-8">
        <li className="flex items-start gap-3"><FaSolarPanel className="text-green-500 mt-1" /> <span><strong>Energieeffizienz:</strong> Moderne Wärmedämmung, Solartechnik und niedrige Nebenkosten.</span></li>
        <li className="flex items-start gap-3"><FaHome className="text-orange-500 mt-1" /> <span><strong>Individuelle Gestaltung:</strong> Flexible Grundrisse und smarte Wohnkonzepte.</span></li>
        <li className="flex items-start gap-3"><FaUserShield className="text-purple-600 mt-1" /> <span><strong>Rechtssicherheit:</strong> Erstbezug mit Herstellergarantie & Mängelfreiheit.</span></li>
        <li className="flex items-start gap-3"><FaPhoneAlt className="text-blue-500 mt-1" /> <span><strong>Direkter Kontakt:</strong> Kommunikation direkt mit dem Bauträger – keine Maklergebühren.</span></li>
      </ul>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Tipp: KfW-Förderung nutzen</h2>
        <p className="text-blue-900">Viele Neubauten sind förderfähig – profitieren Sie von attraktiven Finanzierungsmöglichkeiten.</p>
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold text-blue-900 mb-4">Bereit für Ihr neues Zuhause?</p>
        <button className="px-6 py-3 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800 transition duration-200">
          Jetzt entdecken
        </button>
      </div>
    </div>
  );
};

export default NewConstructionPage;
