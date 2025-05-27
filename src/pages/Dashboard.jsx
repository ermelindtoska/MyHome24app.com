import React from "react";
import { useTranslation } from "react-i18next";
import DashboardPage from "./DashboardPage";

const Dashboard = ({ onAdd }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="bg-white p-4 rounded shadow text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("dashboard.welcome")}</h1>
        <p className="text-gray-600">{t("dashboard.message")}</p>
      </div>
      <DashboardPage onAdd={onAdd} />
    </div>
  );
};

export default Dashboard;
