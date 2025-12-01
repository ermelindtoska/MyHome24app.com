// src/pages/BecomeAgentPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import SiteMeta from "../components/SEO/SiteMeta";
import { MdErrorOutline, MdCheckCircle, MdArrowBack } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";

const BecomeAgentPage = () => {
  const { t, i18n } = useTranslation("agentBecome");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    regions: "",
    languages: "",
    experienceYears: "",
    licenseNumber: "",
    agencyName: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const lang = i18n.language?.slice(0, 2) || "de";

  // Prefill nga user-i dhe nga agents/{uid} nëse ekziston
  useEffect(() => {
    const loadExisting = async () => {
      if (!currentUser) return;

      const agentRef = doc(db, "agents", currentUser.uid);
      const agentSnap = await getDoc(agentRef);

      const base = {
        fullName: currentUser.displayName || "",
        email: currentUser.email || "",
        phone: "",
        city: "",
        state: "",
        regions: "",
        languages: "",
        experienceYears: "",
        licenseNumber: "",
        agencyName: "",
        bio: "",
      };

      if (agentSnap.exists()) {
        const data = agentSnap.data();
        setFormData({
          ...base,
          ...data,
        });
      } else {
        setFormData(base);
      }
    };

    loadExisting();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackToSearch = () => {
    navigate("/agent/search");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!currentUser) {
      setSubmitError(t("messages.notLoggedIn"));
      return;
    }

    try {
      setLoading(true);

      const userId = currentUser.uid;

      // 1) Ruaj profilin e agjentit (ende JO i verifikuar)
      console.log("[BecomeAgent] Writing agent profile for user:", userId);
      const agentRef = doc(db, "agents", userId);
      await setDoc(
        agentRef,
        {
          ...formData,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          verified: false,
          rating: 0,
          reviewsCount: 0,
        },
        { merge: true }
      );
      console.log("[BecomeAgent] Agent profile written OK");

      // 2) Krijo / përditëso kërkesë role-upgrade për AGENT
      console.log(
        "[BecomeAgent] Writing roleUpgradeRequests document for user:",
        userId
      );
      const reqRef = doc(db, "roleUpgradeRequests", userId);
      await setDoc(
        reqRef,
        {
          userId,
          fullName: formData.fullName,
          email: formData.email,
          targetRole: "agent",
          reason: t("defaultReason"),
          requestedAt: serverTimestamp(),
          status: "pending",
          source: "agentBecomePage",
        },
        { merge: true }
      );
      console.log("[BecomeAgent] roleUpgradeRequests written OK");

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Error saving agent profile / role request:", err);
      // 🔍 DEBUG: Përkohësisht, që të shohim saktë gabimin nga Firestore / AppCheck
      alert(`FEHLER: ${err.code || ""} – ${err.message || err}`);
      setSubmitError(t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        titleKey="agentBecome.metaTitle"
        descKey="agentBecome.metaDescription"
        path="/agent/become"
        lang={lang}
      />

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handleBackToSearch}
            className="inline-flex items-center text-xs md:text-sm text-slate-300 hover:text-white"
          >
            <MdArrowBack className="mr-1" />
            {t("actions.backToSearch")}
          </button>

          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <FaUserTie className="mr-1" />
            {t("header.badge")}
          </span>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t("header.title")}
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            {t("header.subtitle")}
          </p>
        </header>

        {/* Alert messages */}
        {submitError && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <MdErrorOutline className="text-lg" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <MdCheckCircle className="text-lg" />
            <span>{t("messages.success")}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6 space-y-4"
        >
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            {t("form.sectionTitle")}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.fullNameLabel")}
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.emailLabel")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.phoneLabel")}
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.cityLabel")}
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.stateLabel")}
              </label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Regions */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.regionsLabel")}
              </label>
              <input
                name="regions"
                value={formData.regions}
                onChange={handleChange}
                placeholder={t("form.regionsPlaceholder")}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.languagesLabel")}
              </label>
              <input
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder={t("form.languagesPlaceholder")}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.experienceLabel")}
              </label>
              <input
                type="number"
                min="0"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* License */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("form.licenseLabel")}
              </label>
              <input
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Agency */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                {t("form.agencyLabel")}
              </label>
              <input
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                {t("form.bioLabel")}
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder={t("form.bioPlaceholder")}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("actions.submitting") : t("actions.submit")}
            </button>
            <button
              type="button"
              onClick={handleBackToSearch}
              className="inline-flex items-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900"
            >
              <MdArrowBack className="mr-1" />
              {t("actions.backToSearch")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeAgentPage;
