// src/pages/FaqPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdQuestionAnswer, MdHelp } from 'react-icons/md';

const FaqPage = () => {
  const { t } = useTranslation('faq');
  const questions = t('questions', { returnObjects: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Helmet>
        <title>{t('meta.title')} – MyHome24App</title>
        <meta name="description" content={t('meta.description')} />
      </Helmet>

      <h1 className="text-3xl font-bold flex items-center mb-6">
        <MdQuestionAnswer className="text-blue-600 mr-2" />
        {t('title')}
      </h1>
      <p className="text-gray-700 mb-8">{t('intro')}</p>

      <div className="space-y-6">
        {questions.map((item, index) => (
          <div key={index} className="bg-white shadow p-6 rounded">
            <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
            <p className="mb-4 flex items-start">
              <MdHelp className="text-blue-600 mt-1 mr-2" />
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
