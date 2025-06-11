// Datenschutz.jsx – Faqja e Politikës së Privatësisë për MyHome24App
import React from 'react';
import { useTranslation } from 'react-i18next';

const Datenschutz = () => {
  const { t } = useTranslation('privacy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>

      <p className="mb-6">{t('intro')}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('responsibleTitle')}</h2>
      <p className="mb-4">{t('responsibleText')}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('dataTypesTitle')}</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>{t('dataType1')}</li>
        <li>{t('dataType2')}</li>
        <li>{t('dataType3')}</li>
        <li>{t('dataType4')}</li>
        <li>{t('dataType5')}</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('usePurposeTitle')}</h2>
      <p className="mb-4">{t('usePurposeText')}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('legalBasisTitle')}</h2>
      <p className="mb-4">{t('legalBasisText')}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('dataSharingTitle')}</h2>
      <p className="mb-4">{t('dataSharingText')}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('thirdPartyTitle')}</h2>
      <p className="mb-4">{t('thirdPartyText')}</p>
      <ul className="list-disc list-inside space-y-2">
        <li>{t('thirdParty1')}</li>
        <li>{t('thirdParty2')}</li>
        <li>{t('thirdParty3')}</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('cookiesTitle')}</h2>
      <p className="mb-4">{t('cookiesText')}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('rightsTitle')}</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>{t('rightAccess')}</li>
        <li>{t('rightCorrection')}</li>
        <li>{t('rightDeletion')}</li>
        <li>{t('rightRestriction')}</li>
        <li>{t('rightObjection')}</li>
        <li>{t('rightPortability')}</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">{t('contactTitle')}</h2>
      <p className="mb-4">{t('contactText')}</p>

      <div className="mt-16 text-center">
        <a
          href="/impressum"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          {t('toImpressum') || 'Zum Impressum'}
        </a>
        <div className="mt-4">
          <a
            href="/datenschutz"
            className="inline-block text-blue-600 underline hover:text-blue-800 transition"
          >
            {t('toPrivacy') || 'Zur Datenschutzerklärung'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;
