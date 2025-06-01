import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaRocket } from 'react-icons/fa';

const HelpHowItWorksPage = () => {
  const { t } = useTranslation('hilfe');

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <div className="flex items-center gap-3 mb-6">
        <FaRocket className="text-3xl text-blue-600" />
        <h1 className="text-3xl font-bold">{t('hilfeHowItWorks')}</h1>
      </div>

      <div className="bg-white p-6 rounded shadow text-gray-700 space-y-4">
        <p>
          MyHome24App bietet eine moderne, benutzerfreundliche Plattform für den Immobilienmarkt:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>🔍 Durchsuchen Sie Immobilien nach Stadt, PLZ oder Kategorie.</li>
          <li>⭐ Speichern Sie Favoriten und verwalten Sie alles in Ihrem Dashboard.</li>
          <li>📩 Kontaktieren Sie Eigentümer oder Makler direkt über das System.</li>
          <li>📝 Veröffentlichen Sie Ihre Anzeige in wenigen Minuten.</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpHowItWorksPage;
