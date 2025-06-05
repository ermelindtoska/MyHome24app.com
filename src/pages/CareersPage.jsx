import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdWork } from 'react-icons/md';

const CareersPage = () => {
  const { t } = useTranslation('careers');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Helmet>
        <title>{t('careers')} – MyHome24</title>
        <meta name="description" content="Karrieremöglichkeiten bei MyHome24" />
      </Helmet>

      <div className="flex items-center mb-4">
        <MdWork className="text-blue-600 text-2xl mr-2" />
        <h1 className="text-3xl font-bold">{t('careers')}</h1>
      </div>

      <div className="flex items-start gap-2 text-gray-700">
        <MdWork className="text-blue-500 mt-1" />
        <p>
          Wir suchen immer nach talentierten Menschen, die unser Team verstärken möchten.
          Schau dir unsere aktuellen Stellenangebote an und werde Teil von MyHome24app.
        </p>
      </div>
    </div>
  );
};

export default CareersPage;
