import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdGavel } from 'react-icons/md';

const TermsPage = () => {
  const { t } = useTranslation('footer');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Helmet>
        <title>{t('termsOfUse')} – MyHome24</title>
        <meta name="description" content="Unsere Nutzungsbedingungen für die Verwendung der MyHome24-Plattform." />
      </Helmet>

      <div className="flex items-center mb-4">
        <MdGavel className="text-blue-600 text-2xl mr-2" />
        <h1 className="text-3xl font-bold">{t('termsOfUse')}</h1>
      </div>

      <div className="flex items-start gap-2 text-gray-700">
        <MdGavel className="text-blue-500 mt-1" />
        <p>
          Unsere Nutzungsbedingungen beschreiben die Regeln und Richtlinien für die Nutzung unserer Dienste.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
