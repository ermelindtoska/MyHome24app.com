import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-10">
      <p>{t('footer.contact')}: info@myhome24.de | © 2025 MyHome24.de</p>
    </footer>
  );
};

export default Footer;
