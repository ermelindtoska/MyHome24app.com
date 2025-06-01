import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaPhoneAlt } from 'react-icons/fa';

const HelpSupportPage = () => {
  const { t } = useTranslation('help');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Support</h1>
         <h1 className="text-3xl font-bold mb-4">{t('supportTitle')}</h1>
      <p className="text-gray-700">{t('supportIntro')}</p>
         <p className="text-gray-700 mb-4">
        Our support team is here to help you with any questions or issues you may have.
      </p>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">Frequently Asked Topics:</h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-1">
        <li>Account setup and login help</li>
        <li>Troubleshooting listing errors</li>
        <li>How to contact an agent</li>
        <li>Managing your profile</li>
        <li>Requesting technical assistance</li>
      </ul>

      <p className="mt-6 text-gray-700">
        For further help, please email us at{' '}
        <a href="mailto:support@myhome24app.com" className="text-blue-600 underline">
          support@myhome24app.com
        </a>
        .
      </p>
      <div className="flex items-center gap-3 mb-6">
        <FaPhoneAlt className="text-2xl text-blue-600" />
        <h1 className="text-3xl font-bold">{t('hilfeSupport')}</h1>
      </div>

      <div className="bg-white p-6 rounded shadow text-gray-700 space-y-4">
        <p>Sie haben Fragen oder brauchen Hilfe?</p>
        <ul className="space-y-2">
          <li><strong>E-Mail:</strong> hilfe@myhome24app.com</li>
          <li><strong>Telefon:</strong> +49 123 4567890</li>
          <li><strong>Supportzeiten:</strong> Mo–Fr, 9:00 – 17:00 Uhr</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpSupportPage;
