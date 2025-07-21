import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';


const RegisterSuccess = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow rounded text-center dark:bg-gray-800 dark:text-white">
      <Helmet>
        <title>{t("registerSuccessTitle")}</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">{t("registerSuccessHeading")}</h1>
      <p className="mb-4">{t("registerSuccessMessage")}</p>
      <p className="mb-6">{t("registerSuccessInstruction")}</p>
      <Link to="/login" className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
        {t("goToLogin")}
      </Link>
    </div>
  );
};

export default RegisterSuccess;
