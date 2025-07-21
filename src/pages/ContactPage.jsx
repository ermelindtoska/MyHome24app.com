import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';

const ContactPage = () => {
  const { t } = useTranslation('contact');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Helmet>
        <title>{t('title')} – MyHome24app</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      <div className="flex items-center mb-4">
        <MdEmail className="text-blue-600 text-2xl mr-2" />
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <p className="text-gray-700 mb-6">{t('description')}</p>

      <div className="space-y-4 text-gray-700">
        <div className="flex items-center">
          <MdEmail className="text-blue-500 mr-2" />
          <a href="mailto:kontakt@myhome24app.com" className="text-blue-600 hover:underline">
            kontakt@myhome24app.com
          </a>
        </div>
        <div className="flex items-center">
          <MdPhone className="text-blue-500 mr-2" />
          <span>+49 30 12345678</span>
        </div>
        <div className="flex items-center">
          <MdLocationOn className="text-blue-500 mr-2" />
          <span>Beispielstraße 12, 10115 Berlin, Deutschland</span>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
