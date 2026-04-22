import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation("footer");

  const socialLinks = [
    {
      href: "#",
      label: "Facebook",
      icon: <FaFacebookF size={16} />,
    },
    {
      href: "#",
      label: "Twitter",
      icon: <FaTwitter size={16} />,
    },
    {
      href: "#",
      label: "Instagram",
      icon: <FaInstagram size={16} />,
    },
    {
      href: "#",
      label: "LinkedIn",
      icon: <FaLinkedinIn size={16} />,
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              MyHome24App
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {t("rightsReserved")}
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              {t("footerDescription", {
                defaultValue:
                  "Ihre moderne Immobilienplattform für Kaufen, Mieten und professionelles Verwalten in Deutschland.",
              })}
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              {t("about")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-600 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-sm text-gray-600 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-600 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              {t("help")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              {t("followUs")}
            </h4>

            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  {item.icon}
                </a>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              {t("socialHint", {
                defaultValue:
                  "Folgen Sie uns für neue Immobilien, Markttrends und Updates.",
              })}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} MyHome24App. {t("rightsReserved")}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
              <Link
                to="/privacy"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("privacy")}
              </Link>
              <Link
                to="/terms"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("terms")}
              </Link>
              <Link
                to="/contact"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;