import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaHome,
  FaEnvelope,
  FaShieldAlt,
} from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation("footer");

  const year = new Date().getFullYear();

  const socialLinks = [
    { href: "#", label: "Facebook", icon: <FaFacebookF size={15} /> },
    { href: "#", label: "Twitter", icon: <FaTwitter size={15} /> },
    { href: "#", label: "Instagram", icon: <FaInstagram size={15} /> },
    { href: "#", label: "LinkedIn", icon: <FaLinkedinIn size={15} /> },
  ];

  const columns = [
    {
      title: t("columns.company", { defaultValue: "Unternehmen" }),
      links: [
        { to: "/about", label: t("about", { defaultValue: "Über uns" }) },
        { to: "/careers", label: t("careers", { defaultValue: "Karriere" }) },
        { to: "/contact", label: t("contact", { defaultValue: "Kontakt" }) },
        { to: "/how-it-works", label: t("howItWorks", { defaultValue: "So funktioniert es" }) },
      ],
    },
    {
      title: t("columns.realEstate", { defaultValue: "Immobilien" }),
      links: [
        { to: "/buy", label: t("buy", { defaultValue: "Kaufen" }) },
        { to: "/rent", label: t("rent", { defaultValue: "Mieten" }) },
        { to: "/map", label: t("map", { defaultValue: "Karte" }) },
        { to: "/compare", label: t("compare", { defaultValue: "Vergleichen" }) },
      ],
    },
    {
      title: t("columns.support", { defaultValue: "Support" }),
      links: [
        { to: "/support", label: t("support", { defaultValue: "Hilfe" }) },
        { to: "/privacy", label: t("privacy", { defaultValue: "Datenschutz" }) },
        { to: "/terms", label: t("terms", { defaultValue: "AGB" }) },
        { to: "/impressum", label: t("impressum", { defaultValue: "Impressum" }) },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-700/20" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-700/20" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <FaHome />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                MyHome24App
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">
              {t("footerDescription", {
                defaultValue:
                  "Ihre moderne Immobilienplattform für Kaufen, Mieten, Vergleichen und professionelles Verwalten in Deutschland.",
              })}
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a
                href="mailto:kontakt@myhome24app.com"
                className="inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                <FaEnvelope />
                kontakt@myhome24app.com
              </a>

              <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <FaShieldAlt />
                {t("trustHint", {
                  defaultValue: "Sicher, transparent und nutzerfreundlich.",
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                  {column.title}
                </h4>

                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {year} MyHome24App.{" "}
              {t("rightsReserved", { defaultValue: "Alle Rechte vorbehalten." })}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-500">
              <Link to="/privacy" className="transition hover:text-blue-600 dark:hover:text-blue-400">
                {t("privacy", { defaultValue: "Datenschutz" })}
              </Link>
              <Link to="/terms" className="transition hover:text-blue-600 dark:hover:text-blue-400">
                {t("terms", { defaultValue: "AGB" })}
              </Link>
              <Link to="/impressum" className="transition hover:text-blue-600 dark:hover:text-blue-400">
                {t("impressum", { defaultValue: "Impressum" })}
              </Link>
              <Link to="/contact" className="transition hover:text-blue-600 dark:hover:text-blue-400">
                {t("contact", { defaultValue: "Kontakt" })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);