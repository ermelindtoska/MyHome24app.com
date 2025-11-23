// src/components/profile/AccountSidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const AccountSidebar = ({ activeTab }) => {
  const { t } = useTranslation("profile");

  const itemClasses = (isActive) =>
    `w-full text-left px-4 py-2 rounded-xl text-sm font-medium mb-2 transition
     ${
       isActive
         ? "bg-blue-600 text-white shadow"
         : "bg-gray-900/40 text-gray-200 hover:bg-gray-800"
     }`;

  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 space-y-4">
        <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
          {t("sidebar.sectionProfile") || "Profil"}
        </div>

        <Link to="/profile?tab=profile" className={itemClasses(activeTab === "profile")}>
          {t("sidebar.profile") || "Profil"}
        </Link>

        <Link to="/profile?tab=account" className={itemClasses(activeTab === "account")}>
          {t("sidebar.account") || "Konto & Sicherheit"}
        </Link>

        <div className="pt-4 mt-2 border-t border-gray-800 text-xs font-semibold uppercase text-gray-500 tracking-wide">
          {t("sidebar.sectionMessages") || "Kommunikation"}
        </div>

        <Link to="/profile?tab=messages" className={itemClasses(activeTab === "messages")}>
          {t("sidebar.messages") || "Kontaktanfragen"}
        </Link>
      </div>
    </aside>
  );
};

export default AccountSidebar;
