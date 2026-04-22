// src/pages/ContactPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";
import { toast } from "sonner";

import {
  MdArrowBack,
  MdEmail,
  MdPerson,
  MdSubject,
  MdMessage,
  MdInfoOutline,
  MdVerified,
} from "react-icons/md";
import { FaUserTie, FaShieldAlt } from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const emailLooksValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const ContactPage = () => {
  const { t, i18n } = useTranslation("contact");
  const query = useQuery();
  const navigate = useNavigate();

  const lang = i18n.language?.slice(0, 2) || "de";

  const topic = query.get("topic") || "general";
  const agentId = query.get("agentId") || null;
  const isAgentTopic = topic === "agents";

  // Titles/intro must be strings (your i18n already follows this)
  const pageTitle = isAgentTopic ? t("agent.title") : t("default.title");
  const pageIntro = isAgentTopic ? t("agent.intro") : t("default.intro");
  const metaTitle = isAgentTopic ? t("agent.metaTitle") : t("default.metaTitle");

  // ------------------ FORM STATE ------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(""); // optional, but feels more “Zillow-like”
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Honeypot (simple anti-spam)
  const [companyWebsite, setCompanyWebsite] = useState("");

  // ------------------ AGENT STATE (topic=agents) ------------------
  const [agent, setAgent] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Prefill from logged-in user
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
    }
  }, []);

  // Load agent if needed
  useEffect(() => {
    const loadAgent = async () => {
      if (!isAgentTopic || !agentId) return;

      setAgentLoading(true);
      try {
        const ref = doc(db, "agents", agentId);
        const snap = await getDoc(ref);
        if (snap.exists()) setAgent({ id: snap.id, ...snap.data() });
        else setAgent(null);
      } catch (err) {
        console.error("[ContactPage] Error loading agent:", err);
        setAgent(null);
      } finally {
        setAgentLoading(false);
      }
    };

    loadAgent();
  }, [isAgentTopic, agentId]);

  // Helpful derived values
  const agentDisplayName = agent?.fullName || agent?.name || agentId || "—";
  const agentLocation = useMemo(() => {
    const city = agent?.city || "";
    const region = agent?.region || agent?.state || "";
    return city && region ? `${city}, ${region}` : city || region || "";
  }, [agent]);

  const defaultSubject = useMemo(() => {
    if (isAgentTopic) return t("agent.defaultSubject");
    return t("form.subjectPlaceholder");
  }, [isAgentTopic, t]);

  // If agent topic and subject empty, prefill a nicer subject (only once)
  useEffect(() => {
    if (!isAgentTopic) return;
    if (subject.trim()) return;
    // gentle prefill: still editable
    setSubject(t("agent.defaultSubject"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgentTopic]);

  // ------------------ SUBMIT ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot: if filled, silently drop
    if (companyWebsite && companyWebsite.trim().length > 0) {
      toast.success(t("form.successTitle"), {
        description: isAgentTopic ? t("form.successAgent") : t("form.successDefault"),
      });
      setSubject("");
      setMessage("");
      setPhone("");
      setCompanyWebsite("");
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      toast.error(t("form.errorTitle"), { description: t("form.validationError") });
      return;
    }
    if (!emailLooksValid(cleanEmail)) {
      toast.error(t("form.errorTitle"), {
        description: t("form.invalidEmail") || t("form.validationError"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = auth.currentUser;

      // 1) AdminDashboard support inbox
      await addDoc(collection(db, "supportMessages"), {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        subject: cleanSubject || null,
        category: isAgentTopic ? "agent-contact" : topic || "general",
        message: cleanMessage,
        timestamp: serverTimestamp(),
        status: "open",
        userId: currentUser?.uid || null,
        agentId: isAgentTopic ? agentId || null : null,
        source: "contactPage",
      });

      // 2) If agent contact: create SendGrid “contacts” doc (your existing flow)
      if (isAgentTopic && agent) {
        const ownerEmail = agent.contactEmail || agent.email || agent.ownerEmail || null;

        if (ownerEmail) {
          await addDoc(collection(db, "contacts"), {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || null,
            message: cleanMessage,
            subject: cleanSubject || t("agent.defaultSubject"),
            listingId: null,
            listingTitle: `Agent: ${agentDisplayName}`,
            ownerEmail,
            userId: currentUser?.uid || null,
            sentAt: serverTimestamp(),
            source: "agent-profile",
          });
        } else {
          console.warn(
            "[ContactPage] Agent has no email/contactEmail/ownerEmail – skipping SendGrid contact."
          );
        }
      }

      toast.success(t("form.successTitle"), {
        description: isAgentTopic ? t("form.successAgent") : t("form.successDefault"),
      });

      setSubject("");
      setMessage("");
      setPhone("");
      setCompanyWebsite("");
    } catch (err) {
      console.error("[ContactPage] submit error:", err);
      toast.error(t("form.errorTitle"), { description: t("form.errorDescription") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    // Zillow-ish UX: go back if possible, otherwise go home
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta title={metaTitle} description={pageIntro} path="/contact" lang={lang} />

      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            <MdArrowBack className="text-lg" />
            {t("nav.back", { defaultValue: "Zurück" })}
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t("nav.breadcrumb", { defaultValue: "MyHome24App · Kontakt" })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header / Hero */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-full bg-emerald-600/10 border border-emerald-600/25 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <FaShieldAlt className="mr-1" />
              {t("hero.badge", { defaultValue: "Sicher & schnell" })}
            </span>

            {isAgentTopic && (
              <span className="inline-flex items-center rounded-full bg-slate-900/5 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 dark:border-slate-800 dark:bg-slate-50/5">
                <FaUserTie className="mr-1" />
                {t("hero.agentBadge", { defaultValue: "Agent:in kontaktieren" })}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {pageTitle}
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
            {pageIntro}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] items-start">
          {/* ASIDE */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
            {isAgentTopic ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="h-11 w-11 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center dark:border-emerald-500/25 dark:bg-emerald-500/10">
                    <FaUserTie className="text-emerald-700 dark:text-emerald-200" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">{t("agent.targetBoxTitle")}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {t("agent.hint")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  {agentLoading && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {t("agent.loading")}
                    </div>
                  )}

                  {!agentLoading && !agent && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {t("agent.notFound")}
                    </div>
                  )}

                  {!agentLoading && agent && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold truncate">{agentDisplayName}</div>
                          {agentLocation ? (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {agentLocation}
                            </div>
                          ) : null}
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-200 dark:border-emerald-500/25">
                          <MdVerified className="text-base" />
                          {t("agent.verifiedHint", { defaultValue: "Profil" })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t("agent.replyTime", { defaultValue: "Antwort üblicherweise innerhalb von 24–48h." })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="h-11 w-11 rounded-2xl bg-slate-900/5 border border-slate-200 flex items-center justify-center dark:bg-slate-50/5 dark:border-slate-800">
                    <MdInfoOutline className="text-xl text-slate-700 dark:text-slate-200" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">{t("default.boxTitle")}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {t("default.boxText")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                  {t("default.boxHint")}
                </div>
              </>
            )}

            <div className="mt-6 text-[11px] text-slate-500 dark:text-slate-400">
              {t("privacy.note", {
                defaultValue:
                  "Mit dem Absenden stimmst du der Verarbeitung deiner Angaben zur Bearbeitung deiner Anfrage zu.",
              })}
            </div>
          </aside>

          {/* FORM */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot */}
              <div className="hidden">
                <label>
                  Company Website
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t("form.nameLabel")}
                  </label>
                  <div className="relative">
                    <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("form.namePlaceholder", { defaultValue: "Dein Name" })}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t("form.emailLabel")}
                  </label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("form.emailPlaceholder", { defaultValue: "name@example.com" })}
                    />
                  </div>
                </div>

                {/* Phone (optional) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t("form.phoneLabel", { defaultValue: "Telefon (optional)" })}
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("form.phonePlaceholder", { defaultValue: "+49 ..." })}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t("form.subjectLabel")}
                  </label>
                  <div className="relative">
                    <MdSubject className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={defaultSubject}
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t("form.messageLabel")}
                </label>

                <div className="relative">
                  <MdMessage className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    className="w-full min-h-[160px] rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("form.messagePlaceholder", {
                      defaultValue: "Beschreibe kurz, wobei wir helfen können…",
                    })}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    {t("form.requiredHint", { defaultValue: "Pflichtfelder: Name, E-Mail, Nachricht" })}
                  </span>
                  <span>
                    {(message || "").length}/2000
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? t("form.sending") : t("form.submit")}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  <MdArrowBack className="mr-2 text-lg" />
                  {t("nav.back", { defaultValue: "Zurück" })}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;