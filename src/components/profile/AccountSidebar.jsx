// src/components/profile/AccountSidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaShieldAlt,
  FaEnvelopeOpenText,
} from "react-icons/fa";

const AccountSidebar = ({ activeTab }) => {
  const { t } = useTranslation("profile");

  const itemClasses = (isActive) =>
    `
    group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
    ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }
  `;

  const iconClasses = (isActive) =>
    `
    text-base transition
    ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"}
  `;

  return (
    <aside className="hidden md:block w-72 shrink-0">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">

        {/* ===== SECTION: PROFILE ===== */}
        <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide mb-3">
          {t("sidebar.sectionProfile") || "Profil"}
        </div>

        <Link
          to="/profile?tab=profile"
          className={itemClasses(activeTab === "profile")}
        >
          <FaUser className={iconClasses(activeTab === "profile")} />
          {t("sidebar.profile") || "Profil"}
        </Link>

        <Link
          to="/profile?tab=account"
          className={itemClasses(activeTab === "account")}
        >
          <FaShieldAlt className={iconClasses(activeTab === "account")} />
          {t("sidebar.account") || "Konto & Sicherheit"}
        </Link>

        {/* ===== SECTION: MESSAGES ===== */}
        <div className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
          {t("sidebar.sectionMessages") || "Kommunikation"}
        </div>

        <Link
          to="/profile?tab=messages"
          className={itemClasses(activeTab === "messages")}
        >
          <FaEnvelopeOpenText className={iconClasses(activeTab === "messages")} />
          {t("sidebar.messages") || "Kontaktanfragen"}
        </Link>

      </div>
    </aside>
  );
};

export default AccountSidebar;