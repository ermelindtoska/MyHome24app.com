import React from "react";
import { useTranslation } from "react-i18next";
import { FaQuoteLeft, FaStar, FaUserCircle } from "react-icons/fa";

const TestimonialsSection = () => {
  const { t } = useTranslation("home");

  const testimonials = t("testimonials.items", {
    returnObjects: true,
    defaultValue: [],
  });

  const fallbackTestimonials = [
    {
      name: "Anna Müller",
      role: "Käuferin",
      text: "Fantastische Plattform! Ich habe mein Traumhaus in nur wenigen Tagen gefunden.",
    },
    {
      name: "Paul Bauer",
      role: "Eigentümer",
      text: "Sehr benutzerfreundlich und zuverlässig. Ich kann MyHome24App jedem empfehlen.",
    },
    {
      name: "Sara Schmidt",
      role: "Mieterin",
      text: "Die Suche war schnell, einfach und sehr hilfreich. Eine wirklich tolle Erfahrung.",
    },
  ];

  const items = Array.isArray(testimonials) && testimonials.length
    ? testimonials
    : fallbackTestimonials;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-700/20" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/20" />

      <div className="relative mx-auto max-w-6xl text-center">
        <div className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/80 dark:text-blue-300">
          {t("testimonials.badge", { defaultValue: "Erfahrungen" })}
        </div>

        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          {t("testimonials.title", {
            defaultValue: "Was Nutzer:innen über MyHome24App sagen",
          })}
        </h3>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
          {t("testimonials.subtitle", {
            defaultValue:
              "Echte Erfahrungen von Menschen, die Immobilien einfacher suchen, vergleichen und veröffentlichen möchten.",
          })}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className="group rounded-3xl border border-slate-200 bg-white/90 p-6 text-left shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  <FaQuoteLeft className="text-xl" />
                </div>

                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className="text-sm" />
                  ))}
                </div>
              </div>

              <p className="min-h-[96px] text-sm leading-7 text-slate-700 dark:text-slate-300">
                “{item.text}”
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <FaUserCircle className="text-2xl" />
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.role ||
                      t("testimonials.defaultRole", {
                        defaultValue: "MyHome24App Nutzer:in",
                      })}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(TestimonialsSection);