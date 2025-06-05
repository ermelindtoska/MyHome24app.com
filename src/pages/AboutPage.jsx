import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { FaInfoCircle } from 'react-icons/fa';

const AboutPage = () => {
  const { t } = useTranslation('footer');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Helmet>
        <title>{t('aboutUs')} – MyHome24</title>
        <meta name="description" content="{t('aboutUsDescription')}" />
      </Helmet>

      <div className="flex items-center mb-4">
        <FaInfoCircle className="text-blue-600 text-2xl mr-2" />
        <h1 className="text-3xl font-bold">{t('aboutUs')}</h1>
      </div>

      <p className="mb-4 text-gray-700">
        MyHome24app ist eine moderne Plattform, die Menschen in ganz Deutschland hilft, Immobilien einfach zu finden und zu verwalten. Ob Sie eine Wohnung mieten oder ein Haus verkaufen möchten – wir bieten die richtigen Tools.
      </p>
      <p className="mb-4 text-gray-700">
        Unsere Mission ist es, Immobilien transparent und zugänglich zu machen. Mit Funktionen wie Filter, Favoriten, Nachrichten und Benutzer-Dashboards bieten wir ein benutzerfreundliches Erlebnis.
      </p>
      <p className="mb-4 text-gray-700">
        Wir verbessern uns ständig und freuen uns über Ihr Feedback, um die Plattform weiterzuentwickeln.
      </p>

      <p className="text-sm text-gray-500 mt-6">© {new Date().getFullYear()} MyHome24app. Alle Rechte vorbehalten.</p>
    </div>
  );
};

export default AboutPage;
