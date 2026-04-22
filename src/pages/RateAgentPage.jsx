import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { MdStar, MdRateReview, MdOutlineVerifiedUser } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RateAgentPage = () => {
  const { t } = useTranslation("agentRating");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);

    const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";

    if (!feedback.trim()) return;

    try {
      setSubmitting(true);

      await addDoc(collection(db, "agentRatings"), {
        message: feedback.trim(),
        createdAt: serverTimestamp(),
        userId,
      });

      setFeedback("");
      setSubmitted(true);
      alert(t("success.saved"));
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert(t("errors.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Helmet>
        <title>{t("metaTitle")} – MyHome24App</title>
        <meta name="description" content={t("metaDescription")} />
      </Helmet>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="bg-gradient-to-r from-yellow-500/10 via-transparent to-amber-500/10 p-6 md:p-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-700 dark:text-yellow-300">
                <MdStar className="mr-2 text-sm" />
                {t("badge")}
              </div>

              <h1 className="mt-4 flex items-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                <MdStar className="mr-3 text-yellow-500" />
                {t("titles.rating")}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                {t("intro")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                <MdRateReview className="text-2xl" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {t("form.yourRatingLabel")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("form.commentLabel")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                {t("form.commentLabel")}
              </label>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t("form.commentPlaceholder")}
                className="min-h-[180px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-50"
                rows={6}
                required
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting || !feedback.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? t("form.sending") : t("form.submit")}
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>

            {submitted && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                {t("success.saved")}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <MdOutlineVerifiedUser className="text-2xl" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {t("whyTitle")}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t("whyText")}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t("tipsTitle")}
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  <span>{t("tips.0")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  <span>{t("tips.1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  <span>{t("tips.2")}</span>
                </li>
              </ul>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RateAgentPage;