import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdSearch, MdChecklist, MdLocationOn, MdVerified, MdPersonSearch } from 'react-icons/md';
import agentSearchImg from '../assets/agent-search.png';
import logo from '../assets/logo.png';

const AgentSearchPage = () => {
  const { t } = useTranslation('agent');

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Helmet>
        <title>{t('title')} – MyHome24app</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      <div className="relative mb-8">
        <img
          src={agentSearchImg}
          alt="Maklersuche"
          className="w-full h-[500px] object-cover object-top rounded-xl shadow-md"
        />
        <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-12 w-auto"
        />
      </div>

      <h1 className="text-3xl font-bold text-green-700 mb-6 flex items-center">
        <MdPersonSearch className="text-green-700 mr-2" />
        {t('title')}
      </h1>

      <p className="text-gray-800 mb-4 leading-relaxed">
        {t('intro')}
      </p>

      <ul className="list-disc list-inside text-gray-800 space-y-2">
        <li><MdVerified className="inline text-green-600 mr-1" /> {t('point1')}</li>
        <li><MdLocationOn className="inline text-green-600 mr-1" /> {t('point2')}</li>
        <li><MdChecklist className="inline text-green-600 mr-1" /> {t('point3')}</li>
        <li><MdSearch className="inline text-green-600 mr-1" /> {t('point4')}</li>
      </ul>

      <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-md shadow-sm">
        <h2 className="text-green-800 font-semibold mb-2">{t('tipTitle')}</h2>
        <p className="text-gray-700">{t('tipText')}</p>
      </div>

      <div className="mt-10 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          {t('button')}
        </button>
      </div>
    </div>
  );
};

export default AgentSearchPage;
