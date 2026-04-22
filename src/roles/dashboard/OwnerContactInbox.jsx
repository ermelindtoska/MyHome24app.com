// src/roles/dashboard/OwnerContactInbox.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  FiMail,
  FiPhone,
  FiInbox,
  FiClock,
  FiHome,
  FiUser,
  FiMessageSquare,
} from "react-icons/fi";

const OwnerContactInbox = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation("contact");

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "contacts"),
      where("ownerEmail", "==", currentUser.email)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => {
          const ta = a.sentAt?.toDate?.()?.getTime?.() || 0;
          const tb = b.sentAt?.toDate?.()?.getTime?.() || 0;
          return tb - ta;
        });

        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error("[OwnerContactInbox] Fehler beim Laden:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser?.email]);

  const stats = useMemo(() => {
    return {
      total: messages.length,
      withEmail: messages.filter((m) => !!m.email).length,
      withPhone: messages.filter((m) => !!m.phone).length,
    };
  }, [messages]);

  const formatDate = (value) => {
    const date = value?.toDate?.();
    if (!date) {
      return t("inbox.noDate", { defaultValue: "Datum unbekannt" });
    }
    return date.toLocaleString("de-DE");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300">
              {t("inbox.loginRequired", {
                defaultValue:
                  "Bitte melden Sie sich an, um Ihre Kontaktanfragen zu sehen.",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300">
              {t("inbox.loading", {
                defaultValue: "Lade Kontaktanfragen …",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-blue-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-sm p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold mb-4">
                <FiInbox />
                {t("inbox.badge", { defaultValue: "Eigentümer:innen-Postfach" })}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("inbox.title", {
                  defaultValue: "Kontaktanfragen zu Ihren Immobilien",
                })}
              </h1>

              <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                {t("inbox.subtitle", {
                  defaultValue:
                    "Hier sehen Sie alle Nachrichten von Interessent:innen zu Ihren veröffentlichten Immobilienanzeigen.",
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full lg:min-w-[360px]">
              <StatsCard
                icon={<FiInbox />}
                label={t("inbox.stats.total", { defaultValue: "Gesamt" })}
                value={stats.total}
                color="blue"
              />
              <StatsCard
                icon={<FiMail />}
                label={t("inbox.stats.email", { defaultValue: "Mit E-Mail" })}
                value={stats.withEmail}
                color="emerald"
              />
              <StatsCard
                icon={<FiPhone />}
                label={t("inbox.stats.phone", { defaultValue: "Mit Telefon" })}
                value={stats.withPhone}
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* Empty state */}
        {messages.length === 0 ? (
          <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8 md:p-10">
            <div className="max-w-xl mx-auto text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300">
                <FiInbox size={26} />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("inbox.emptyTitle", {
                  defaultValue: "Noch keine Kontaktanfragen",
                })}
              </h2>

              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                {t("inbox.empty", {
                  defaultValue:
                    "Aktuell liegen keine Kontaktanfragen vor. Sobald Interessent:innen schreiben, erscheinen sie hier.",
                })}
              </p>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            {messages.map((m) => {
              const listingTitle =
                m.listingTitle ||
                t("inbox.noTitle", { defaultValue: "Ohne Titel" });

              const senderName =
                m.name ||
                t("inbox.unknownSender", {
                  defaultValue: "Unbekannte:r Interessent:in",
                });

              return (
                <article
                  key={m.id}
                  className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                      <div className="space-y-4 flex-1 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
                              <FiHome size={13} />
                              {t("inbox.listingLabel", {
                                defaultValue: "Immobilie",
                              })}
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-medium">
                              <FiClock size={13} />
                              {formatDate(m.sentAt)}
                            </span>
                          </div>

                          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white break-words">
                            {listingTitle}
                          </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                              <FiUser />
                              {t("inbox.senderTitle", {
                                defaultValue: "Interessent:in",
                              })}
                            </div>

                            <p className="font-semibold text-gray-900 dark:text-white">
                              {senderName}
                            </p>

                            <div className="mt-3 space-y-2 text-sm">
                              {m.email ? (
                                <a
                                  href={`mailto:${m.email}`}
                                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline break-all"
                                >
                                  <FiMail size={15} />
                                  {m.email}
                                </a>
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                  {t("inbox.noEmail", {
                                    defaultValue: "Keine E-Mail angegeben",
                                  })}
                                </p>
                              )}

                              {m.phone ? (
                                <a
                                  href={`tel:${m.phone}`}
                                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:underline break-all"
                                >
                                  <FiPhone size={15} />
                                  {m.phone}
                                </a>
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                  {t("inbox.noPhone", {
                                    defaultValue:
                                      "Keine Telefonnummer angegeben",
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                              <FiMessageSquare />
                              {t("inbox.messageTitle", {
                                defaultValue: "Nachricht",
                              })}
                            </div>

                            <p className="text-sm leading-6 text-gray-700 dark:text-gray-200 whitespace-pre-line">
                              {m.message ||
                                t("inbox.noMessage", {
                                  defaultValue: "Keine Nachricht vorhanden.",
                                })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="xl:w-auto xl:min-w-[220px]">
                        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50 p-4 h-full flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                              {t("inbox.actionsTitle", {
                                defaultValue: "Aktionen",
                              })}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {t("inbox.actionsText", {
                                defaultValue:
                                  "Sie können direkt per E-Mail auf diese Anfrage antworten.",
                              })}
                            </p>
                          </div>

                          {m.email ? (
                            <a
                              href={`mailto:${m.email}?subject=${encodeURIComponent(
                                t("inbox.replySubject", {
                                  defaultValue: `Antwort zu Ihrer Anfrage: ${listingTitle}`,
                                })
                              )}`}
                              className="inline-flex items-center justify-center px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                            >
                              <FiMail className="mr-2" />
                              {t("inbox.replyButton", {
                                defaultValue: "Per E-Mail antworten",
                              })}
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center justify-center px-4 py-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-semibold cursor-not-allowed"
                            >
                              {t("inbox.replyUnavailable", {
                                defaultValue: "Keine Antwort möglich",
                              })}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

function StatsCard({ icon, label, value, color = "blue" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-100 dark:border-amber-900/40",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${styles[color] || styles.blue}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-black/20">
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
            {label}
          </div>
          <div className="text-2xl font-bold leading-none mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default OwnerContactInbox;