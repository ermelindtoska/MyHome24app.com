import React from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope } from "react-icons/fa";

const ContactSection = () => {
  const { t } = useTranslation("home");

  return (
    <section className="bg-white dark:bg-gray-900 py-20 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto text-center border-4 border-blue-600 rounded-2xl p-8 shadow-lg">
        <FaEnvelope className="text-4xl text-blue-600 mb-4 mx-auto animate-pulse" />
        <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t("contactTitle")}</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{t("contactText")}</p>
        <a href="mailto:kontakt@myhome24app.com" className="text-blue-600 text-lg font-medium hover:underline">
          kontakt@myhome24app.com
        </a>
      </div>
    </section>
  );
};

export default ContactSection;
