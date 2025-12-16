// src/pages/ContactPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import SiteMeta from "../components/SEO/SiteMeta";
import { toast } from "sonner"; // ✅ përdorim direkt sonner

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const ContactPage = () => {
  const { t, i18n } = useTranslation("contact");
  const query = useQuery();

  const lang = i18n.language?.slice(0, 2) || "de";

  const topic = query.get("topic") || "general";
  const agentId = query.get("agentId") || null;
  const isAgentTopic = topic === "agents";

  // 👉 Vetëm STRINGJE – jo objekte { title, description }
  const pageTitle = isAgentTopic ? t("agent.title") : t("default.title");
  const pageIntro = isAgentTopic ? t("agent.intro") : t("default.intro");
  const metaTitle = isAgentTopic ? t("agent.metaTitle") : t("default.metaTitle");

  // ------------------ STATE FORME ------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------ AGJENTI (vetëm kur topic=agents) ------------------
  const [agent, setAgent] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Prefill nga user-i loguar
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
    }
  }, []);

  // Ngarko agjentin nëse kemi topic=agents & agentId
  useEffect(() => {
    const loadAgent = async () => {
      if (!isAgentTopic || !agentId) return;

      setAgentLoading(true);
      try {
        const ref = doc(db, "agents", agentId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAgent({ id: snap.id, ...snap.data() });
        } else {
          setAgent(null);
        }
      } catch (err) {
        console.error("[ContactPage] Error loading agent:", err);
        setAgent(null);
      } finally {
        setAgentLoading(false);
      }
    };

    loadAgent();
  }, [isAgentTopic, agentId]);

  // ------------------ SUBMIT ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      // ❌ VALIDATION ERROR
      toast.error(t("form.errorTitle"), {
        description: t("form.validationError"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = auth.currentUser;

      // 1) Support message për AdminDashboard → Support-Nachrichten
      await addDoc(collection(db, "supportMessages"), {
        name: name.trim(),
        email: email.trim(),
        category: isAgentTopic ? "agent-contact" : topic || "general",
        message: message.trim(),
        timestamp: serverTimestamp(),
        status: "open",
        userId: currentUser?.uid || null,
        agentId: isAgentTopic ? agentId || null : null,
      });

      // 2) Nëse është kontakt për agjent → krijo kontakt për SendGrid (koleksioni contacts)
      if (isAgentTopic && agent) {
        const ownerEmail =
          agent.contactEmail || agent.email || agent.ownerEmail || null;

        if (ownerEmail) {
          await addDoc(collection(db, "contacts"), {
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            subject:
              subject.trim() || t("agent.defaultSubject"),
            listingId: null,
            listingTitle: `Agent: ${agent.fullName || agentId}`,
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

      // ✅ SUKSES
      toast.success(t("form.successTitle"), {
        description: isAgentTopic
          ? t("form.successAgent")
          : t("form.successDefault"),
      });

      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("[ContactPage] submit error:", err);

      // ❌ ERROR SERVER
      toast.error(t("form.errorTitle"), {
        description: t("form.errorDescription"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------ JSX ------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        title={metaTitle}
        description={pageIntro}
        path="/contact"
        lang={lang}
      />

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* HEADER */}
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            {pageTitle}
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            {pageIntro}
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)] items-start">
          {/* ASIDE: Info për targetin */}
          <aside className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6 text-sm">
            {isAgentTopic ? (
              <>
                <h2 className="text-lg font-semibold mb-3">
                  {t("agent.targetBoxTitle")}
                </h2>

                {agentLoading && (
                  <p className="text-slate-400">{t("agent.loading")}</p>
                )}

                {!agentLoading && !agent && (
                  <p className="text-slate-400">{t("agent.notFound")}</p>
                )}

                {!agentLoading && agent && (
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {agent.fullName || "—"}
                    </p>
                    <p className="text-slate-300">
                      {agent.city && agent.region
                        ? `${agent.city}, ${agent.region}`
                        : agent.city || agent.region || ""}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("agent.hint")}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-3">
                  {t("default.boxTitle")}
                </h2>
                <p className="text-slate-200 mb-3">
                  {t("default.boxText")}
                </p>
                <p className="text-xs text-slate-400">
                  {t("default.boxHint")}
                </p>
              </>
            )}
          </aside>

          {/* FORMA */}
          <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emri */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t("form.nameLabel")}
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t("form.emailLabel")}
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Subjekti */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t("form.subjectLabel")}
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    isAgentTopic
                      ? t("agent.defaultSubject")
                      : t("form.subjectPlaceholder")
                  }
                />
              </div>

              {/* Mesazhi */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t("form.messageLabel")}
                </label>
                <textarea
                  className="w-full min-h-[140px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-vertical"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting
                    ? t("form.sending")
                    : t("form.submit")}
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
