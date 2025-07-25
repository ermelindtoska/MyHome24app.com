// src/pages/Unauthorized.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

const Unauthorized = () => {
  const { t } = useTranslation('unauthorized');

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
        <div className="flex justify-center mb-4">
          <ExclamationCircleIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t("description")}
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
