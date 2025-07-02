import React from "react";
import { useTranslation } from "react-i18next";
import { FaQuoteLeft, FaStar, FaUserCircle } from "react-icons/fa";

const TestimonialsSection = () => {
  const { t } = useTranslation("home");

  const testimonials = [
    {
      name: "Anna Müller",
      text: "Fantastische Plattform! Ich habe mein Traumhaus in nur wenigen Tagen gefunden.",
    },
    {
      name: "Paul Bauer",
      text: "Sehr benutzerfreundlich und zuverlässig. Ich kann es jedem empfehlen.",
    },
    {
      name: "Sara Schmidt",
      text: "Die Suche war schnell, einfach und sehr hilfreich. Tolle Erfahrung!",
    },
  ];

  return (
    <section className="bg-blue-50 dark:bg-gray-700 py-20 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-4xl font-bold mb-12 text-blue-900 dark:text-gray-100">{t("testimonialsTitle")}</h3>
        <div className="grid sm:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 hover:shadow-xl transition"
            >
              <FaQuoteLeft className="text-3xl text-blue-600 mb-4 mx-auto" />
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{item.text}"</p>
              <div className="text-yellow-500 flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <div className="text-blue-800 dark:text-blue-300 font-semibold flex items-center justify-center gap-2">
                <FaUserCircle /> <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
