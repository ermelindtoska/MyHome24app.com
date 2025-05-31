import React from 'react';

const NewConstructionPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Neubau</h1>
      <p className="text-gray-700 mb-4">
        Hier finden Sie eine Auswahl an Neubauimmobilien in verschiedenen Regionen Deutschlands.
        Entdecken Sie moderne Wohnungen und Häuser, die sich noch in der Bauphase befinden oder kürzlich fertiggestellt wurden.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Projekte mit energieeffizienter Bauweise</li>
        <li>Flexible Grundrisse und moderne Ausstattung</li>
        <li>Erstbezug mit voller Gewährleistung</li>
        <li>Kontaktaufnahme direkt mit dem Bauträger</li>
      </ul>
    </div>
  );
};

export default NewConstructionPage;
