import React from 'react';
import { useTranslation } from 'react-i18next';

function AgentDashboard() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          {t('agent_dashboard_title')}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {t('agent_dashboard_welcome')}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t('total_listings')}</h2>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t('pending_approvals')}</h2>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t('messages')}</h2>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">7</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t('reviews')}</h2>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">24</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('quick_actions')}</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              {t('add_listing')}
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded">
              {t('view_messages')}
            </button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded">
              {t('manage_reviews')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
