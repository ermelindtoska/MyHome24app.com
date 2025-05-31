import React from 'react';

const BannerAdvertisingPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Bannerwerbung</h1>
      <p className="text-gray-700 mb-4">
        Platzieren Sie Ihre Bannerwerbung gezielt auf unserer Plattform und erreichen Sie tausende potenzielle Kund*innen täglich.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Verschiedene Bannerformate verfügbar (Header, Sidebar, Footer)</li>
        <li>Regionale oder thematische Aussteuerung möglich</li>
        <li>Laufzeiten ab 7 Tagen buchbar</li>
        <li>Statistikübersicht zu Klicks und Impressionen</li>
      </ul>
    </div>
  );
};

export default BannerAdvertisingPage;
