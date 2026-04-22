// src/pages/Dashboard.jsx

import React from "react";
import { useTranslation } from "react-i18next";
import { MdDashboard } from "react-icons/md";
import DashboardPage from "./DashboardPage";

const Dashboard = ({ onAdd }) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 px-4 py-8">

      <div className="max-w-6xl mx-auto">

        {/* HERO DASHBOARD */}
        <div className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl">
              <MdDashboard />
            </div>

            <div className="flex-1">

              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {t("welcome")}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl">
                {t("message")}
              </p>

            </div>

          </div>

        </div>

        {/* DASHBOARD CONTENT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-4 md:p-6">

          <DashboardPage onAdd={onAdd} />

        </div>

      </div>
    </div>
  );
};

export default Dashboard;