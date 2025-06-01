import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';

const HelpFaqPage = () => {
  const { t } = useTranslation('hilfe');

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="flex items-center gap-3 mb-6">
        <FaQuestionCircle className="text-3xl text-blue-600" />
        <h1 className="text-3xl font-bold">{t('hilfeFaq')}</h1>
      </div>

      <div className="bg-white shadow-md p-6 rounded space-y-4 text-gray-700">
        <div>
          <strong>Wie registriere ich mich?</strong>
          <p className="ml-2">Gehen Sie zur Anmeldeseite und folgen Sie den Anweisungen.</p>
        </div>
        <div>
          <strong>Ist die Nutzung kostenlos?</strong>
          <p className="ml-2">Ja, die grundlegenden Funktionen sind kostenfrei.</p>
        </div>
        <div>
          <strong>Wie lösche ich mein Konto?</strong>
          <p className="ml-2">Kontaktieren Sie unseren Support unter hilfe@myhome24app.com.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpFaqPage;
