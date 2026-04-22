// src/components/Breadcrumbs.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const Breadcrumbs = ({ items = [] }) => {
  const { t } = useTranslation("breadcrumbs");

  return (
    <nav
      className="flex items-center flex-wrap text-sm gap-2 text-gray-600 dark:text-gray-300 mb-4"
      aria-label="Breadcrumb"
    >
      {/* HOME */}
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <Home size={16} />
        {t("home", { defaultValue: "Home" })}
      </Link>

      {/* DYNAMIC ITEMS */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-400">/</span>

          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {t(item.label)}
            </Link>
          ) : (
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {t(item.label)}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;