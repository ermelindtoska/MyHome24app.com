// src/pages/AgentSearchPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdChecklist,
  MdLocationOn,
  MdVerified,
  MdPersonSearch,
  MdStar,
} from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";
import agentSearchImg from "../assets/agent-search.png";

const AgentSearchPage = () => {
  const { t, i18n } = useTranslation("agent");
  const navigate = useNavigate();

  // 🔹 refs për scroll & fokus
  const searchSectionRef = useRef(null);
  const searchInputRef = useRef(null);

  // 🔹 filter state
  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("any");

  // 🔹 agjentët nga Firestore (vetëm të verifikuar)
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "agents"));
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Vetëm agjentë të verifikuar (Variant A)
        const verifiedAgents = docs.filter(
          (a) => a.verified === true || a.verified === "true"
        );

        setAgents(verifiedAgents);
      } catch (err) {
        console.error("Error loading agents:", err);
        // UI do të tregojë thjesht "Keine Ergebnisse", që është ok për tani
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    const city = cityFilter.trim().toLowerCase();
    const language = languageFilter.trim().toLowerCase();

    return agents.filter((agent) => {
      // mund të jetë array ose string "de,en,tr"
      const rawLanguages = agent.languages;
      const agentLanguages = Array.isArray(rawLanguages)
        ? rawLanguages
        : typeof rawLanguages === "string"
        ? rawLanguages.split(",")
        : [];

      const matchesText =
        !text ||
        agent.fullName?.toLowerCase().includes(text) ||
        agent.city?.toLowerCase().includes(text) ||
        agent.zip?.toLowerCase().includes(text);

      const matchesCity =
        !city || agent.city?.toLowerCase().includes(city);

      const matchesLanguage =
        !language ||
        agentLanguages.some((lng) =>
          lng.toLowerCase().includes(language)
        );

      const matchesRating =
        ratingFilter === "any" ||
        (typeof agent.rating === "number" &&
          agent.rating >= Number(ratingFilter));

      return matchesText && matchesCity && matchesLanguage && matchesRating;
    });
  }, [agents, searchText, cityFilter, languageFilter, ratingFilter]);

  const lang = i18n.language?.slice(0, 2) || "de";

  const popularRegions =
    t("popularRegions", { returnObjects: true }) || [];

  const faqItems = t("faq.items", { returnObjects: true }) || [];

  const handleScrollToSearch = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRateAgent = () => {
    navigate("/agent/rate");
  };

  const handleBecomeAgent = () => {
    navigate("/agent/become");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        title={t("searchPage.metaTitle")}
        description={t("searchPage.metaDescription")}
        path="/agent/search"
        lang={lang}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center mb-12">
          {/* Left text */}
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <MdPersonSearch className="mr-1" />
              {t("hero.badge")}
            </span>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">
              {t("hero.title")}
            </h1>

            <p className="mt-3 text-slate-300 text-sm md:text-base max-w-xl">
              {t("hero.subtitle")}
            </p>

            <ul className="mt-5 space-y-2 text-sm md:text-base text-slate-200">
              <li>
                <MdVerified className="inline mr-2 text-emerald-400" />
                {t("benefits.point1")}
              </li>
              <li>
                <MdLocationOn className="inline mr-2 text-emerald-400" />
                {t("benefits.point2")}
              </li>
              <li>
                <MdChecklist className="inline mr-2 text-emerald-400" />
                {t("benefits.point3")}
              </li>
              <li>
                <MdSearch className="inline mr-2 text-emerald-400" />
                {t("benefits.point4")}
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleScrollToSearch}
                className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
              >
                <MdSearch className="mr-2" />
                {t("hero.ctaSearch")}
              </button>
              <button
                type="button"
                onClick={handleRateAgent}
                className="inline-flex items-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
              >
                <MdStar className="mr-2" />
                {t("hero.ctaRate")}
              </button>
              <button
                type="button"
                onClick={handleBecomeAgent}
                className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                <FaUserTie className="mr-2" />
                {t("hero.ctaBecomeAgent")}
              </button>
              <button
                type="button"
                onClick={handleBecomeAgent}
                className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition"
              >
                <FaUserTie className="mr-2" />
                {t("forAgents.cta")}
              </button>
            </div>
          </div>

          {/* Right image card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/50">
            <img
              src={agentSearchImg}
              alt={t("searchPage.imageAlt")}
              className="w-full h-[260px] md:h-[690px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <h2 className="text-xl md:text-2xl font-semibold">
                {t("searchPage.title")}
              </h2>
              <p className="text-sm text-slate-200">
                {t("searchPage.intro")}
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH + LIST */}
        <section
          ref={searchSectionRef}
          className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.1fr)] items-start"
        >
          {/* Filter sidebar */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-1">
              {t("overview.searchTitle")}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mb-4">
              {t("overview.searchText")}
            </p>

            {/* Search input */}
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t("searchPlaceholder")}
            </label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full bg-slate-950/60 border border-slate-700 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
            />

            {/* City */}
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t("city")}
            </label>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder={t("city")}
              className="w-full rounded-full bg-slate-950/60 border border-slate-700 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
            />

            {/* Languages */}
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t("languagesSpoken")}
            </label>
            <input
              type="text"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              placeholder={t("languages")}
              className="w-full rounded-full bg-slate-950/60 border border-slate-700 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
            />

            {/* Rating */}
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t("overallRating")}
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full rounded-full bg-slate-950/60 border border-slate-700 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
            >
              <option value="any">{t("ratingFilter.any")}</option>
              <option value="3">{t("ratingFilter.min3")}</option>
              <option value="4">{t("ratingFilter.min4")}</option>
              <option value="4.5">{t("ratingFilter.min45")}</option>
            </select>

            {/* CTA për agjentë */}
            <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 p-4 text-sm">
              <h4 className="font-semibold text-emerald-300 mb-1">
                {t("forAgents.title")}
              </h4>
              <p className="text-slate-100 text-xs md:text-sm mb-3">
                {t("forAgents.text")}
              </p>
              <button
                type="button"
                onClick={handleBecomeAgent}
                className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition"
              >
                <FaUserTie className="mr-2" />
                {t("forAgents.cta")}
              </button>
            </div>
          </div>

          {/* List of agents */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 md:p-6">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-lg md:text-xl font-semibold">
                {t("agentList")}
              </h3>
              <span className="text-xs text-slate-400">
                {filteredAgents.length} / {agents.length} {t("agentList")}
              </span>
            </div>

            {agents.length === 0 && (
              <div className="text-sm text-slate-400 border border-dashed border-slate-700 rounded-2xl px-4 py-6 text-center">
                {t("noResults")}
              </div>
            )}

            {agents.length > 0 && filteredAgents.length === 0 && (
              <div className="text-sm text-slate-400 border border-dashed border-slate-700 rounded-2xl px-4 py-6 text-center">
                {t("noResults")}
              </div>
            )}

            {filteredAgents.length > 0 && (
              <div className="space-y-4 mt-2">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row md:items-center gap-4"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {agent.photoUrl ? (
                        <img
                          src={agent.photoUrl}
                          alt={agent.fullName || "Agent"}
                          className="h-16 w-16 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                          <FaUserTie className="text-slate-300 text-xl" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <h4 className="text-base md:text-lg font-semibold">
                        {agent.fullName || "—"}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2">
                        {agent.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/40">
                            <MdVerified className="text-emerald-300" />
                            {t("verified")}
                          </span>
                        )}
                        {typeof agent.rating === "number" &&
                          agent.rating > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/40">
                              <MdStar className="text-amber-300" />
                              {agent.rating.toFixed(1)} / 5
                            </span>
                          )}
                      </div>

                      <p className="text-xs md:text-sm text-slate-300">
                        {agent.city && agent.region
                          ? `${agent.city}, ${agent.region}`
                          : agent.city || agent.region || ""}
                      </p>

                      {agent.specialties && Array.isArray(agent.specialties) && (
                        <p className="text-xs text-slate-400">
                          {t("specialties")}:{" "}
                          {agent.specialties.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ + Regionen */}
        <section className="mt-10 md:mt-14 grid gap-6 md:grid-cols-2">
          {/* FAQ */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-4">
              {t("faq.title")}
            </h3>
            <div className="space-y-4 text-sm text-slate-200">
              {faqItems.map((item, idx) => (
                <div key={idx}>
                  <p className="font-semibold mb-1">{item.question}</p>
                  <p className="text-slate-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Popular regions */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              {t("popularRegionsTitle")}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mb-4">
              {t("benefits.title")}
            </p>
            <div className="flex flex-wrap gap-2">
              {popularRegions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs md:text-sm text-slate-100"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AgentSearchPage;
