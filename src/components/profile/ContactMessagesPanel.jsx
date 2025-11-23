// src/components/profile/ContactMessagesPanel.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const ContactMessagesPanel = () => {
  const { t } = useTranslation("profile");
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

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow">
        <h2 className="text-xl font-semibold mb-3">
          {t("messages.title") || "Kontaktanfragen"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("messages.loading") || "Laden…"}
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {t("messages.title") || "Kontaktanfragen"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("messages.subtitle") ||
              "Hier sehen Sie Anfragen von Interessent:innen zu Ihren Inseraten."}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-400/60 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">
            {t("messages.emptyTitle") || "Noch keine Anfragen."}
          </p>
          <p>
            {t("messages.emptyText") ||
              "Sobald Interessent:innen das Formular ausfüllen, erscheinen die Anfragen hier."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => {
            const date =
              m.sentAt?.toDate?.().toLocaleString("de-DE") ?? "—";
            return (
              <div
                key={m.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
              >
                <div className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {m.name || t("messages.unknownSender")}
                    </span>
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="text-xs text-blue-600 dark:text-blue-400 underline"
                      >
                        {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <span className="text-xs text-gray-500">
                        · {m.phone}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {date}
                    {m.listingTitle && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-medium">
                          {m.listingTitle}
                        </span>
                      </>
                    )}
                  </div>

                  {m.message && (
                    <p className="mt-2 text-gray-800 dark:text-gray-100 whitespace-pre-line">
                      {m.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-start md:items-end">
                  {m.listingId && (
                    <Link
                      to={`/listing/${m.listingId}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {t("messages.openListing") || "Zum Inserat"}
                    </Link>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("messages.replyEmail") || "Per E-Mail antworten"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ContactMessagesPanel;
