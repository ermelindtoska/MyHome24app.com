// src/pages/Dashboard.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-2">{t("dashboard.welcome")}</h1>
        <p className="text-gray-600">{t("dashboard.message")}</p>
      </div>
    </div>
  );
};

export default Dashboard;
