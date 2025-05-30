import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation('footer');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('contact')}</h1>
      <p className="text-gray-700">Du kannst uns jederzeit unter kontakt@myhome24app.com erreichen.</p>
    </div>
  );
};

export default ContactPage;
