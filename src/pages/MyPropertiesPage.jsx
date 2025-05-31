import React from 'react';

const MyPropertiesPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Meine Immobilien</h1>
      <p className="text-gray-700 mb-4">
        Verwalten Sie alle Ihre aktiven und archivierten Immobilienanzeigen an einem Ort.
        Behalten Sie den Überblick über Status, Anfragen und Statistiken.
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Anzeige bearbeiten oder löschen</li>
        <li>Anfragen und Kontaktaufnahmen einsehen</li>
        <li>Status ändern: aktiv, pausiert, beendet</li>
        <li>Statistiken zur Performance Ihrer Anzeige</li>
      </ul>
    </div>
  );
};

export default MyPropertiesPage;
