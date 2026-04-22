import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiUser } from "react-icons/fi";

const CommentsSection = () => {
  const { t } = useTranslation("comments");

  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    text: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.text.trim()) return;

    const newComment = {
      id: Date.now(),
      name: form.name,
      text: form.text,
      date: new Date().toLocaleDateString(),
    };

    setComments((prev) => [newComment, ...prev]);
    setForm({ name: "", text: "" });
  };

  return (
    <section className="mt-10 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      
      {/* HEADER */}
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {t("title", { defaultValue: "Kommentare" })}
      </h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-8"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder={t("name", { defaultValue: "Ihr Name" })}
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={new Date().toLocaleDateString()}
            disabled
            className="w-full border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-xl px-4 py-2"
          />
        </div>

        <textarea
          name="text"
          rows={4}
          placeholder={t("text", {
            defaultValue: "Schreiben Sie Ihren Kommentar…",
          })}
          value={form.text}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          {t("submit", { defaultValue: "Kommentar senden" })}
        </button>
      </form>

      {/* COMMENTS LIST */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("empty", {
              defaultValue: "Noch keine Kommentare vorhanden.",
            })}
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <FiUser />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {c.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {c.date}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {c.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CommentsSection;