// src/pages/RateAgentPage.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { MdStar, MdRateReview } from "react-icons/md";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RateAgentPage = () => {
  const { t } = useTranslation("agentRating");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);

    const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";

    if (!feedback.trim()) return;

    try {
      await addDoc(collection(db, "agentRatings"), {
        message: feedback.trim(),
        createdAt: serverTimestamp(),
        userId,
      });

      setFeedback("");
      setSubmitted(true);
      alert(t("successMessage")); // përkthimi për sukses
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert(t("errorMessage")); // përkthimi për dështim
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Helmet>
        <title>{t("title")} – MyHome24</title>
        <meta name="description" content={t("description")} />
      </Helmet>

      <div className="flex items-center mb-4">
        <MdStar className="text-yellow-500 text-3xl mr-2" />
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      <p className="text-gray-700 mb-6">{t("description")}</p>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold flex items-center">
          <MdRateReview className="text-yellow-600 mr-2" />
          {t("rateTitle")}
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full border border-gray-300 p-3 rounded mb-4"
          rows={4}
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition"
        >
          {t("submit")}
        </button>
      </form>

      {submitted && (
        <div className="mt-4 text-green-600 font-medium">
          {t("successMessage")}
        </div>
      )}
    </div>
  );
};

export default RateAgentPage;
