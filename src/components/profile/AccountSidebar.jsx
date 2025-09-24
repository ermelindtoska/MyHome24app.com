// src/components/profile/AccountSidebar.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AccountSidebar() {
  const { t } = useTranslation("profile");
  const [sp, setSp] = useSearchParams();
  const active = sp.get("tab") || "profile";

  const items = [
    { key: "profile", label: t("tabs.profile"), href: "/profile?tab=profile" },
    { key: "account", label: t("tabs.account"), href: "/profile?tab=account" },
    { key: "privacy", label: t("tabs.privacy"), href: "/profile?tab=privacy" },
    { key: "notifications", label: t("tabs.notifications"), href: "/profile?tab=notifications" },
    { key: "savedHomes", label: t("tabs.savedHomes"), href: "/profile?tab=savedHomes" },
    { key: "savedSearches", label: t("tabs.savedSearches"), href: "/profile?tab=savedSearches" }
  ];

  const setTab = (k) => { sp.set("tab", k); setSp(sp, { replace: true }); };

  return (
    <aside className="w-full md:w-60 shrink-0">
      {/* mobile pills */}
      <div className="md:hidden mb-3 flex gap-2 overflow-x-auto">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setTab(it.key)}
            className={`px-3 py-1.5 rounded-full border text-sm ${
              active === it.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>

      {/* desktop list */}
      <nav className="hidden md:block">
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.key}>
              <button
                onClick={() => setTab(it.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  active === it.key
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
