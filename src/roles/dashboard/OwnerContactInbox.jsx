// src/roles/dashboard/OwnerContactInbox.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const OwnerContactInbox = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation("contact"); // oder eigener Namespace, wenn du willst

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Variante 1: nach ownerId, falls du das Feld ergänzt hast
    // const q = query(
    //   collection(db, "contacts"),
    //   where("ownerId", "==", currentUser.uid)
    // );

    // Variante 2: nach ownerEmail (funktioniert sofort mit deinem jetzigen Stand)
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

        // Nach Datum sortieren (neueste oben)
        data.sort((a, b) => {
          const ta = a.sentAt?.toDate?.() ?? 0;
          const tb = b.sentAt?.toDate?.() ?? 0;
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
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-gray-500 dark:text-gray-400">
          {t("inbox.loginRequired", {
            defaultValue: "Bitte melden Sie sich an, um Ihre Kontaktanfragen zu sehen.",
          })}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p>{t("inbox.loading", { defaultValue: "Lade Kontaktanfragen …" })}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        {t("inbox.title", { defaultValue: "Kontaktanfragen zu Ihren Immobilien" })}
      </h1>

      {messages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          {t("inbox.empty", {
            defaultValue:
              "Aktuell liegen keine Kontaktanfragen vor. Sobald Interessent:innen schreiben, erscheinen sie hier.",
          })}
        </p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => {
            const sentAt = m.sentAt?.toDate?.();
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {m.listingTitle || t("inbox.noTitle", { defaultValue: "Ohne Titel" })}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sentAt
                        ? sentAt.toLocaleString("de-DE")
                        : t("inbox.noDate", { defaultValue: "Datum unbekannt" })}
                    </p>
                  </div>
                  <div className="text-sm text-right md:text-left">
                    <p className="font-medium">
                      {m.name || t("inbox.unknownSender", { defaultValue: "Unbekannte:r Interessent:in" })}
                    </p>
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {m.email}
                      </a>
                    )}
                    {m.phone && <p className="text-gray-500 dark:text-gray-400">{m.phone}</p>}
                  </div>
                </div>

                {m.message && (
                  <p className="mt-3 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">
                    {m.message}
                  </p>
                )}

                {m.email && (
                  <div className="mt-4 flex justify-end">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(
                        `Antwort zu Ihrer Anfrage: ${m.listingTitle || ""}`
                      )}`}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      {t("inbox.replyButton", { defaultValue: "Per E-Mail antworten" })}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerContactInbox;
