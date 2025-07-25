// src/roles/RequireRole.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { RoleContext } from './RoleContext';
import { useTranslation } from 'react-i18next';

const RequireRole = ({ allowedRoles, children }) => {
  const { currentUserRole, loading, user } = useContext(RoleContext);
  const { t } = useTranslation();
  const location = useLocation();

  // Ende duke ngarkuar rolin
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-lg font-medium text-gray-700 dark:text-gray-200 animate-pulse">
          {t('loading')}
        </div>
      </div>
    );
  }

  // Nëse nuk jemi të loguar
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nëse roli i përdoruesit nuk është i lejuar
  if (!allowedRoles.includes(currentUserRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">
            {t('unauthorized.title', { ns: 'auth' })}
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            {t('unauthorized.message', { ns: 'auth' })}
          </p>
        </div>
      </div>
    );
  }

  // Nëse gjithçka është në rregull
  return children;
};

export default RequireRole;
