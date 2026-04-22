import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import {
  FiInbox,
  FiMail,
  FiPhone,
  FiClock,
  FiExternalLink,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";

const ContactMessagesPanel = () => {
  const { t, i18n } = useTranslation("profile");
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "contacts"),
      where("ownerEmail", "==", currentUser.email),
      orderBy("sentAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error("[ContactMessagesPanel] onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser?.email]);

  const locale = useMemo(() => {
    const lng = i18n?.language?.toLowerCase?.() || "de";
    return lng.startsWith("en") ? "en-GB" : "de-DE";
  }, [i18n?.language]);

  const totalCount = messages.length;

  if (loading) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
              <FiInbox className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("messages.title", { defaultValue: "Kontaktanfragen" })}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("messages.subtitle", {
                  defaultValue:
                    "Hier sehen Sie Anfragen von Interessent:innen zu Ihren Inseraten.",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-3xl border border-gray-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-3 w-64 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-5 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
              <FiInbox className="text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("messages.title", { defaultValue: "Kontaktanfragen" })}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("messages.subtitle", {
                  defaultValue:
                    "Hier sehen Sie Anfragen von Interessent:innen zu Ihren Inseraten.",
                })}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <FiMessageSquare />
            {totalCount}{" "}
            {t("messages.countLabel", {
              defaultValue: "Nachrichten",
            })}
          </div>
        </div>
      </div>

      {/* Empty */}
      {messages.length === 0 ? (
        <div className="p-6">
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
              <FiInbox className="text-2xl" />
            </div>

            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              {t("messages.emptyTitle", {
                defaultValue: "Noch keine Anfragen.",
              })}
            </p>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("messages.emptyText", {
                defaultValue:
                  "Sobald Interessent:innen das Formular ausfüllen, erscheinen die Anfragen hier.",
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-6">
          {messages.map((m) => {
            const date =
              m.sentAt?.toDate?.().toLocaleString(locale) ?? "—";

            const senderName =
              m.name ||
              t("messages.unknownSender", {
                defaultValue: "Unbekannter Absender",
              });

            const listingTitle =
              m.listingTitle ||
              t("messages.unknownListing", {
                defaultValue: "Unbekanntes Inserat",
              });

            return (
              <article
                key={m.id}
                className="group rounded-[24px] border border-gray-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  {/* Left content */}
                  <div className="min-w-0 flex-1">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white">
                        <FiUser className="text-slate-500 dark:text-slate-300" />
                        <span className="truncate">{senderName}</span>
                      </div>

                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                          <FiMail />
                          <span className="truncate">{m.email}</span>
                        </a>
                      )}

                      {m.phone && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <FiPhone />
                          {m.phone}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <FiClock />
                        {date}
                      </span>

                      <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                        <FiExternalLink />
                        {listingTitle}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
                        {m.message ||
                          t("messages.noMessage", {
                            defaultValue: "Keine Nachricht vorhanden.",
                          })}
                      </p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex w-full shrink-0 flex-col gap-2 xl:w-auto xl:min-w-[210px]">
                    {m.listingId && (
                      <Link
                        to={`/listing/${m.listingId}`}
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {t("messages.openListing", {
                          defaultValue: "Zum Inserat",
                        })}
                      </Link>
                    )}

                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        {t("messages.replyEmail", {
                          defaultValue: "Per E-Mail antworten",
                        })}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ContactMessagesPanel;